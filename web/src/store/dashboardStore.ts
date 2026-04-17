import { create } from "zustand";

interface DashboardState {
  isCreateStoryOpen: boolean;
  isImportOutlineOpen: boolean;
  duplicatingStoryIds: Set<string>;
  openCreateStory: () => void;
  closeCreateStory: () => void;
  openImportOutline: () => void;
  closeImportOutline: () => void;
  addDuplicatingId: (id: string) => void;
  removeDuplicatingId: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isCreateStoryOpen: false,
  isImportOutlineOpen: false,
  duplicatingStoryIds: new Set(),
  openCreateStory: () => set({ isCreateStoryOpen: true }),
  closeCreateStory: () => set({ isCreateStoryOpen: false }),
  openImportOutline: () => set({ isImportOutlineOpen: true }),
  closeImportOutline: () => set({ isImportOutlineOpen: false }),
  addDuplicatingId: (id) =>
    set((state) => ({
      duplicatingStoryIds: new Set(state.duplicatingStoryIds).add(id),
    })),
  removeDuplicatingId: (id) =>
    set((state) => {
      const next = new Set(state.duplicatingStoryIds);
      next.delete(id);
      return { duplicatingStoryIds: next };
    }),
}));
