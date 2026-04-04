import { create } from "zustand";
import type { Scene } from "../api/types";

export type SceneEditorDragMode =
  | "singleCard"
  | "cardColumnAbove"
  | "cardRow"
  | "customSelection";

export type SceneEditorState = {
  selectedSceneId: string | null;
  selectedPlotId: string | null;
  isSaving: boolean;
  dragMode: SceneEditorDragMode;
  setDragMode: (mode: SceneEditorDragMode) => void;
  selectScene: (sceneId: string, plotId: string) => void;
  clearSelection: () => void;
  setSaving: (isSaving: boolean) => void;

  draggingScene: Scene | null;
  startDraggingScene: (scene: Scene) => void;
  stopDraggingScene: () => void;
};

export const useSceneEditorStore = create<SceneEditorState>((set) => ({
  selectedSceneId: null,
  selectedPlotId: null,
  isSaving: false,
  dragMode: "singleCard",
  setDragMode: (mode: SceneEditorDragMode) => set({ dragMode: mode }),
  selectScene: (sceneId, plotId) =>
    set({ selectedSceneId: sceneId, selectedPlotId: plotId }),
  clearSelection: () => set({ selectedSceneId: null, selectedPlotId: null }),
  setSaving: (isSaving) => set({ isSaving }),
  draggingScene: null,
  startDraggingScene: (scene) => set({ draggingScene: scene }),
  stopDraggingScene: () => set({ draggingScene: null }),
}));
