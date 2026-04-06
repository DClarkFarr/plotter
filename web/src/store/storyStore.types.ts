import type { Story } from "../api/types";

export type StoryCardSize = "sm" | "md" | "lg";

export type StoryCardDisplay = "grid" | "list";

export type ListViewDisplayMode = "normal" | "filterExcluded";

export type StoryFilterType = "tag" | "plot" | "character" | "search";

export type FilterVisibilityMode = "hide" | "minify";

export interface StoryFilter {
  type: StoryFilterType;
  value1: string;
  value2?: string;
}

export type StoryFilters = StoryFilter[];

export interface StoryState {
  filters: StoryFilters;
  cardSize: StoryCardSize;
  cardDisplay: StoryCardDisplay;
  filterVisibilityMode: FilterVisibilityMode;
  story: Story | null;
  setStory: (story: Story | null) => void;
  setFilters: (filters: StoryFilters) => void;
  addFilter: (filter: StoryFilter) => void;
  removeFilter: (filter: StoryFilter) => void;
  clearFilters: () => void;
  hasFilters: () => boolean;
  filtersByType: (type: StoryFilterType) => StoryFilter[];
  setCardSize: (size: StoryCardSize) => void;
  setCardDisplay: (display: StoryCardDisplay) => void;
  setFilterVisibilityMode: (mode: FilterVisibilityMode) => void;
  resetStoryView: () => void;
}
