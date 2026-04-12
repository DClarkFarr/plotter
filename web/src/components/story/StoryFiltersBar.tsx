import { useMemo } from "react";
import { useStoryStore } from "../../store/storyStore";
import type { StoryFilter } from "../../store/storyStore.types";
import IconClose from "~icons/mdi/close";
import { applyFiltersToPlots } from "../../utils/applyFiltersToPlots";
import type { Character, Plot, Scene, Tag } from "../../api/types";

const formatFilterType = (type: StoryFilter["type"]) => {
  switch (type) {
    case "tag":
      return "Tag";
    case "plot":
      return "Plot";
    case "character":
      return "Character";
    case "search":
      return "Search";
    default:
      return "Filter";
  }
};

const formatFilterValue = (filter: StoryFilter) => {
  if (filter.value2) {
    const variantLabel =
      filter.value2.toLowerCase() === "all" ? "All" : filter.value2;
    return `${filter.value1} / ${variantLabel}`;
  }

  return filter.value1;
};

export type StoryFiltersBarProps = {
  plots: Plot[];
  scenes: Scene[];
  tags: Tag[];
  characters: Character[];
};
export const StoryFiltersBar = ({
  plots,
  scenes,
  tags,
  characters,
}: StoryFiltersBarProps) => {
  const filters = useStoryStore((state) => state.filters);
  const removeFilter = useStoryStore((state) => state.removeFilter);
  const clearFilters = useStoryStore((state) => state.clearFilters);
  const hasFilters = useStoryStore((state) => state.hasFilters());

  const { includedSceneIds } = useMemo(
    () => applyFiltersToPlots(plots, scenes, filters, { tags, characters }),
    [plots, scenes, filters, tags, characters],
  );

  const filteredSceneCount = useMemo(() => scenes.length, [scenes]);

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="rounded border border-slate-200 bg-sky-100 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Filters
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter, index) => (
            <div
              key={`${filter.type}-${filter.value1}-${filter.value2 ?? ""}-${index}`}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              <span className="text-slate-500">
                {formatFilterType(filter.type)}
              </span>
              <span>{formatFilterValue(filter)}</span>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700"
                onClick={() => removeFilter(filter)}
              >
                <IconClose className="text-sm" />
              </button>
            </div>
          ))}
        </div>
        <div className="text-slate-500">
          Showing {includedSceneIds.length} of {filteredSceneCount} scenes
        </div>
        <div className="ml-auto">
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700"
            onClick={clearFilters}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};
