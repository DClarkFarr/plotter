import { create } from "zustand";

type StoryCardSize = "sm" | "md" | "lg";

type StoryCardDisplay = "grid" | "list";

interface StoryFilters {
  tagIds: string[];
}

interface StoryState {
  filters: StoryFilters;
  cardSize: StoryCardSize;
  cardDisplay: StoryCardDisplay;
  setFilters: (filters: StoryFilters) => void;
  setCardSize: (size: StoryCardSize) => void;
  setCardDisplay: (display: StoryCardDisplay) => void;
  resetStoryView: () => void;
}

const defaultFilters: StoryFilters = { tagIds: [] };

export const useStoryStore = create<StoryState>((set) => ({
  filters: defaultFilters,
  cardSize: "md",
  cardDisplay: "grid",
  setFilters: (filters) => set({ filters }),
  setCardSize: (cardSize) => set({ cardSize }),
  setCardDisplay: (cardDisplay) => set({ cardDisplay }),
  resetStoryView: () =>
    set({ filters: defaultFilters, cardSize: "md", cardDisplay: "grid" }),
}));
