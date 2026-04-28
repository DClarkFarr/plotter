import type { Plot, Scene, Section, SectionType } from "../api/types";

export type OrderSceneEntryPlot = {
  scene: Scene;
  plot: Plot;
};
export type OrderSceneEntrySection = {
  section: Section;
  type: SectionType;
};

export type OrderedSceneEntry = OrderSceneEntryPlot | OrderSceneEntrySection;

export const entryIsScene = (
  entry: OrderedSceneEntry,
): entry is OrderSceneEntryPlot => {
  return "scene" in entry;
};

export const entryIsSection = (
  entry: OrderedSceneEntry,
): entry is OrderSceneEntrySection => {
  return "section" in entry;
};

const getEntryVerticalIndex = (entry: OrderedSceneEntry) => {
  if (entryIsScene(entry)) {
    return entry.scene.verticalIndex;
  } else {
    return entry.section.verticalIndex;
  }
};

const getEntryTitle = (entry: OrderedSceneEntry) => {
  if (entryIsScene(entry)) {
    return entry.scene.title;
  } else {
    return entry.section.title;
  }
};

const getEntityHorizontalIndex = (entry: OrderedSceneEntry) => {
  if (entryIsScene(entry)) {
    return entry.plot.horizontalIndex;
  } else {
    return undefined;
  }
};

const compareScenes = (a: OrderedSceneEntry, b: OrderedSceneEntry) => {
  const verticalIndex = getEntryVerticalIndex(a) - getEntryVerticalIndex(b);
  const aHorizontalIndex = getEntityHorizontalIndex(a);
  const bHorizontalindex = getEntityHorizontalIndex(b);

  if (verticalIndex !== 0) {
    return verticalIndex;
  }

  if (aHorizontalIndex !== undefined && bHorizontalindex !== undefined) {
    const horizontalIndex = aHorizontalIndex - bHorizontalindex;
    if (horizontalIndex !== 0) {
      return horizontalIndex;
    }
  }

  const titleComparison = getEntryTitle(a).localeCompare(getEntryTitle(b));

  return titleComparison;
};

export const orderScenesForListView = (
  plots: Plot[],
  scenes: Scene[],
  sections: Section[],
) => {
  const plotById = new Map(plots.map((p) => [p.id, p]));
  const entries: OrderedSceneEntry[] = [];

  for (const scene of scenes) {
    const plot = plotById.get(scene.plotId);
    if (plot) {
      entries.push({ scene, plot });
    }
  }

  for (const section of sections) {
    entries.push({ section, type: section.type });
  }

  return entries.sort(compareScenes);
};
