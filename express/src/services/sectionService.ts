import { ObjectId } from "mongodb";
import {
  createSection as createSectionModel,
  CreateSectionInput,
  deleteSectionById,
  getSectionById,
  getSectionByVerticalIndex,
  listSectionsByStoryId,
  SectionDocument,
  SectionType,
  updateSectionById as updateSectionByIdModel,
  UpdateSectionInput,
} from "../models/sections";
import { getStoryById } from "../models/stories";
import { listPlotIdsByStoryId } from "../models/plots";
import { ensureObjectId } from "../models/types";
import {
  ShiftedResources,
  shouldShiftAfterSectionRemoval,
  shouldShiftForSectionInsert,
  shiftGridDownwardFromIndex,
  shiftGridInVerticalIndexRange,
  shiftGridUpwardFromIndex,
  getMoveRangeShift,
} from "../utils/plotGridUtils";

const assertStoryExists = async (storyId: string | ObjectId): Promise<void> => {
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
};

const assertSectionType = (type: string): SectionType => {
  if (type !== "act" && type !== "chapter") {
    throw new Error("Section type must be act or chapter");
  }

  return type;
};

export const listSectionsForStory = async (
  storyId: string | ObjectId,
): Promise<SectionDocument[]> => {
  await assertStoryExists(storyId);
  return listSectionsByStoryId(storyId);
};

export const createSectionForStory = async (
  storyId: string | ObjectId,
  input: CreateSectionInput,
): Promise<{
  section: SectionDocument;
  shiftedResources: ShiftedResources | undefined;
}> => {
  if (input.verticalIndex < 0) {
    throw new Error("verticalIndex must be >= 0");
  }

  const storyObjectId = ensureObjectId(storyId, "storyId");
  await assertStoryExists(storyObjectId);

  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    throw new Error("Section title is required");
  }

  const type = assertSectionType(input.type);

  const shouldShift = await shouldShiftForSectionInsert(
    storyObjectId,
    input.verticalIndex,
  );

  const shiftedResources = shouldShift
    ? await shiftGridUpwardFromIndex(storyObjectId, input.verticalIndex)
    : undefined;

  const section = await createSectionModel({
    ...input,
    title: trimmedTitle,
    type,
    storyId: storyObjectId,
    ...(input.description !== undefined && { description: input.description }),
  });

  return {
    section,
    shiftedResources,
  };
};

export const getSectionForStory = async (
  storyId: string | ObjectId,
  sectionId: string | ObjectId,
): Promise<SectionDocument | null> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const section = await getSectionById(sectionId);
  if (!section) {
    return null;
  }

  if (section.storyId.toHexString() !== storyObjectId.toHexString()) {
    return null;
  }

  return section;
};

export const updateSectionForStory = async (
  storyId: string | ObjectId,
  sectionId: string | ObjectId,
  updates: UpdateSectionInput,
): Promise<{
  section: SectionDocument | null;
  shiftedResources: ShiftedResources | undefined;
}> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSectionForStory(storyObjectId, sectionId);
  if (!current) {
    return { section: null, shiftedResources: undefined };
  }

  if (updates.verticalIndex !== undefined) {
    if (updates.verticalIndex < 0) {
      throw new Error("verticalIndex must be >= 0");
    }
  }

  const nextUpdates: UpdateSectionInput = { ...updates };
  if (updates.title !== undefined) {
    const trimmedTitle = updates.title.trim();
    if (!trimmedTitle) {
      throw new Error("Section title is required");
    }
    nextUpdates.title = trimmedTitle;
  }

  if (updates.type !== undefined) {
    nextUpdates.type = assertSectionType(updates.type);
  }

  if (updates.description !== undefined) {
    nextUpdates.description = updates.description;
  }

  const targetIndex = updates.verticalIndex;
  let shiftedResources: ShiftedResources | undefined;
  if (targetIndex !== undefined && targetIndex !== current.verticalIndex) {
    const occupied = await getSectionByVerticalIndex(
      storyObjectId,
      targetIndex,
    );
    if (occupied && occupied._id.toHexString() !== current._id.toHexString()) {
      throw new Error("Section verticalIndex is already occupied");
    }

    const plotIds = await listPlotIdsByStoryId(storyObjectId);
    const fallbackPlotId = plotIds[0];
    if (!fallbackPlotId) {
      throw new Error("Story must have at least one plot");
    }

    const shift = await getMoveRangeShift({
      fromIndex: current.verticalIndex,
      toIndex: targetIndex,
      fromPlotId: fallbackPlotId,
      toPlotId: fallbackPlotId,
      resource: { id: current._id, type: "chapter" },
    });
    if (shift) {
      shiftedResources = await shiftGridInVerticalIndexRange(
        storyObjectId,
        shift.rangeStart,
        shift.rangeEnd,
        shift.shift,
      );
    }
  }

  const section = await updateSectionByIdModel(sectionId, nextUpdates);

  return {
    section,
    shiftedResources,
  };
};

export const moveSectionForStory = async (
  storyId: string | ObjectId,
  sectionId: string | ObjectId,
  toIndex: number,
): Promise<{
  section: SectionDocument | null;
  shiftedResources: ShiftedResources | undefined;
}> => {
  if (toIndex < 0) {
    throw new Error("toIndex must be >= 0");
  }

  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSectionForStory(storyObjectId, sectionId);
  if (!current) {
    return { section: null, shiftedResources: undefined };
  }

  const fromIndex = current.verticalIndex;
  if (fromIndex === toIndex) {
    return { section: current, shiftedResources: undefined };
  }

  // Moving down (from < to): shift [from+1, to] by -1 (those rows close the gap)
  // Moving up (from > to):   shift [to, from-1] by +1 (those rows open space at to)
  const rangeStart = fromIndex < toIndex ? fromIndex + 1 : toIndex;
  const rangeEnd = fromIndex < toIndex ? toIndex : fromIndex - 1;
  const shift = fromIndex < toIndex ? -1 : 1;

  const shiftedResources = await shiftGridInVerticalIndexRange(
    storyObjectId,
    rangeStart,
    rangeEnd,
    shift,
  );

  const section = await updateSectionByIdModel(sectionId, {
    verticalIndex: toIndex,
  });

  return { section, shiftedResources };
};

export const deleteSectionForStory = async (
  storyId: string | ObjectId,
  sectionId: string | ObjectId,
): Promise<{ deleted: boolean; shiftedResources?: ShiftedResources }> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSectionForStory(storyObjectId, sectionId);
  if (!current) {
    return { deleted: false };
  }

  const removed = await deleteSectionById(sectionId);
  if (!removed) {
    return { deleted: false };
  }

  const shouldShift = await shouldShiftAfterSectionRemoval(
    storyObjectId,
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
