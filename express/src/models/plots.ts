import { ClientSession, Collection, ObjectId } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";
import {
  BaseModelBlueprint,
  createTimestamps,
  ensureObjectId,
  ModelBlueprint,
  ModelDocument,
  touchTimestamps,
} from "./types";

export interface PlotDefinition extends BaseModelBlueprint {
  title: string;
  description: string;
  color: string;
  storyId: ObjectId;
  horizontalIndex: number;
  deletedAt?: Date | null;
}

export type PlotBlueprint = ModelBlueprint<PlotDefinition>;
export type PlotDocument = ModelDocument<PlotDefinition>;

export const getPlotsCollection = (): Collection<PlotDocument> =>
  getCollection<PlotDocument>(COLLECTIONS.plots);

export const ensurePlotIndexes = async (): Promise<void> => {
  const collection = getPlotsCollection();
  await collection.createIndex({ storyId: 1 });
  await collection.createIndex(
    { storyId: 1, horizontalIndex: 1 },
    {
      unique: true,
      partialFilterExpression: { deletedAt: { $eq: null } },
    },
  );
};

const activePlotFilter = (filter: Record<string, unknown> = {}) => ({
  ...filter,
  deletedAt: { $eq: null },
});

export const shiftPlotIndices = async (
  plot: PlotDocument,
  toIndex: number,
): Promise<void> => {
  const fromIndex = plot.horizontalIndex;
  if (toIndex === fromIndex) {
    return;
  }

  const isMovingUp = toIndex > fromIndex;
  const collection = getPlotsCollection();

  const filter: Record<string, unknown> = {
    storyId: plot.storyId,
    horizontalIndex: isMovingUp
      ? { $gte: fromIndex, $lte: toIndex }
      : { $lte: fromIndex, $gte: toIndex },
    _id: { $ne: plot._id },
  };

  await collection.updateMany(activePlotFilter(filter), {
    $inc: { horizontalIndex: isMovingUp ? -1 : 1 },
  });
};

export const shiftPlotsLeftFromIndex = async (
  storyId: string | ObjectId,
  fromIndexExclusive: number,
): Promise<number> => {
  const collection = getPlotsCollection();
  const result = await collection.updateMany(
    activePlotFilter({
      storyId: ensureObjectId(storyId, "storyId"),
      horizontalIndex: { $gt: fromIndexExclusive },
    }),
    {
      $inc: { horizontalIndex: -1 },
      $set: { ...touchTimestamps() },
    },
  );

  return result.modifiedCount;
};

export interface CreatePlotInput {
  title: string;
  description: string;
  color: string;
  storyId: string | ObjectId;
  horizontalIndex: number;
}

export const createPlot = async (
  input: CreatePlotInput,
  session?: ClientSession,
): Promise<PlotDocument> => {
  const collection = getPlotsCollection();
  const storyId = ensureObjectId(input.storyId, "storyId");

  if (input.horizontalIndex < 0) {
    throw new Error("horizontalIndex must be >= 0");
  }

  const payload: PlotDocument = {
    _id: new ObjectId(),
    title: input.title,
    description: input.description,
    color: input.color,
    storyId,
    horizontalIndex: input.horizontalIndex,
    deletedAt: null,
    ...createTimestamps(),
  };

  await collection.insertOne(payload, session ? { session } : {});
  return payload;
};

export interface ListPlotsOptions {
  limit?: number;
  storyId?: string | ObjectId;
}

export const listPlots = async (
  options: ListPlotsOptions = {},
): Promise<PlotDocument[]> => {
  const collection = getPlotsCollection();
  const limit = options.limit ?? 50;
  const filter = options.storyId
    ? { storyId: ensureObjectId(options.storyId, "storyId") }
    : {};

  return collection
    .find(activePlotFilter(filter))
    .limit(limit)
    .sort({ horizontalIndex: 1 })
    .toArray();
};

