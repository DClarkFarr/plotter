import { TextInput, Tooltip } from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Character, Plot, Tag } from "../../api/types";
import { useStoryStore } from "../../store/storyStore";
import type { StoryFilter } from "../../store/storyStore.types";

import IconChevronLeft from "~icons/mdi/chevron-left";
import IconChevronRight from "~icons/mdi/chevron-right";
import IconFilter from "~icons/mdi/filter";
import IconMagnify from "~icons/mdi/magnify";

const ALL_VARIANTS_VALUE = "all";

type MenuView = "root" | "tags" | "tagVariants" | "plots" | "characters";

export type StoryFiltersMenuProps = {
  tags: Tag[];
  plots: Plot[];
  characters: Character[];
  onOpenCustomText: () => void;
};

const filterByQuery = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase());

const buildFilter = (
  type: StoryFilter["type"],
  value1: string,
  value2?: string,
): StoryFilter => ({ type, value1, value2 });

export const StoryFiltersMenu = ({
  tags,
  plots,
  characters,
  onOpenCustomText,
}: StoryFiltersMenuProps) => {
  const addFilter = useStoryStore((state) => state.addFilter);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>("root");
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [tagQuery, setTagQuery] = useState("");
  const [plotQuery, setPlotQuery] = useState("");
  const [characterQuery, setCharacterQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView("root");
        setActiveTag(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );
  const sortedPlots = useMemo(
    () => [...plots].sort((a, b) => a.title.localeCompare(b.title)),
    [plots],
  );
  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.title.localeCompare(b.title)),
    [characters],
  );

  const filteredTags = useMemo(
    () => sortedTags.filter((tag) => filterByQuery(tag.name, tagQuery)),
    [sortedTags, tagQuery],
  );
  const filteredPlots = useMemo(
    () => sortedPlots.filter((plot) => filterByQuery(plot.title, plotQuery)),
    [sortedPlots, plotQuery],
  );
  const filteredCharacters = useMemo(
    () =>
      sortedCharacters.filter((character) =>
        filterByQuery(character.title, characterQuery),
      ),
    [sortedCharacters, characterQuery],
  );

  const closeMenu = () => {
    setIsOpen(false);
    setView("root");
    setActiveTag(null);
  };

  const applyFilter = (filter: StoryFilter) => {
    addFilter(filter);
    closeMenu();
  };

  const handleTagSelect = (tag: Tag) => {
    if (tag.variant && tag.variants.length > 0) {
      setActiveTag(tag);
      setView("tagVariants");
      return;
    }

    applyFilter(buildFilter("tag", tag.name));
  };

  const handleVariantSelect = (variant: string) => {
    if (!activeTag) {
      return;
    }

    applyFilter(buildFilter("tag", activeTag.name, variant));
  };

  const handleCustomText = () => {
    onOpenCustomText();
    closeMenu();
  };

  return (
    <div className="relative" ref={containerRef}>
      <Tooltip content="Filter Scenes" className="whitespace-nowrap">
        <button
          type="button"
          className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 flex items-center gap-2"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <IconFilter className="text-base text-slate-600" />
        </button>
      </Tooltip>

      {isOpen ? (
        <div className="absolute z-200 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          {view === "root" ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Filter by
              </p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setView("tags")}
                >
                  <span>Tags</span>
                  <IconChevronRight className="text-base text-slate-400" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setView("plots")}
                >
                  <span>Plots</span>
                  <IconChevronRight className="text-base text-slate-400" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setView("characters")}
                >
                  <span>Characters</span>
                  <IconChevronRight className="text-base text-slate-400" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={handleCustomText}
                >
                  <span>Custom text</span>
                </button>
              </div>
            </div>
          ) : null}

          {view === "tags" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"
                onClick={() => setView("root")}
              >
                <IconChevronLeft className="text-base" />
                Tags
              </button>
              <TextInput
                sizing="sm"
                placeholder="Search tags"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                icon={IconMagnify}
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-slate-500">No tags found.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => handleTagSelect(tag)}
                      >
                        <span className="truncate">{tag.name}</span>
                        {tag.variant && tag.variants.length > 0 ? (
                          <IconChevronRight className="text-base text-slate-400" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {view === "tagVariants" && activeTag ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"
                onClick={() => {
                  setView("tags");
                  setActiveTag(null);
                }}
              >
                <IconChevronLeft className="text-base" />
                {activeTag.name}
              </button>
              <div className="max-h-64 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => handleVariantSelect(ALL_VARIANTS_VALUE)}
                  >
                    All
                  </button>
                  {activeTag.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => handleVariantSelect(variant)}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {view === "plots" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"
                onClick={() => setView("root")}
              >
                <IconChevronLeft className="text-base" />
                Plots
              </button>
              <TextInput
                sizing="sm"
                placeholder="Search plots"
                value={plotQuery}
                onChange={(event) => setPlotQuery(event.target.value)}
                icon={IconMagnify}
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredPlots.length === 0 ? (
                  <p className="text-sm text-slate-500">No plots found.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredPlots.map((plot) => (
                      <button
                        key={plot.id}
                        type="button"
                        className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          applyFilter(buildFilter("plot", plot.title))
                        }
                      >
                        {plot.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {view === "characters" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400"
                onClick={() => setView("root")}
              >
                <IconChevronLeft className="text-base" />
                Characters
              </button>
              <TextInput
                sizing="sm"
                placeholder="Search characters"
                value={characterQuery}
                onChange={(event) => setCharacterQuery(event.target.value)}
                icon={IconMagnify}
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredCharacters.length === 0 ? (
                  <p className="text-sm text-slate-500">No characters found.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredCharacters.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          applyFilter(buildFilter("character", character.title))
                        }
                      >
                        {character.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
