import type { Plot, Section } from "../../api/types";

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
  plots: Plot[];
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
  plots: Plot[],
  plotId: string,
  verticalIndex: number,
  excludeId?: string,
) => {
  const plot = plots.find((entry) => entry.id === plotId);
  if (!plot) {
    return false;
  }

  return plot.scenes.some(
    (scene) => scene.verticalIndex === verticalIndex && scene.id !== excludeId,
  );
};

const hasSceneOnStoryIndex = (
  plots: Plot[],
  verticalIndex: number,
  excludeId?: string,
) =>
  plots.some((plot) =>
    plot.scenes.some(
      (scene) =>
        scene.verticalIndex === verticalIndex && scene.id !== excludeId,
    ),
  );

export const shouldShiftForSceneInsert = (
  plots: Plot[],
  sections: Section[],
  plotId: string,
  verticalIndex: number,
) =>
  hasSceneOnPlotIndex(plots, plotId, verticalIndex) &&
  !hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftForSectionInsert = (
  plots: Plot[],
  sections: Section[],
  verticalIndex: number,
) =>
  hasSceneOnStoryIndex(plots, verticalIndex) ||
  hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftAfterSceneRemoval = (
  plots: Plot[],
  sections: Section[],
  plotId: string,
  verticalIndex: number,
  removedSceneId: string,
) =>
  !hasSceneOnPlotIndex(plots, plotId, verticalIndex, removedSceneId) &&
  !hasSectionOnIndex(sections, verticalIndex);

export const shouldShiftAfterSectionRemoval = (
  plots: Plot[],
  verticalIndex: number,
) => !hasSceneOnStoryIndex(plots, verticalIndex);

export const getMoveRangeShift = (
  props: MoveRangeShiftProps,
): MoveRangeShift | null => {
  const {
    fromIndex,
    toIndex,
    fromPlotId,
    toPlotId,
    resource,
    plots,
    sections,
  } = props;

  if (fromIndex === toIndex && fromPlotId === toPlotId) {
    return null;
  }

  const isTargetOccupied = () => {
    if (resource.type === "section") {
      return (
        hasSceneOnStoryIndex(plots, toIndex) ||
        hasSectionOnIndex(sections, toIndex, resource.id)
      );
    }

    return (
      hasSceneOnPlotIndex(plots, toPlotId, toIndex, resource.id) ||
      hasSectionOnIndex(sections, toIndex)
    );
  };

  const isSourceRowEmpty = () => {
    if (resource.type === "section") {
      return true;
    }

    const hasScene = hasSceneOnStoryIndex(plots, fromIndex, resource.id);
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
