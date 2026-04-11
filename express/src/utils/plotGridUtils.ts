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
import { getPlotById, listPlotIdsByStoryId } from "../models/plots";

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
  const { fromIndex, toIndex, fromPlotId, toPlotId, resource } = props;

  if (
    fromIndex === toIndex &&
    fromPlotId.toHexString() === toPlotId.toHexString()
  ) {
    return null;
  }

  const [fromPlot, toPlot] = await Promise.all([
    getPlotById(fromPlotId),
    getPlotById(toPlotId),
  ]);

  if (!fromPlot || !toPlot) {
    throw new Error("Plot not found");
  }

  if (fromPlot.storyId.toHexString() !== toPlot.storyId.toHexString()) {
    throw new Error("Plots must belong to the same story");
  }

  const storyId = fromPlot.storyId;

  const isTargetOccupied = async (): Promise<boolean> => {
    if (resource.type === "section") {
      const [hasScene, hasSection] = await Promise.all([
        hasSceneOnStoryIndex(storyId, toIndex),
        hasSectionOnIndex(storyId, toIndex),
      ]);
      return hasScene || hasSection;
    }

    const [hasScene, hasSection] = await Promise.all([
      hasSceneOnPlotIndex(toPlotId, toIndex),
      hasSectionOnIndex(storyId, toIndex),
    ]);
    return hasScene || hasSection;
  };

  const isSourceRowEmpty = async (): Promise<boolean> => {
    if (resource.type === "section") {
      return true;
    }

    const plotIds = await listPlotIdsByStoryId(storyId);
    for (const plotId of plotIds) {
      const scene = await getSceneByVerticalIndex(
        plotId,
        fromIndex,
        resource.id,
      );
      if (scene) {
        return false;
      }
    }

    const hasSection = await hasSectionOnIndex(storyId, fromIndex);
    return !hasSection;
  };

  const targetOccupied = await isTargetOccupied();

  if (fromIndex === toIndex) {
    /**
     * we know the plots must not be the same, because of the
     * the above check and return.
     */
    if (targetOccupied) {
      return {
        rangeStart: toIndex,
        rangeEnd: undefined,
        shift: 1,
      };
    } else {
      return null;
    }
  }

  const rangeStart = Math.min(fromIndex, toIndex);
  const rangeEnd = Math.max(fromIndex, toIndex) - 1;

  const sourceRowEmpty = await isSourceRowEmpty();

  if (sourceRowEmpty && targetOccupied) {
    /**
     * With an empty source and an occupied target,
     * we can shift all the rows toward the empty source and
     * out of the ocupied target, leaving us space for the moved cell.
     */
    return {
      rangeStart,
      rangeEnd,
      shift: fromIndex < toIndex ? -1 : 1,
    };
  } else if (targetOccupied) {
    /**
     * The source wasn't empty, but the target is occupied.
     * So shift everything >= to the target, effectively clearing the target.
     */
    return {
      rangeStart: toIndex,
      rangeEnd: undefined,
      shift: 1,
    };
  }

  /**
   * None of the above conditions were matched, so do nothing.
   * This includes moving from an occupied row to an open target.
   */

  return null;
};
