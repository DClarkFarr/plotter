import { Collection, ObjectId } from "mongodb";
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
    { unique: true },
  );
};

export const shiftPlotIndices = async (
  storyId: ObjectId,
  fromIndex: number,
  excludeId?: ObjectId,
): Promise<void> => {
  const collection = getPlotsCollection();
  const filter: Record<string, unknown> = {
    storyId,
    horizontalIndex: { $gte: fromIndex },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await collection.updateMany(filter, { $inc: { horizontalIndex: 1 } });
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
    ...createTimestamps(),
  };

  await collection.insertOne(payload);
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
    .find(filter)
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
  });
};

export const listPlotIdsByStoryId = async (
  storyId: string | ObjectId,
): Promise<ObjectId[]> => {
  const collection = getPlotsCollection();
  const results = await collection
    .find(
      { storyId: ensureObjectId(storyId, "storyId") },
      { projection: { _id: 1 } },
    )
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
    .find({ _id: { $in: uniqueIds } })
    .sort({ horizontalIndex: 1 })
    .toArray();
};

export const getPlotById = async (
  id: string | ObjectId,
): Promise<PlotDocument | null> => {
  const collection = getPlotsCollection();
  return collection.findOne({ _id: ensureObjectId(id, "plotId") });
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
    { _id: plotId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};

export const deletePlotById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getPlotsCollection();
  const result = await collection.deleteOne({
    _id: ensureObjectId(id, "plotId"),
  });

  return result.deletedCount === 1;
};
