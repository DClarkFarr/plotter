export type StoryCardSize = "sm" | "md" | "lg";

export type StoryCardDisplay = "grid" | "list";

export interface StoryFilters {
  tagIds: string[];
}

export interface StoryState {
  filters: StoryFilters;
  cardSize: StoryCardSize;
  cardDisplay: StoryCardDisplay;
  setFilters: (filters: StoryFilters) => void;
  setCardSize: (size: StoryCardSize) => void;
  setCardDisplay: (display: StoryCardDisplay) => void;
  resetStoryView: () => void;
}
