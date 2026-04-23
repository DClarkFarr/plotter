import { create } from "zustand";
import type { Section } from "../api/types";

export type SectionEditorState = {
  selectedSectionId: string | null;
  isSaving: boolean;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
  setSaving: (isSaving: boolean) => void;

  draggingSection: Section | null;
  startDraggingSection: (section: Section) => void;
  stopDraggingSection: () => void;
};

export const useSectionEditorStore = create<SectionEditorState>((set) => ({
  selectedSectionId: null,
  isSaving: false,
  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
  clearSelection: () => set({ selectedSectionId: null }),
  setSaving: (isSaving) => set({ isSaving }),

  draggingSection: null,
  startDraggingSection: (section) => set({ draggingSection: section }),
  stopDraggingSection: () => set({ draggingSection: null }),
}));
