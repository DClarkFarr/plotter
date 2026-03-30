import { create } from "zustand";

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
}));
