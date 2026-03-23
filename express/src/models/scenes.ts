import { Collection, ObjectId } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";
import {
  BaseModelBlueprint,
  createTimestamps,
  ensureObjectId,
  ModelBlueprint,
  ModelDocument,
  ModelInsertInput,
  touchTimestamps,
} from "./types";

export interface SceneTodoItem {
  text: string;
  isDone: boolean;
}

export interface SceneDefinition extends BaseModelBlueprint {
  title: string;
  description: string;
  plotId: ObjectId;
  tags: ObjectId[];
  todo: SceneTodoItem[];
  scene?: string;
  verticalIndex: number;
}

export type SceneBlueprint = ModelBlueprint<SceneDefinition>;
export type SceneDocument = ModelDocument<SceneDefinition>;

export const getScenesCollection = (): Collection<SceneDocument> =>
  getCollection<SceneDocument>(COLLECTIONS.scenes);

export const ensureSceneIndexes = async (): Promise<void> => {
  const collection = getScenesCollection();
  await collection.createIndex({ plotId: 1 });
  await collection.createIndex(
    { plotId: 1, verticalIndex: 1 },
    { unique: true },
  );
};

export const shiftSceneIndices = async (
  plotId: ObjectId,
  fromIndex: number,
  excludeId?: ObjectId,
): Promise<void> => {
  const collection = getScenesCollection();
  const filter: Record<string, unknown> = {
    plotId,
    verticalIndex: { $gte: fromIndex },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await collection.updateMany(filter, { $inc: { verticalIndex: 1 } });
};

export interface CreateSceneInput {
  title: string;
  description: string;
  plotId: string | ObjectId;
  tags?: Array<string | ObjectId>;
  todo?: SceneTodoItem[];
  scene?: string;
  verticalIndex: number;
}

export const createScene = async (
  input: CreateSceneInput,
): Promise<SceneDocument> => {
  const collection = getScenesCollection();
  const plotId = ensureObjectId(input.plotId, "plotId");

  if (input.verticalIndex < 0) {
    throw new Error("verticalIndex must be >= 0");
  }
  const tagIds = (input.tags ?? []).map((tagId) =>
    ensureObjectId(tagId, "tagId"),
  );

  const payload: ModelInsertInput<SceneDefinition> = {
    title: input.title,
    description: input.description,
    plotId,
    tags: tagIds,
    todo: input.todo ?? [],
    verticalIndex: input.verticalIndex,
    ...createTimestamps(),
  };

  if (input.scene !== undefined) {
    payload.scene = input.scene;
  }

  const result = await collection.insertOne(
    payload as unknown as SceneDocument,
  );
  return { ...payload, _id: result.insertedId };
};

export interface ListScenesOptions {
  limit?: number;
  plotId?: string | ObjectId;
}

export const listScenes = async (
  options: ListScenesOptions = {},
): Promise<SceneDocument[]> => {
  const collection = getScenesCollection();
  const limit = options.limit ?? 50;
  const filter = options.plotId
    ? { plotId: ensureObjectId(options.plotId, "plotId") }
    : {};

  return collection.find(filter).limit(limit).toArray();
};

export const listScenesByPlotIds = async (
  plotIds: Array<string | ObjectId>,
): Promise<SceneDocument[]> => {
  const collection = getScenesCollection();
  const uniqueIds = Array.from(
    new Set(plotIds.map((id) => ensureObjectId(id, "plotId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return [];
  }

  return collection.find({ plotId: { $in: uniqueIds } }).toArray();
};

export const countScenesByPlotIds = async (
  plotIds: Array<string | ObjectId>,
): Promise<number> => {
  const collection = getScenesCollection();
  const uniqueIds = Array.from(
    new Set(plotIds.map((id) => ensureObjectId(id, "plotId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return 0;
  }

  return collection.countDocuments({ plotId: { $in: uniqueIds } });
};

export const getSceneById = async (
  id: string | ObjectId,
): Promise<SceneDocument | null> => {
  const collection = getScenesCollection();
  return collection.findOne({ _id: ensureObjectId(id, "sceneId") });
};

export interface UpdateSceneInput {
  title?: string;
  description?: string;
  plotId?: string | ObjectId;
  tags?: Array<string | ObjectId>;
  todo?: SceneTodoItem[];
  scene?: string;
  verticalIndex?: number;
}

export const updateSceneById = async (
  id: string | ObjectId,
  updates: UpdateSceneInput,
): Promise<SceneDocument | null> => {
  const collection = getScenesCollection();
  const sceneId = ensureObjectId(id, "sceneId");
  const updatePayload: Partial<SceneDefinition> = {};

  if (updates.title !== undefined) {
    updatePayload.title = updates.title;
  }

  if (updates.description !== undefined) {
    updatePayload.description = updates.description;
  }

  if (updates.scene !== undefined) {
    updatePayload.scene = updates.scene;
  }

  if (updates.todo !== undefined) {
    updatePayload.todo = updates.todo;
  }

  let plotId: ObjectId | undefined;
  if (updates.plotId) {
    plotId = ensureObjectId(updates.plotId, "plotId");
    updatePayload.plotId = plotId;
  }

  if (updates.verticalIndex !== undefined) {
    if (updates.verticalIndex < 0) {
      throw new Error("verticalIndex must be >= 0");
    }

    updatePayload.verticalIndex = updates.verticalIndex;
  }

  if (updates.tags) {
    const tagIds = updates.tags.map((tagId) => ensureObjectId(tagId, "tagId"));

    updatePayload.tags = tagIds;
  }

  const result = await collection.findOneAndUpdate(
    { _id: sceneId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result?.value ?? null;
};

export const deleteSceneById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getScenesCollection();
  const result = await collection.deleteOne({
    _id: ensureObjectId(id, "sceneId"),
  });

  return result.deletedCount === 1;
};
