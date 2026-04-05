import { Collection, Filter, ObjectId } from "mongodb";
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
  tagVariants?: SceneTagVariant[];
  todo: SceneTodoItem[];
  verticalIndex: number;
  pov?: ObjectId | null;
  deletedAt?: Date | null;
}

export interface SceneTagVariant {
  tagId: ObjectId;
  variant: string;
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
    {
      unique: true,
      partialFilterExpression: { deletedAt: { $eq: null } },
    },
  );
};

const activeSceneFilter = (filter: Record<string, unknown> = {}) => ({
  ...filter,
  deletedAt: null,
});

/**
 * @deprecated An example that shouldn't be in use
 */
export const shiftScenesByIds = async (
  plotId: ObjectId,
  sceneIds: ObjectId[],
  shift: 1 | -1,
) => {
  const collection = getScenesCollection();

  await collection.updateMany(
    activeSceneFilter({ plotId, _id: { $in: sceneIds } }),
    { $inc: { verticalIndex: shift } },
  );

  // return updated documents
  return collection
    .find(activeSceneFilter({ plotId, _id: { $in: sceneIds } }))
    .toArray();
};

/**
 * @deprecated An example that shouldn't be in use
 */
export const shiftScenesByRange = async (
  plotId: ObjectId,
  minIndex: number | undefined,
  maxIndex: number | undefined,
  shift: 1 | -1,
  excludeId?: ObjectId,
) => {
  const collection = getScenesCollection();

  const verticalIndexFilter: Partial<{ $gte: number; $lte: number }> = {};

  if (minIndex !== undefined) {
    verticalIndexFilter.$gte = minIndex;
  }

  if (maxIndex !== undefined) {
    verticalIndexFilter.$lte = maxIndex;
  }

  const filter: Record<string, unknown> = activeSceneFilter({
    plotId,
    verticalIndex: verticalIndexFilter,
  });

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await collection.updateMany(filter, { $inc: { verticalIndex: shift } });

  return collection.find(filter).toArray();
};

export const shiftScenesUpwardFromIndex = async (
  plotId: ObjectId,
  fromIndex: number,
) => {
  const collection = getScenesCollection();

  await collection.updateMany(
    activeSceneFilter({
      plotId,
      verticalIndex: { $gte: fromIndex },
    }),
    { $inc: { verticalIndex: 1 } },
  );

  return collection
    .find(
      activeSceneFilter({
        plotId,
        verticalIndex: { $gte: fromIndex },
      }),
    )
    .toArray();
};

export interface CreateSceneInput {
  title: string;
  description: string;
  plotId: string | ObjectId;
  tags?: Array<string | ObjectId>;
  tagVariants?: Array<SceneTagVariantInput>;
  todo?: SceneTodoItem[];
  scene?: string;
  verticalIndex: number;
  pov?: string | ObjectId | null;
}

export interface SceneTagVariantInput {
  tagId: string | ObjectId;
  variant: string;
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
  const tagVariants = input.tagVariants?.map((entry) => ({
    tagId: ensureObjectId(entry.tagId, "tagId"),
    variant: entry.variant,
  }));

  const payload: ModelInsertInput<SceneDefinition> = {
    title: input.title,
    description: input.description,
    plotId,
    tags: tagIds,
    ...(tagVariants && { tagVariants }),
    todo: input.todo ?? [],
    verticalIndex: input.verticalIndex,
    deletedAt: null,
    ...createTimestamps(),
  };

