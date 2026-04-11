import { create } from "zustand";

export type SectionEditorState = {
  selectedSectionId: string | null;
  isSaving: boolean;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
  setSaving: (isSaving: boolean) => void;
};

export const useSectionEditorStore = create<SectionEditorState>((set) => ({
  selectedSectionId: null,
  isSaving: false,
  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
  clearSelection: () => set({ selectedSectionId: null }),
  setSaving: (isSaving) => set({ isSaving }),
}));
