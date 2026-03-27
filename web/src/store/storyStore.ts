import { create } from "zustand";
import type { StoryFilters, StoryState } from "./storyStore.types";

const defaultFilters: StoryFilters = { tagIds: [] };

export const useStoryStore = create<StoryState>((set) => ({
  filters: defaultFilters,
  cardSize: "md",
  cardDisplay: "grid",
  story: null,
  setStory: (story) => set({ story }),
  setFilters: (filters) => set({ filters }),
  setCardSize: (cardSize) => set({ cardSize }),
  setCardDisplay: (cardDisplay) => set({ cardDisplay }),
  resetStoryView: () =>
    set({ filters: defaultFilters, cardSize: "md", cardDisplay: "grid" }),
}));
