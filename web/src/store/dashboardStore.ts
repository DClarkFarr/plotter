import { create } from "zustand";

interface DashboardState {
  isCreateStoryOpen: boolean;
  isImportOutlineOpen: boolean;
  openCreateStory: () => void;
  closeCreateStory: () => void;
  openImportOutline: () => void;
  closeImportOutline: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isCreateStoryOpen: false,
  isImportOutlineOpen: false,
  openCreateStory: () => set({ isCreateStoryOpen: true }),
  closeCreateStory: () => set({ isCreateStoryOpen: false }),
  openImportOutline: () => set({ isImportOutlineOpen: true }),
  closeImportOutline: () => set({ isImportOutlineOpen: false }),
}));
