import { create } from "zustand";

interface DashboardState {
  isCreateStoryOpen: boolean;
  openCreateStory: () => void;
  closeCreateStory: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isCreateStoryOpen: false,
  openCreateStory: () => set({ isCreateStoryOpen: true }),
  closeCreateStory: () => set({ isCreateStoryOpen: false }),
}));
