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
} from "../models/scenes";
import { SectionDocument } from "../models/sections";
import { getCharacterById } from "../models/characters";
import { getPlotById, listPlotIdsByStoryId } from "../models/plots";
import { listTagsByIds } from "../models/tags";
import { ensureObjectId } from "../models/types";
import {
  ShiftedResources,
  hasSceneOnPlotIndex,
  hasSectionOnIndex,
  shouldShiftAfterSceneRemoval,
  shouldShiftForSceneInsert,
  shiftGridDownwardFromIndex,
  shiftGridInVerticalIndexRange,
  shiftGridUpwardFromIndex,
  getMoveRangeShift,
} from "../utils/plotGridUtils";

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
): Promise<{ scene: SceneDocument; shiftedResources?: ShiftedResources }> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const plot = await assertPlotExists(input.plotId);

  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    throw new Error("Plot not found");
  }

  const shouldShift = await shouldShiftForSceneInsert(
    storyObjectId,
    plot._id,
    input.verticalIndex,
  );
  const shiftedResources = shouldShift
    ? await shiftGridUpwardFromIndex(storyObjectId, input.verticalIndex)
    : undefined;

  await assertPlotScenePositionIsOpen(plot._id, input.verticalIndex);

  const scene = await createScene({
    ...input,
    plotId: plot._id,
  });

  return shiftedResources ? { scene, shiftedResources } : { scene };
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
): Promise<{ deleted: boolean; shiftedResources?: ShiftedResources }> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSceneForStory(storyObjectId, sceneId);
  if (!current) {
    return { deleted: false };
  }

  const plot = await assertPlotExists(current.plotId);
  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    return { deleted: false };
  }

  const removed = await deleteSceneById(sceneId);
  if (!removed) {
    return { deleted: false };
  }

  // For deleting a scene, the plot > vertical index of the deleted scene
  // will never have a scene in that spot after deletion.
  // So in this case, we need to check if there is anything in any of the other plots.
  // Modify shouldShiftAfterSceneRemoval to take just the vertical index.
  const shouldShift = await shouldShiftAfterSceneRemoval(
    storyObjectId,
    plot._id,
    current.verticalIndex,
  );
  if (shouldShift) {
    const shiftedResources = await shiftGridDownwardFromIndex(
      storyObjectId,
      current.verticalIndex,
    );
    return { deleted: true, shiftedResources };
  }

  return { deleted: true };
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
): Promise<{
  scene: SceneDocument | null;
  shiftedResources?: ShiftedResources;
}> => {
  const fromPlotId = ensureObjectId(input.fromPlotId, "fromPlotId");
  const toPlotId = ensureObjectId(input.toPlotId, "toPlotId");
  const sceneId = ensureObjectId(input.sceneId, "sceneId");

  const plot = await assertPlotExists(toPlotId);
  await assertSceneExists(sceneId);

  const { fromIndex, toIndex } = input;

  // step 1: shift the bounded range between indices (if needed)
  // Because we're going to unify getting shifted resources to the frontend,
  // we probably should remove the explicit sending shifted scenes
  // and shifted sections to do it the same way.
  const scenesToUpdate: SceneDocument[] = [];
  const sectionsToUpdate: SectionDocument[] = [];
  const shift = getMoveRangeShift(fromIndex, toIndex);
  if (shift) {
    const [hasScene, hasSection] = await Promise.all([
      hasSceneOnPlotIndex(toPlotId, toIndex),
      hasSectionOnIndex(plot.storyId, toIndex),
    ]);

    if (hasScene || hasSection) {
      const { scenes: shiftedScenes, sections: shiftedSections } =
        await shiftGridInVerticalIndexRange(
          plot.storyId,
          shift.rangeStart,
          shift.rangeEnd,
          shift.shift,
        );
      scenesToUpdate.push(...shiftedScenes);
      sectionsToUpdate.push(...shiftedSections);
    }
  }

  // step 2: move target scene to new index
  await assertPlotScenePositionIsOpen(toPlotId, toIndex);

  const updatedScene = await updateSceneById(sceneId, {
    verticalIndex: toIndex,
    plotId: toPlotId,
  });
  if (updatedScene) {
    scenesToUpdate.push(updatedScene);
  }

  const shiftedResources: ShiftedResources | undefined =
    scenesToUpdate.length || sectionsToUpdate.length
      ? { scenes: scenesToUpdate, sections: sectionsToUpdate }
      : undefined;

  return shiftedResources
    ? { scene: updatedScene ?? null, shiftedResources }
    : { scene: updatedScene ?? null };
};