  if (input.pov !== undefined) {
    payload.pov = input.pov === null ? null : ensureObjectId(input.pov, "pov");
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
  const limit = options.limit ?? 500;
  const filter = options.plotId
    ? { plotId: ensureObjectId(options.plotId, "plotId") }
    : {};

  return collection.find(activeSceneFilter(filter)).limit(limit).toArray();
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

  return collection
    .find(activeSceneFilter({ plotId: { $in: uniqueIds } }))
    .toArray();
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

  return collection.countDocuments(
    activeSceneFilter({ plotId: { $in: uniqueIds } }),
  );
};

export const countScenesByTagId = async (
  tagId: string | ObjectId,
): Promise<number> => {
  const collection = getScenesCollection();
  return collection.countDocuments(
    activeSceneFilter({ tags: ensureObjectId(tagId, "tagId") }),
  );
};

export const countScenesByTagVariant = async (
  tagId: string | ObjectId,
  variant: string,
): Promise<number> => {
  const collection = getScenesCollection();
  return collection.countDocuments(
    activeSceneFilter({
      tagVariants: {
        $elemMatch: {
          tagId: ensureObjectId(tagId, "tagId"),
          variant,
        },
      },
    }),
  );
};

export const countScenesByPovCharacter = async (
  characterId: string | ObjectId,
): Promise<number> => {
  const collection = getScenesCollection();
  return collection.countDocuments(
    activeSceneFilter({
      pov: ensureObjectId(characterId, "characterId"),
    }),
  );
};

export const getSceneById = async (
  id: string | ObjectId,
): Promise<SceneDocument | null> => {
  const collection = getScenesCollection();
  return collection.findOne(
    activeSceneFilter({ _id: ensureObjectId(id, "sceneId") }),
  );
};

export const getSceneByIdForPlotIds = async (
  id: string | ObjectId,
  plotIds: Array<string | ObjectId>,
): Promise<SceneDocument | null> => {
  const collection = getScenesCollection();
  const sceneId = ensureObjectId(id, "sceneId");
  const uniquePlotIds = Array.from(
    new Set(
      plotIds.map((plotId) => ensureObjectId(plotId, "plotId").toHexString()),
    ),
  ).map((value) => new ObjectId(value));

  if (uniquePlotIds.length === 0) {
    return null;
  }

  return collection.findOne(
    activeSceneFilter({ _id: sceneId, plotId: { $in: uniquePlotIds } }),
  );
};

export const getSceneByVerticalIndex = async (
  plotId: string | ObjectId,
  verticalIndex: number,
): Promise<SceneDocument | null> => {
  const collection = getScenesCollection();
  return collection.findOne(
    activeSceneFilter({
      plotId: ensureObjectId(plotId, "plotId"),
      verticalIndex,
    }),
  );
};

export interface UpdateSceneInput {
  title?: string;
  description?: string;
  plotId?: string | ObjectId;
  tags?: Array<string | ObjectId>;
  tagVariants?: Array<SceneTagVariantInput>;
  todo?: SceneTodoItem[];
  scene?: string;
  verticalIndex?: number;
  pov?: string | ObjectId | null;
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

  if (updates.todo !== undefined) {
    updatePayload.todo = updates.todo;
  }

  if (updates.pov !== undefined) {
    updatePayload.pov =
      updates.pov === null ? null : ensureObjectId(updates.pov, "pov");
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

  if (updates.tagVariants) {
    updatePayload.tagVariants = updates.tagVariants.map((entry) => ({
      tagId: ensureObjectId(entry.tagId, "tagId"),
      variant: entry.variant,
    }));
  }

  const result = await collection.findOneAndUpdate(
    { _id: sceneId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};

export const deleteSceneById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getScenesCollection();
  const result = await collection.findOneAndUpdate(
    activeSceneFilter({ _id: ensureObjectId(id, "sceneId") }),
    { $set: { deletedAt: new Date(), ...touchTimestamps() } },
  );

  return Boolean(result);
};

export const sceneMoveRequiresShift = (
  targetPlotId: string,
  targetVerticalIndex: number,
) => {};

/**
 * @deprecated An example that shouldn't be in use
 */
export const getScenesByPlotIdAndVerticalIndexRange = async (
  plotId: ObjectId,
  sceneId: ObjectId,
  isMovingUp: boolean,
  rangeStart: number,
  rangeEnd: number,
) => {
  const collection = getScenesCollection();

  const filter: Filter<SceneDocument> = {
    plotId,
    verticalIndex: isMovingUp
      ? { $gte: rangeStart, $lt: rangeEnd }
      : { $gt: rangeStart, $lte: rangeEnd },
    _id: { $ne: sceneId },
  };
  const affectedScenes = await collection
    .find(activeSceneFilter(filter))
    .sort({ verticalIndex: 1 })
    .toArray();

  const sceneInFront = await collection.findOne(
    activeSceneFilter({
      plotId,
      verticalIndex: isMovingUp ? rangeEnd + 1 : rangeStart - 1,
    }),
  );

  const sceneInBack = await collection.findOne(
    activeSceneFilter({
      plotId,
      verticalIndex: isMovingUp ? rangeStart - 1 : rangeEnd + 1,
    }),
  );

  const sceneInSpot = await collection.findOne(
    activeSceneFilter({
      plotId,
      verticalIndex: isMovingUp ? rangeEnd : rangeStart,
    }),
  );

  return {
    affectedScenes,
    sceneInFront,
    sceneInBack,
    sceneInSpot,
  };
};
