import { create } from "zustand";
import type { StoryFilter, StoryFilters, StoryState } from "./storyStore.types";

const defaultFilters: StoryFilters = [];

const isSameFilter = (left: StoryFilter, right: StoryFilter) =>
  left.type === right.type &&
  left.value1 === right.value1 &&
  (left.value2 ?? "") === (right.value2 ?? "");

export const useStoryStore = create<StoryState>((set, get) => ({
  filters: defaultFilters,
  cardSize: "md",
  cardDisplay: "grid",
  filterVisibilityMode: "hide",
  story: null,
  setStory: (story) => set({ story }),
  setFilters: (filters) => set({ filters }),
  addFilter: (filter) =>
    set((state) => {
      const existing = state.filters;

      if (filter.type === "tag") {
        const hasTag = existing.some(
          (item) => item.type === "tag" && item.value1 === filter.value1,
        );
        if (hasTag) {
          return {
            filters: existing.map((item) =>
              item.type === "tag" && item.value1 === filter.value1
                ? filter
                : item,
            ),
          };
        }
      }

      if (filter.type === "search") {
        const hasSearch = existing.some((item) => item.type === "search");
        if (hasSearch) {
          return {
            filters: existing.map((item) =>
              item.type === "search" ? filter : item,
            ),
          };
        }
      }

      if (existing.some((item) => isSameFilter(item, filter))) {
        return state;
      }

      return { filters: [...existing, filter] };
    }),
  removeFilter: (filter) =>
    set((state) => ({
      filters: state.filters.filter((item) => !isSameFilter(item, filter)),
    })),
  clearFilters: () => set({ filters: [] }),
  hasFilters: () => get().filters.length > 0,
  filtersByType: (type) =>
    get().filters.filter((filter) => filter.type === type),
  setCardSize: (cardSize) => set({ cardSize }),
  setCardDisplay: (cardDisplay) => set({ cardDisplay }),
  setFilterVisibilityMode: (filterVisibilityMode) =>
    set({ filterVisibilityMode }),
  resetStoryView: () =>
    set({
      filters: defaultFilters,
      cardSize: "md",
      cardDisplay: "grid",
      filterVisibilityMode: "hide",
    }),
}));
