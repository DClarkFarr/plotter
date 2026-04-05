import type { Plot, Scene } from "../api/types";

export type OrderedSceneEntry = {
  scene: Scene;
  plot: Plot;
};

const compareScenes = (a: OrderedSceneEntry, b: OrderedSceneEntry) => {
  if (a.scene.verticalIndex !== b.scene.verticalIndex) {
    return a.scene.verticalIndex - b.scene.verticalIndex;
  }

  if (a.plot.horizontalIndex !== b.plot.horizontalIndex) {
    return a.plot.horizontalIndex - b.plot.horizontalIndex;
  }

  return a.scene.id.localeCompare(b.scene.id);
};

export const orderScenesForListView = (plots: Plot[]) => {
  const entries: OrderedSceneEntry[] = [];

  for (const plot of plots) {
    for (const scene of plot.scenes) {
      entries.push({ scene, plot });
    }
  }

  return entries.sort(compareScenes);
};
