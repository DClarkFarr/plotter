import { create } from "zustand";

export type PlotEditorState = {
  selectedPlotId: string | null;
  isSaving: boolean;
  error: string | null;
  selectPlot: (plotId: string) => void;
  clearSelection: () => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
};

export const usePlotEditorStore = create<PlotEditorState>((set) => ({
  selectedPlotId: null,
  isSaving: false,
  error: null,
  selectPlot: (plotId) => set({ selectedPlotId: plotId, error: null }),
  clearSelection: () =>
    set({ selectedPlotId: null, isSaving: false, error: null }),
  setSaving: (isSaving) => set({ isSaving }),
  setError: (error) => set({ error }),
}));
