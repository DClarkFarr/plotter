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
import { getStoriesCollection } from "./stories";

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

const assertStoryExists = async (storyId: ObjectId): Promise<void> => {
  const stories = getStoriesCollection();
  const story = await stories.findOne({
    _id: storyId,
    deletedAt: { $exists: false },
  });

  if (!story) {
    throw new Error("Story not found");
  }
};

const shiftPlotIndices = async (
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

  await assertStoryExists(storyId);
  await shiftPlotIndices(storyId, input.horizontalIndex);

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

  return collection.find(filter).limit(limit).toArray();
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
    await assertStoryExists(updatePayload.storyId);
  }

  if (updates.horizontalIndex !== undefined) {
    if (updates.horizontalIndex < 0) {
      throw new Error("horizontalIndex must be >= 0");
    }

    const current = await collection.findOne({ _id: plotId });
    if (current) {
      const storyId = updatePayload.storyId ?? current.storyId;
      await shiftPlotIndices(storyId, updates.horizontalIndex, plotId);
    }
  }

  const result = await collection.findOneAndUpdate(
    { _id: plotId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result?.value ?? null;
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
