import { ObjectId } from "mongodb";
import {
  createScene as createSceneModel,
  CreateSceneInput,
  deleteSceneById,
  getSceneById,
  getSceneByIdForPlotIds,
  SceneDocument,
  SceneTagVariantInput,
  updateSceneById as updateSceneByIdModel,
  UpdateSceneInput,
  getSceneByVerticalIndex,
  shiftScenesUpwardFromIndex,
} from "../models/scenes";
import { getCharacterById } from "../models/characters";
import { getPlotById, listPlotIdsByStoryId } from "../models/plots";
import { listTagsByIds } from "../models/tags";
import { ensureObjectId } from "../models/types";
import { getPlotForStory } from "./plotService";

const assertPlotExists = async (plotId: string | ObjectId) => {
  const plot = await getPlotById(plotId);
  if (!plot) {
    throw new Error("Plot not found");
  }
  return plot;
};

const assertSceneExists = async (sceneId: string | ObjectId) => {
  const scene = await getSceneById(sceneId);
  if (!scene) {
    throw new Error("Scene not found");
  }
  return scene;
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

const assertTagVariantsValid = async (
  storyId: ObjectId,
  tagVariants: SceneTagVariantInput[],
  tagIds?: ObjectId[],
): Promise<void> => {
  if (tagVariants.length === 0) {
    return;
  }

  const uniqueIds = Array.from(
    new Set(
      tagVariants.map((entry) =>
        ensureObjectId(entry.tagId, "tagId").toHexString(),
      ),
    ),
  ).map((value) => new ObjectId(value));
  const tags = await listTagsByIds(uniqueIds);

  if (tags.length !== uniqueIds.length) {
    throw new Error("Tag variants must belong to the same story");
  }

  for (const entry of tagVariants) {
    const tagId = ensureObjectId(entry.tagId, "tagId").toHexString();
    const tag = tags.find((candidate) => candidate._id.toHexString() === tagId);

    if (!tag || tag.storyId.toHexString() !== storyId.toHexString()) {
      throw new Error("Tag variants must belong to the same story");
    }

    if (tagIds && !tagIds.some((id) => id.toHexString() === tagId)) {
      throw new Error("Tag variants must reference selected tags");
    }

    if (!tag.variant) {
      throw new Error("Tag variants must reference variant-enabled tags");
    }

    if (!tag.variants.includes(entry.variant)) {
      throw new Error("Tag variants must use a valid variant");
    }
  }
};

const assertPlotScenePositionIsOpen = async (
  plotId: ObjectId,
  verticalIndex: number,
): Promise<void> => {
  const found = await getSceneByVerticalIndex(plotId, verticalIndex);
  if (found) {
    throw new Error("Scene verticalIndex is already occupied");
  }
};

const assertPovBelongsToStory = async (
  storyId: ObjectId,
  povId: string | ObjectId,
): Promise<void> => {
  const character = await getCharacterById(povId);
  if (!character) {
    throw new Error("POV character not found");
  }

  if (character.storyId.toHexString() !== storyId.toHexString()) {
    throw new Error("POV character must belong to the same story");
  }
};

export const getSceneForStory = async (
  storyId: string | ObjectId,
  sceneId: string | ObjectId,
): Promise<SceneDocument | null> => {
  const plotIds = await listPlotIdsByStoryId(storyId);
  return getSceneByIdForPlotIds(sceneId, plotIds);
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
  if (input.tagVariants) {
    await assertTagVariantsValid(plot.storyId, input.tagVariants, tagIds);
  }
  if (input.pov) {
    await assertPovBelongsToStory(plot.storyId, input.pov);
  }

  return createSceneModel({
    ...input,
    plotId: plot._id,
    tags: tagIds,
  });
};

export const createSceneForStory = async (
  storyId: string | ObjectId,
  input: CreateSceneInput,
): Promise<SceneDocument> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const plot = await assertPlotExists(input.plotId);

  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    throw new Error("Plot not found");
  }

  return createScene({
    ...input,
    plotId: plot._id,
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
  }

  if (updates.pov !== undefined && updates.pov !== null) {
    await assertPovBelongsToStory(plot.storyId, updates.pov);
  }

  let tagIds: ObjectId[] | undefined;
  if (updates.tags) {
    tagIds = updates.tags.map((tagId) => ensureObjectId(tagId, "tagId"));
    await assertTagsBelongToStory(plot.storyId, tagIds);
  }

  if (updates.tagVariants) {
    const baseTagIds = tagIds ?? current.tags;
    await assertTagVariantsValid(plot.storyId, updates.tagVariants, baseTagIds);
  }

  return updateSceneByIdModel(id, {
    ...updates,
    ...(updates.plotId !== undefined && { plotId: plot._id }),
    ...(tagIds !== undefined && { tags: tagIds }),
  });
};

