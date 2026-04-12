import type { Scene, Section } from "../../api/types";

export type MoveRangeShift = {
  rangeStart: number;
  rangeEnd: number | undefined;
  shift: number;
};

export type MoveRangeShiftProps = {
  fromIndex: number;
  toIndex: number;
  fromPlotId: string;
  toPlotId: string;
  resource: { id: string; type: "scene" | "section" };
  scenes: Scene[];
  sections: Section[];
};

const hasSectionOnIndex = (
  sections: Section[],
  verticalIndex: number,
  excludeId?: string,
) =>
  sections.some(
    (section) =>
      section.verticalIndex === verticalIndex && section.id !== excludeId,
  );

const hasSceneOnPlotIndex = (
  scenes: Scene[],
  plotId: string,
  verticalIndex: number,
  excludeId?: string,
) =>
  scenes.some(
    (s) =>
      s.plotId === plotId &&
      s.verticalIndex === verticalIndex &&
      s.id !== excludeId,
  );

const hasSceneOnStoryIndex = (
  scenes: Scene[],
  verticalIndex: number,
  excludeId?: string,
) =>
  scenes.some((s) => s.verticalIndex === verticalIndex && s.id !== excludeId);

export const shouldShiftForSceneInsert = (
  scenes: Scene[],
  sections: Section[],
  plotId: string,
  verticalIndex: number,
) =>
  hasSceneOnPlotIndex(scenes, plotId, verticalIndex) &&
  !hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftForSectionInsert = (
  scenes: Scene[],
  sections: Section[],
  verticalIndex: number,
) =>
  hasSceneOnStoryIndex(scenes, verticalIndex) ||
  hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftAfterSceneRemoval = (
  scenes: Scene[],
  sections: Section[],
  plotId: string,
  verticalIndex: number,
  removedSceneId: string,
) =>
  !hasSceneOnPlotIndex(scenes, plotId, verticalIndex, removedSceneId) &&
  !hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftAfterSectionRemoval = (
  scenes: Scene[],
  verticalIndex: number,
) => !hasSceneOnStoryIndex(scenes, verticalIndex);

export const getMoveRangeShift = (
  props: MoveRangeShiftProps,
): MoveRangeShift | null => {
  const {
    fromIndex,
    toIndex,
    fromPlotId,
    toPlotId,
    resource,
    scenes,
    sections,
  } = props;

  if (fromIndex === toIndex && fromPlotId === toPlotId) {
    return null;
  }

  const isTargetOccupied = () => {
    if (resource.type === "section") {
      return (
        hasSceneOnStoryIndex(scenes, toIndex) ||
        hasSectionOnIndex(sections, toIndex, resource.id)
      );
    }

    return (
      hasSceneOnPlotIndex(scenes, toPlotId, toIndex, resource.id) ||
      hasSectionOnIndex(sections, toIndex)
    );
  };

  const isSourceRowEmpty = () => {
    if (resource.type === "section") {
      return true;
    }

    const hasScene = hasSceneOnStoryIndex(scenes, fromIndex, resource.id);
    const hasSection = hasSectionOnIndex(sections, fromIndex);
    return !hasScene && !hasSection;
  };

  const targetOccupied = isTargetOccupied();

  if (fromIndex === toIndex) {
    if (targetOccupied) {
      return {
        rangeStart: toIndex,
        rangeEnd: undefined,
        shift: 1,
      };
    }

    return null;
  }

  const rangeStart = Math.min(fromIndex, toIndex);
  const rangeEnd = Math.max(fromIndex, toIndex) - 1;
  const sourceRowEmpty = isSourceRowEmpty();

  if (sourceRowEmpty && targetOccupied) {
    return {
      rangeStart,
      rangeEnd,
      shift: fromIndex < toIndex ? -1 : 1,
    };
  }

  if (targetOccupied) {
    return {
      rangeStart: toIndex,
      rangeEnd: undefined,
      shift: 1,
    };
  }

  return null;
};
