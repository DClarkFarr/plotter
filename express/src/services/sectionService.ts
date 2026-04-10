import { ObjectId } from "mongodb";
import {
  createSection as createSectionModel,
  CreateSectionInput,
  getSectionById,
  getSectionByVerticalIndex,
  listSectionsByStoryId,
  SectionDocument,
  SectionType,
  shiftSectionsUpwardFromIndex,
  updateSectionById as updateSectionByIdModel,
  UpdateSectionInput,
} from "../models/sections";
import {
  getSceneByVerticalIndex,
  SceneDocument,
  shiftScenesUpwardFromIndex,
} from "../models/scenes";
import { listPlotIdsByStoryId } from "../models/plots";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";

const assertStoryExists = async (storyId: string | ObjectId): Promise<void> => {
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
};

const assertSectionType = (type: string): SectionType => {
  if (type !== "act" && type !== "section") {
    throw new Error("Section type must be act or section");
  }

  return type;
};

export const listSectionsForStory = async (
  storyId: string | ObjectId,
): Promise<SectionDocument[]> => {
  await assertStoryExists(storyId);
  return listSectionsByStoryId(storyId);
};

const hasSceneOnIndex = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const plotIds = await listPlotIdsByStoryId(storyId);
  for (const plotId of plotIds) {
    const scene = await getSceneByVerticalIndex(plotId, verticalIndex);
    if (scene) {
      return true;
    }
  }

  return false;
};

const shiftGridUpwardFromIndex = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<{ scenes: SceneDocument[]; sections: SectionDocument[] }> => {
  const plotIds = await listPlotIdsByStoryId(storyId);
  const scenes: SceneDocument[] = [];

  for (const plotId of plotIds) {
    const shiftedScenes = await shiftScenesUpwardFromIndex(
      plotId,
      verticalIndex,
    );
    scenes.push(...shiftedScenes);
  }

  const sections = await shiftSectionsUpwardFromIndex(storyId, verticalIndex);

  return { scenes, sections };
};

export const createSectionForStory = async (
  storyId: string | ObjectId,
  input: CreateSectionInput,
): Promise<{
  section: SectionDocument;
  scenes: SceneDocument[];
  sections: SectionDocument[];
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

  const existingSection = await getSectionByVerticalIndex(
    storyObjectId,
    input.verticalIndex,
  );
  if (existingSection) {
    throw new Error("Section verticalIndex is already occupied");
  }

  const shouldShift = await hasSceneOnIndex(storyObjectId, input.verticalIndex);

  const shiftedResources = shouldShift
    ? await shiftGridUpwardFromIndex(storyObjectId, input.verticalIndex)
    : { scenes: [], sections: [] };

  const section = await createSectionModel({
    ...input,
    title: trimmedTitle,
    type,
    storyId: storyObjectId,
  });

  return {
    section,
    scenes: shiftedResources.scenes,
    sections: shiftedResources.sections,
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
  scenes: SceneDocument[];
  sections: SectionDocument[];
}> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const current = await getSectionForStory(storyObjectId, sectionId);
  if (!current) {
    return { section: null, scenes: [], sections: [] };
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

  const targetIndex = updates.verticalIndex;
  const shiftedResources = {
    scenes: [] as SceneDocument[],
    sections: [] as SectionDocument[],
  };
  if (targetIndex !== undefined && targetIndex !== current.verticalIndex) {
    const occupied = await getSectionByVerticalIndex(
      storyObjectId,
      targetIndex,
    );
    if (occupied && occupied._id.toHexString() !== current._id.toHexString()) {
      throw new Error("Section verticalIndex is already occupied");
    }

    const shouldShift = await hasSceneOnIndex(storyObjectId, targetIndex);
    if (shouldShift) {
      const shifted = await shiftGridUpwardFromIndex(
        storyObjectId,
        targetIndex,
      );
      shiftedResources.scenes = shifted.scenes;
      shiftedResources.sections = shifted.sections;
    }
  }

  const section = await updateSectionByIdModel(sectionId, nextUpdates);

  return {
    section,
    scenes: shiftedResources.scenes,
    sections: shiftedResources.sections,
  };
};