export const updateSceneForStory = async (
  storyId: string | ObjectId,
  sceneId: string | ObjectId,
  updates: UpdateSceneInput,
): Promise<SceneDocument | null> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSceneForStory(storyObjectId, sceneId);
  if (!current) {
    return null;
  }

  const targetPlotId = updates.plotId ?? current.plotId;
  const plot = await assertPlotExists(targetPlotId);
  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    throw new Error("Plot not found");
  }
  if (updates.verticalIndex !== undefined) {
    if (updates.verticalIndex < 0) {
      throw new Error("verticalIndex must be >= 0");
    }
  }
  if (updates.pov !== undefined && updates.pov !== null) {
    await assertPovBelongsToStory(plot.storyId, updates.pov);
  }

  let tagIds: ObjectId[] | undefined;
  if (updates.tags) {
    tagIds = updates.tags.map((tagId) => ensureObjectId(tagId, "tagId"));
    await assertTagsBelongToStory(plot.storyId, tagIds);
  }

  if (updates.tagVariants) {
    const baseTagIds = tagIds ?? current.tags;
    await assertTagVariantsValid(plot.storyId, updates.tagVariants, baseTagIds);
  }

  return updateSceneByIdModel(sceneId, {
    ...updates,
    ...(updates.plotId !== undefined && { plotId: plot._id }),
    ...(tagIds !== undefined && { tags: tagIds }),
  });
};

export const deleteSceneForStory = async (
  storyId: string | ObjectId,
  sceneId: string | ObjectId,
): Promise<boolean> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSceneForStory(storyObjectId, sceneId);
  if (!current) {
    return false;
  }

  const plot = await assertPlotExists(current.plotId);
  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    return false;
  }

  return deleteSceneById(sceneId);
};

export type MoveSingleSceneWithinPlotInput = {
  fromPlotId: string | ObjectId;
  toPlotId: string | ObjectId;
  sceneId: string | ObjectId;
  fromIndex: number;
  toIndex: number;
};
export const moveSingleCardWithinPlot = async (
  input: MoveSingleSceneWithinPlotInput,
) => {
  const fromPlotId = ensureObjectId(input.fromPlotId, "fromPlotId");
  const toPlotId = ensureObjectId(input.toPlotId, "toPlotId");
  const sceneId = ensureObjectId(input.sceneId, "sceneId");

  const plot = await assertPlotExists(toPlotId);
  const scene = await assertSceneExists(sceneId);

  const { /* fromIndex, */ toIndex } = input;

  // step 1: check if a shift is required.
  const shouldShiftOnIndex = await sceneMoveRequiresShift(toPlotId, toIndex);

  // step 2: shift scenes and return resources
  const scenesToUpdate: SceneDocument[] = [];
  if (shouldShiftOnIndex) {
    const { scenes: shiftedScenes } = await shiftGridUpwardOnIndex({
      verticalIndex: toIndex,
      storyId: plot.storyId,
    });
    scenesToUpdate.push(...shiftedScenes);
  }

  // step 3: move target scene to new index
  await assertPlotScenePositionIsOpen(toPlotId, toIndex);

  const updatedScene = await updateSceneById(sceneId, {
    verticalIndex: toIndex,
    plotId: toPlotId,
  });
  if (updatedScene) {
    scenesToUpdate.push(updatedScene);
  }

  return {
    scenes: scenesToUpdate,
  };
};

export const sceneMoveRequiresShift = async (
  targetPlotId: ObjectId,
  targetVerticalIndex: number,
): Promise<boolean> => {
  // step 1: Check if there is anything on that index.
  // Currently, only checking scenes. Add more resources here.

  const existingScene = await getSceneByVerticalIndex(
    targetPlotId,
    targetVerticalIndex,
  );

  // step 2: if any resources are found, return true
  // Currently only checking existingScene scene
  return Boolean(existingScene);
};

export const shiftGridUpwardOnIndex = async ({
  verticalIndex,
  storyId,
}: {
  verticalIndex: number;
  storyId: ObjectId;
}): Promise<{ scenes: SceneDocument[] }> => {
  // step 1: collect necessary resources
  const plotsIds = await listPlotIdsByStoryId(storyId);

  // step 2: shift resources
  const scenes: SceneDocument[] = [];
  for (const plotId of plotsIds) {
    const shiftedScenes = await shiftScenesUpwardFromIndex(
      plotId,
      verticalIndex,
    );
    scenes.push(...shiftedScenes);
  }

  // 3: return shifted resources. Currently only scenes.
  return {
    scenes,
  };
};
