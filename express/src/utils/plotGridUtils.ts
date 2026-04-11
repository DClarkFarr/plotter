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
  rangeStart: number | undefined,
  rangeEnd: number | undefined,
  shift: number,
): Promise<GridShiftResult> => {
  if ((rangeStart && rangeEnd && rangeStart >= rangeEnd) || shift === 0) {
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
    console.log("plotId", plotId.toHexString(), "shiftedScenes", shiftedScenes);
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

export type MoveRangeShift =
  | {
      rangeStart: number;
      rangeEnd: number;
      shift: number;
    }
  | {
      rangeStart: number;
      rangeEnd: undefined;
      shift: number;
    }
  | {
      rangeStart: number;
      rangeEnd: number;
      shift: number;
    };

export type MoveRangeShiftProps = {
  fromIndex: number;
  toIndex: number;
  fromPlotId: ObjectId;
  toPlotId: ObjectId;
  resource: { id: ObjectId; type: "scene" | "section" };
};
export const getMoveRangeShift = async (
  props: MoveRangeShiftProps,
): Promise<MoveRangeShift | null> => {
  /**
   * This function needs implmenting
   * 1) If plot ids are the same and the indexes are the same, do nothing
   * 2) if plot ids are not the same, but indexes are the same, if the target index is occupied, shift the grid up 1 from the target index
   * 3) If the indexes are different, and the movement difference is 1.
   * 3.1) If from row is now empty and the to row is occupied, shift the from to the target row's position, and shift the target row down by 1
   * 3.2) If the from row is occupied in one of the other plots, shift the whole grid up at the target row
   * 4) if the indexes are different and the moment difference is greater than 1
   * 4.1) If the from index now empty and the target index is not, shift the moved over rows toward the from index.
   * 4.2) If the from index is still occupied in one of the plots, shift the whole grid up at the target index.
   *
   *
   * Notes about implementation:
   * 1) If the resource is a section, we can assume the from row is empty, as a section takes up the whole row
   * 2) If the resource is a scene, we need to check if other plots still have a scene on that row.
   */
};
