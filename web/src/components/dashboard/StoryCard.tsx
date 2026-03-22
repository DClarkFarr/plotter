import { Card } from "flowbite-react";
import type { Story } from "../../api/types";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {story.title}
            </h3>
            {story.description ? (
              <p className="mt-1 text-sm text-slate-600">{story.description}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">No description</p>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">
            {story.stats.plots} plots
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1">
            {story.stats.scenes} scenes
          </span>
        </div>
      </div>
    </Card>
  );
}
