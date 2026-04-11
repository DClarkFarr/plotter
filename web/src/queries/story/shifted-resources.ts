import type { QueryClient } from "@tanstack/react-query";
import type { Plot, Section, ShiftedResources } from "../../api/types";
import { shiftScenesInRange, sortScenes } from "../scene/scene-helpers";
import { shiftSectionsInRange, sortSections } from "../section/section-helpers";
import { useStoryPlotsQuery } from "./story-queries";
import { useStorySectionsQuery } from "../section/section-queries";
import type { MoveRangeShift } from "./shift-logic";

const applyShiftedScenes = (
  plots: Plot[],
  scenes: ShiftedResources["scenes"],
) => {
  if (scenes.length === 0) {
    return plots;
  }

  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));

  return plots.map((plot) => {
    const hasScene = plot.scenes.some((scene) => sceneMap.has(scene.id));
    if (!hasScene) {
      return plot;
    }

    const nextScenes = plot.scenes.map(
      (scene) => sceneMap.get(scene.id) ?? scene,
    );

    return { ...plot, scenes: sortScenes(nextScenes) };
  });
};

const applyShiftedSections = (
  sections: Section[],
  shifted: ShiftedResources["sections"],
) => {
  if (shifted.length === 0) {
    return sections;
  }

  const sectionMap = new Map(shifted.map((section) => [section.id, section]));
  const nextSections = sections.map(
    (section) => sectionMap.get(section.id) ?? section,
  );

  return sortSections(nextSections);
};

const shouldShiftIndex = (verticalIndex: number, shift: MoveRangeShift) => {
  if (shift.rangeEnd === undefined) {
    return verticalIndex >= shift.rangeStart;
  }

  return verticalIndex >= shift.rangeStart && verticalIndex <= shift.rangeEnd;
};

const applyShiftRangeToPlots = (plots: Plot[], shift: MoveRangeShift) =>
  plots.map((plot) => {
    const hasScene = plot.scenes.some((scene) =>
      shouldShiftIndex(scene.verticalIndex, shift),
    );
    if (!hasScene) {
      return plot;
    }

    const nextScenes = shiftScenesInRange(plot.scenes, shift);

    return { ...plot, scenes: sortScenes(nextScenes) };
  });

const applyShiftRangeToSections = (
  sections: Section[],
  shift: MoveRangeShift,
) => {
  const hasSection = sections.some((section) =>
    shouldShiftIndex(section.verticalIndex, shift),
  );
  if (!hasSection) {
    return sections;
  }

  const nextSections = shiftSectionsInRange(sections, shift);

  return sortSections(nextSections);
};

export const applyShiftedResources = (
  queryClient: QueryClient,
  storyId: string,
  shiftedResources?: ShiftedResources,
) => {
  if (!shiftedResources) {
    return;
  }

  if (shiftedResources.scenes.length > 0) {
    queryClient.setQueryData<Plot[]>(
      useStoryPlotsQuery.queryKey(storyId),
      (current) =>
        current
          ? applyShiftedScenes(current, shiftedResources.scenes)
          : current,
    );
  }

  if (shiftedResources.sections.length > 0) {
    queryClient.setQueryData<Section[]>(
      useStorySectionsQuery.queryKey(storyId),
      (current) =>
        current
          ? applyShiftedSections(current, shiftedResources.sections)
          : current,
    );
  }
};

export const applyOptimisticShift = (
  queryClient: QueryClient,
  storyId: string,
  shift: MoveRangeShift,
) => {
  const { plots, sections } = applyOptimisticShiftToState(
    queryClient.getQueryData<Plot[]>(useStoryPlotsQuery.queryKey(storyId)) ??
      [],
    queryClient.getQueryData<Section[]>(
      useStorySectionsQuery.queryKey(storyId),
    ) ?? [],
    shift,
  );

  queryClient.setQueryData<Plot[]>(useStoryPlotsQuery.queryKey(storyId), plots);

  queryClient.setQueryData<Section[]>(
    useStorySectionsQuery.queryKey(storyId),
    sections,
  );
};

export const applyOptimisticShiftToState = (
  plots: Plot[],
  sections: Section[],
  shift: MoveRangeShift,
) => ({
  plots: applyShiftRangeToPlots(plots, shift),
  sections: applyShiftRangeToSections(sections, shift),
});