export const countPlotsByStoryId = async (
  storyId: string | ObjectId,
): Promise<number> => {
  const collection = getPlotsCollection();
  return collection.countDocuments({
    storyId: ensureObjectId(storyId, "storyId"),
    deletedAt: { $eq: null },
  });
};

export const listPlotIdsByStoryId = async (
  storyId: string | ObjectId,
): Promise<ObjectId[]> => {
  const collection = getPlotsCollection();
  const results = await collection
    .find(activePlotFilter({ storyId: ensureObjectId(storyId, "storyId") }), {
      projection: { _id: 1 },
    })
    .sort({ horizontalIndex: 1 })
    .toArray();

  return results.map((plot) => plot._id);
};

export const listPlotsByIds = async (
  ids: Array<string | ObjectId>,
): Promise<PlotDocument[]> => {
  const collection = getPlotsCollection();
  const uniqueIds = Array.from(
    new Set(ids.map((id) => ensureObjectId(id, "plotId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return [];
  }

  return collection
    .find(activePlotFilter({ _id: { $in: uniqueIds } }))
    .sort({ horizontalIndex: 1 })
    .toArray();
};

export const getPlotById = async (
  id: string | ObjectId,
): Promise<PlotDocument | null> => {
  const collection = getPlotsCollection();
  return collection.findOne(
    activePlotFilter({ _id: ensureObjectId(id, "plotId") }),
  );
};

export interface UpdatePlotInput {
  title?: string;
  description?: string;
  color?: string;
  storyId?: string | ObjectId;
  horizontalIndex?: number;
}

export const updatePlotById = async (
  id: string | ObjectId,
  updates: UpdatePlotInput,
): Promise<PlotDocument | null> => {
  const collection = getPlotsCollection();
  const plotId = ensureObjectId(id, "plotId");
  const updatePayload: Partial<PlotDefinition> = {};

  if (updates.title !== undefined) {
    updatePayload.title = updates.title;
  }

  if (updates.description !== undefined) {
    updatePayload.description = updates.description;
  }

  if (updates.color !== undefined) {
    updatePayload.color = updates.color;
  }

  if (updates.horizontalIndex !== undefined) {
    updatePayload.horizontalIndex = updates.horizontalIndex;
  }

  if (updates.storyId !== undefined) {
    updatePayload.storyId = ensureObjectId(updates.storyId, "storyId");
  }

  if (updates.horizontalIndex !== undefined && updates.horizontalIndex < 0) {
    throw new Error("horizontalIndex must be >= 0");
  }

  const result = await collection.findOneAndUpdate(
    activePlotFilter({ _id: plotId }),
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};

export const deletePlotById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getPlotsCollection();
  const result = await collection.findOneAndUpdate(
    activePlotFilter({ _id: ensureObjectId(id, "plotId") }),
    { $set: { deletedAt: new Date(), ...touchTimestamps() } },
  );

  return Boolean(result);
};

export const duplicatePlotsByStory = async (
  sourceStoryId: string | ObjectId,
  targetStoryId: string | ObjectId,
  session?: ClientSession,
): Promise<Map<string, ObjectId>> => {
  const collection = getPlotsCollection();
  const sid = ensureObjectId(sourceStoryId, "sourceStoryId");
  const tid = ensureObjectId(targetStoryId, "targetStoryId");

  const sourcePlots = await collection
    .find(activePlotFilter({ storyId: sid }))
    .sort({ horizontalIndex: 1 })
    .toArray();

  const idMap = new Map<string, ObjectId>();

  if (sourcePlots.length === 0) {
    return idMap;
  }

  const docs: PlotDocument[] = sourcePlots.map((plot) => {
    const newId = new ObjectId();
    idMap.set(plot._id.toHexString(), newId);
    return {
      _id: newId,
      title: plot.title,
      description: plot.description,
      color: plot.color,
      storyId: tid,
      horizontalIndex: plot.horizontalIndex,
      deletedAt: null,
      ...createTimestamps(),
    };
  });

  await collection.insertMany(docs, session ? { session } : {});
  return idMap;
};
