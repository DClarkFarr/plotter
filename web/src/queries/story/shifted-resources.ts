import type { QueryClient } from "@tanstack/react-query";
import type { Scene, Section, ShiftedResources } from "../../api/types";
import { sortScenes } from "../scene/scene-helpers";
import { shiftSectionsInRange, sortSections } from "../section/section-helpers";
import { useStoryScenesQuery } from "./story-queries";
import { useStorySectionsQuery } from "../section/section-queries";
import type { MoveRangeShift } from "./shift-logic";

const applyShiftedScenes = (
  current: Scene[],
  shifted: ShiftedResources["scenes"],
): Scene[] => {
  if (shifted.length === 0) {
    return current;
  }

  const sceneMap = new Map(shifted.map((scene) => [scene.id, scene]));
  return sortScenes(current.map((scene) => sceneMap.get(scene.id) ?? scene));
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

const applyShiftRangeToScenes = (
  scenes: Scene[],
  shift: MoveRangeShift,
): Scene[] =>
  scenes.map((scene) =>
    shouldShiftIndex(scene.verticalIndex, shift)
      ? { ...scene, verticalIndex: scene.verticalIndex + shift.shift }
      : scene,
  );

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
    queryClient.setQueryData<Scene[]>(
      useStoryScenesQuery.queryKey(storyId),
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
  const { scenes, sections } = applyOptimisticShiftToState(
    queryClient.getQueryData<Scene[]>(useStoryScenesQuery.queryKey(storyId)) ??
      [],
    queryClient.getQueryData<Section[]>(
      useStorySectionsQuery.queryKey(storyId),
    ) ?? [],
    shift,
  );

  queryClient.setQueryData<Scene[]>(
    useStoryScenesQuery.queryKey(storyId),
    scenes,
  );

  queryClient.setQueryData<Section[]>(
    useStorySectionsQuery.queryKey(storyId),
    sections,
  );
};

export const applyOptimisticShiftToState = (
  scenes: Scene[],
  sections: Section[],
  shift: MoveRangeShift,
) => ({
  scenes: applyShiftRangeToScenes(scenes, shift),
  sections: applyShiftRangeToSections(sections, shift),
});
