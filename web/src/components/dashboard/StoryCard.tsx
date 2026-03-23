import { Badge, Card } from "flowbite-react";
import type { Story } from "../../api/types";
import IconArrowRight from "~icons/mdi/arrow-right";

interface StoryCardProps {
  story: Story;
  onClick: (story: Story) => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const handleClick = () => {
    onClick(story);
  };

  return (
    <Card
      className="card h-full cursor-pointer group/card shadow-sm"
      onClick={handleClick}
    >
      <div className="flex h-full gap-4 justify-between">
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{story.title}</h3>
              {story.description ? (
                <p className="mt-1 text-sm">{story.description}</p>
              ) : (
                <p className="mt-1 text-sm">No description</p>
              )}
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 text-xs">
            <Badge color="light">{story.stats.plots} plots</Badge>

            <Badge color="light">{story.stats.scenes} scenes</Badge>
          </div>
        </div>
        <div className="self-center">
          <IconArrowRight className="text-2xl opacity-50 group-hover/card:opacity-100 transition-[opacity] duration-[300ms]" />
        </div>
      </div>
    </Card>
  );
}
