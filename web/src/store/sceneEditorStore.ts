import { create } from "zustand";

export type SceneEditorState = {
  selectedSceneId: string | null;
  selectedPlotId: string | null;
  isSaving: boolean;
  selectScene: (sceneId: string, plotId: string) => void;
  clearSelection: () => void;
  setSaving: (isSaving: boolean) => void;
};

export const useSceneEditorStore = create<SceneEditorState>((set) => ({
  selectedSceneId: null,
  selectedPlotId: null,
  isSaving: false,
  selectScene: (sceneId, plotId) =>
    set({ selectedSceneId: sceneId, selectedPlotId: plotId }),
  clearSelection: () => set({ selectedSceneId: null, selectedPlotId: null }),
  setSaving: (isSaving) => set({ isSaving }),
}));
