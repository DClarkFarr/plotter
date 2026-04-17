import { Badge, Card, Dropdown, DropdownItem } from "flowbite-react";
import type { Story } from "../../api/types";
import IconArrowRight from "~icons/mdi/arrow-right";
import IconDotsHorizontal from "~icons/mdi/dots-horizontal";

interface StoryCardProps {
  story: Story;
  onClick: (story: Story) => void;
  isNew?: boolean;
  onDuplicate?: (story: Story) => void;
  isDuplicating?: boolean;
  onExport?: (story: Story) => void;
  isExporting?: boolean;
}

export function StoryCard({
  story,
  onClick,
  isNew,
  onDuplicate,
  isDuplicating,
  onExport,
  isExporting,
}: StoryCardProps) {
  const handleClick = () => {
    onClick(story);
  };

  return (
    <Card
      className={`card h-full cursor-pointer group/card ${isNew ? "shadow-[0_0_20px_theme(colors.sky.300)]" : "shadow-sm"}`}
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

            <Badge color="light">{story.stats.characters} characters</Badge>

            <Badge color="light">{story.stats.tags} tags</Badge>
          </div>
        </div>
        <div className="self-center flex items-center gap-1">
          {(onDuplicate || onExport) && (
            <div onClick={(e) => e.stopPropagation()} className="relative">
              <Dropdown
                className="w-[160px]"
                label=""
                renderTrigger={() => (
                  <button
                    type="button"
                    disabled={isDuplicating || isExporting}
                    className="flex items-center justify-center rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    aria-label="Story actions"
                  >
                    <IconDotsHorizontal className="text-xl" />
                  </button>
                )}
                placement="bottom-end"
              >
                {onExport && (
                  <DropdownItem
                    onClick={() => onExport(story)}
                    disabled={isExporting}
                  >
                    Export to .docx
                  </DropdownItem>
                )}
                {onDuplicate && (
                  <DropdownItem
                    onClick={() => onDuplicate(story)}
                    disabled={isDuplicating}
                  >
                    Duplicate story
                  </DropdownItem>
                )}
              </Dropdown>
            </div>
          )}
          <IconArrowRight className="text-2xl opacity-50 group-hover/card:opacity-100 transition-[opacity] duration-[300ms]" />
        </div>
      </div>
    </Card>
  );
}
