import type { Scene } from "../../api/types";

export const sortScenes = (scenes: Scene[]) =>
  [...scenes].sort((a, b) => a.verticalIndex - b.verticalIndex);

export const shiftScenesForInsert = (
  scenes: Scene[],
  sceneId: string,
  toIndex: number,
) => {
  const target = scenes.find((scene) => scene.id === sceneId);
  if (!target) {
    return scenes;
  }

  const fromIndex = target.verticalIndex;
  const isMovingUp = toIndex > fromIndex;

  return scenes.map((scene) => {
    if (scene.id === sceneId) {
      return scene;
    }

    if (isMovingUp) {
      if (scene.verticalIndex > fromIndex && scene.verticalIndex <= toIndex) {
        return { ...scene, verticalIndex: scene.verticalIndex - 1 };
      }
    } else {
      if (scene.verticalIndex < fromIndex && scene.verticalIndex >= toIndex) {
        return { ...scene, verticalIndex: scene.verticalIndex + 1 };
      }
    }

    return scene;
  });
};
