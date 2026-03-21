import { ObjectId } from "mongodb";
import {
  createScene as createSceneModel,
  CreateSceneInput,
  getSceneById,
  SceneDocument,
  shiftSceneIndices,
  updateSceneById as updateSceneByIdModel,
  UpdateSceneInput,
} from "../models/scenes";
import { getPlotById } from "../models/plots";
import { listTagsByIds } from "../models/tags";
import { ensureObjectId } from "../models/types";

const assertPlotExists = async (plotId: string | ObjectId) => {
  const plot = await getPlotById(plotId);
  if (!plot) {
    throw new Error("Plot not found");
  }
  return plot;
};

const assertTagsBelongToStory = async (
  storyId: ObjectId,
  tagIds: ObjectId[],
): Promise<void> => {
  if (tagIds.length === 0) {
    return;
  }

  const uniqueIds = Array.from(new Set(tagIds.map((id) => id.toHexString())));
  const tags = await listTagsByIds(uniqueIds);

  if (tags.length !== uniqueIds.length) {
    throw new Error("Scene tags must belong to the same story");
  }

  for (const tag of tags) {
    if (tag.storyId.toHexString() !== storyId.toHexString()) {
      throw new Error("Scene tags must belong to the same story");
    }
  }
};

export const createScene = async (
  input: CreateSceneInput,
): Promise<SceneDocument> => {
  if (input.verticalIndex < 0) {
    throw new Error("verticalIndex must be >= 0");
  }

  const plot = await assertPlotExists(input.plotId);
  const tagIds = (input.tags ?? []).map((tagId) =>
    ensureObjectId(tagId, "tagId"),
  );

  await assertTagsBelongToStory(plot.storyId, tagIds);
  await shiftSceneIndices(plot._id, input.verticalIndex);

  return createSceneModel({
    ...input,
    plotId: plot._id,
    tags: tagIds,
  });
};

export const updateSceneById = async (
  id: string | ObjectId,
  updates: UpdateSceneInput,
): Promise<SceneDocument | null> => {
  const current = await getSceneById(id);
  if (!current) {
    return null;
  }

  const targetPlotId = updates.plotId ?? current.plotId;
  const plot = await assertPlotExists(targetPlotId);

  if (updates.verticalIndex !== undefined) {
    if (updates.verticalIndex < 0) {
      throw new Error("verticalIndex must be >= 0");
    }
    await shiftSceneIndices(plot._id, updates.verticalIndex, current._id);
  }

  let tagIds: ObjectId[] | undefined;
  if (updates.tags) {
    tagIds = updates.tags.map((tagId) => ensureObjectId(tagId, "tagId"));
    await assertTagsBelongToStory(plot.storyId, tagIds);
  }

  return updateSceneByIdModel(id, {
    ...updates,
    ...(updates.plotId !== undefined && { plotId: plot._id }),
    ...(tagIds !== undefined && { tags: tagIds }),
  });
};
