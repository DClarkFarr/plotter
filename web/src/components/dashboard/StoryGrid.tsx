import type { Story } from "../../api/types";
import { StoryCard } from "./StoryCard";

interface StoryGridProps {
  stories: Story[];
  isLoading: boolean;
  isError: boolean;
  onViewStory: (story: Story) => void; 
}

export function StoryGrid({ stories, isLoading, isError, onViewStory }: StoryGridProps) {
  
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        We could not load your stories yet. Please try again.
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No stories yet. Create your first story to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} onClick={onViewStory} />
      ))}
    </div>
  );
}
