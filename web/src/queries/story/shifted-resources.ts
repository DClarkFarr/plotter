import type { QueryClient } from "@tanstack/react-query";
import type { Plot, Section, ShiftedResources } from "../../api/types";
import { sortScenes } from "../scene/scene-helpers";
import { sortSections } from "../section/section-helpers";
import { useStoryPlotsQuery } from "./story-queries";
import { useStorySectionsQuery } from "../section/section-queries";

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
