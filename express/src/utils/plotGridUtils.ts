import { ObjectId } from "mongodb";
import {
  getSceneByVerticalIndex,
  SceneDocument,
  shiftScenesDownwardFromIndex,
  shiftScenesInVerticalIndexRange,
  shiftScenesUpwardFromIndex,
} from "../models/scenes";
import {
  getSectionByVerticalIndex,
  SectionDocument,
  shiftSectionsDownwardFromIndex,
  shiftSectionsInVerticalIndexRange,
  shiftSectionsUpwardFromIndex,
} from "../models/sections";
import { listPlotIdsByStoryId } from "../models/plots";

export type GridShiftScope = "plot" | "story";
export type GridShiftDirection = "up" | "down";

export type ShiftedResources = {
  scenes: SceneDocument[];
  sections: SectionDocument[];
};

export type GridShiftResult = ShiftedResources;

export const hasSectionOnIndex = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const section = await getSectionByVerticalIndex(storyId, verticalIndex);
  return Boolean(section);
};

export const hasSceneOnPlotIndex = async (
  plotId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const scene = await getSceneByVerticalIndex(plotId, verticalIndex);
  return Boolean(scene);
};

export const hasSceneOnStoryIndex = async (
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

export const shouldShiftForSceneInsert = async (
  storyId: ObjectId,
  plotId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const [hasScene, hasSection] = await Promise.all([
    hasSceneOnPlotIndex(plotId, verticalIndex),
    hasSectionOnIndex(storyId, verticalIndex),
  ]);

  return hasScene && !hasSection;
};

export const shouldShiftForSectionInsert = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const [hasScene, hasSection] = await Promise.all([
    hasSceneOnStoryIndex(storyId, verticalIndex),
    hasSectionOnIndex(storyId, verticalIndex),
  ]);

  return hasScene || hasSection;
};

export const shouldShiftAfterSceneRemoval = async (
  storyId: ObjectId,
  plotId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const [hasScene, hasSection] = await Promise.all([
    hasSceneOnPlotIndex(plotId, verticalIndex),
    hasSectionOnIndex(storyId, verticalIndex),
  ]);

  return !hasScene && !hasSection;
};

export const shouldShiftAfterSectionRemoval = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<boolean> => {
  const hasScene = await hasSceneOnStoryIndex(storyId, verticalIndex);
  return !hasScene;
};

export const shiftGridUpwardFromIndex = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<GridShiftResult> => {
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

export const shiftGridDownwardFromIndex = async (
  storyId: ObjectId,
  verticalIndex: number,
): Promise<GridShiftResult> => {
  const plotIds = await listPlotIdsByStoryId(storyId);
  const scenes: SceneDocument[] = [];

  for (const plotId of plotIds) {
    const shiftedScenes = await shiftScenesDownwardFromIndex(
      plotId,
      verticalIndex,
    );
    scenes.push(...shiftedScenes);
  }

  const sections = await shiftSectionsDownwardFromIndex(storyId, verticalIndex);

  return { scenes, sections };
};

export const shiftGridInVerticalIndexRange = async (
  storyId: ObjectId,
  rangeStart: number,
  rangeEnd: number,
  shift: number,
): Promise<GridShiftResult> => {
  if (rangeStart > rangeEnd || shift === 0) {
    return { scenes: [], sections: [] };
  }

  const plotIds = await listPlotIdsByStoryId(storyId);
  const scenes: SceneDocument[] = [];

  for (const plotId of plotIds) {
    const shiftedScenes = await shiftScenesInVerticalIndexRange(
      plotId,
      rangeStart,
      rangeEnd,
      shift,
    );
    scenes.push(...shiftedScenes);
  }

  const sections = await shiftSectionsInVerticalIndexRange(
    storyId,
    rangeStart,
    rangeEnd,
    shift,
  );

  return { scenes, sections };
};

export type MoveRangeShift = {
  rangeStart: number;
  rangeEnd: number;
  shift: number;
};

export const getMoveRangeShift = (
  fromIndex: number,
  toIndex: number,
): MoveRangeShift | null => {
  if (fromIndex === toIndex) {
    return null;
  }

  if (toIndex > fromIndex) {
    return {
      rangeStart: fromIndex + 1,
      rangeEnd: toIndex,
      shift: 1,
    };
  }

  return {
    rangeStart: toIndex,
    rangeEnd: fromIndex - 1,
    shift: -1,
  };
};
