import { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import {
  entryIsScene,
  entryIsSection,
  orderScenesForListView,
  type OrderedSceneEntry,
} from "../../utils/listViewOrdering";
import { ListViewScene } from "./ListViewScene";
import { useStoryStore } from "../../store/storyStore";
import {
  useStoryCharactersQuery,
  useStoryPlotsQuery,
  useStoryScenesQuery,
  useStoryTagsQuery,
} from "../../queries/story/story-queries";
import { StoryFiltersBar } from "./StoryFiltersBar";
import { applyFiltersToPlots } from "../../utils/applyFiltersToPlots";
import { useStorySectionsQuery } from "../../queries/section/section-queries";
import { ListViewSection } from "./ListViewSection";
import { ListViewSidebarItem } from "./ListViewSidebarItem";

export type ListViewProps = {
  storyId: string;
};

export const ListView = ({ storyId }: ListViewProps) => {
  const { data: plots = [] } = useStoryPlotsQuery(storyId);
  const { data: scenes = [] } = useStoryScenesQuery(storyId);
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const { data: characters = [] } = useStoryCharactersQuery(storyId);
  const { data: sections = [] } = useStorySectionsQuery(storyId);

  const filters = useStoryStore((state) => state.filters);
  const hasFilters = useStoryStore((state) => state.hasFilters());
  const filterVisibilityMode = useStoryStore(
    (state) => state.filterVisibilityMode,
  );
  const { includedSceneIds } = useMemo(
    () => applyFiltersToPlots(plots, scenes, filters, { tags, characters }),
    [plots, scenes, filters, tags, characters],
  );

  const includedSceneIdSet = useMemo(
    () => new Set(includedSceneIds),
    [includedSceneIds],
  );
  const orderedScenes = useMemo(() => {
    const sorted = orderScenesForListView(plots, scenes, sections);

    const filteredScenes = sorted
      /**
       * Filter out excluded scenes
       */
      .filter((entry) => {
        const isExcluded = entryIsScene(entry)
          ? hasFilters && !includedSceneIdSet.has(entry.scene.id)
          : false;

        if (filterVisibilityMode === "matchOnly" && hasFilters && isExcluded) {
          return false;
        }

        return true;
      });

    if (!(filterVisibilityMode === "matchOnly" && hasFilters)) {
      return filteredScenes;
    }

    /**
     * Filter out sections that have no included scenes, unless filterVisibilityMode is "minify"
     */

    let hasFoundScene = false;

    const filteredEntriesEmptyChapters: OrderedSceneEntry[] = [];

    for (let i = filteredScenes.length - 1; i >= 0; i--) {
      const entry = filteredScenes[i];

      /**
       * Remove chapters without scenes
       */
      if (entryIsSection(entry) && entry.type === "chapter" && !hasFoundScene) {
        continue;
      }

      if (entryIsScene(entry)) {
        hasFoundScene = true;
      } else {
        hasFoundScene = false;
      }

      filteredEntriesEmptyChapters.push(entry);
    }

    const filteredEntriesEmptyScenes: OrderedSceneEntry[] = [];
    hasFoundScene = false;
    for (let i = filteredEntriesEmptyChapters.length - 1; i >= 0; i--) {
      const entry = filteredEntriesEmptyChapters[i];

      /**
       * Remove acts without scenes
       */
      if (entryIsSection(entry) && !hasFoundScene) {
        continue;
      }

      if (entryIsScene(entry)) {
        hasFoundScene = true;
      } else if (entry.type === "act") {
        hasFoundScene = false;
      }

      filteredEntriesEmptyScenes.push(entry);
    }

    return filteredEntriesEmptyScenes.reverse();
  }, [
    plots,
    scenes,
    sections,
    hasFilters,
    includedSceneIdSet,
    filterVisibilityMode,
  ]);

  const isScrolling = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Sync sidebar Virtuoso scroll position to active item
  useEffect(() => {
    if (activeIndex !== null) {
      virtuosoRef.current?.scrollIntoView({
        index: activeIndex,
        behavior: "auto",
      });
    }
  }, [activeIndex]);

  // Track which main-list item is topmost in the viewport via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) intersecting.add(e.target.id);
          else intersecting.delete(e.target.id);
        }
        for (let i = 0; i < orderedScenes.length; i++) {
          const entry = orderedScenes[i];
          const id = entryIsScene(entry)
            ? `list-item-scene-${entry.scene.id}`
            : `list-item-section-${entry.section.id}`;
          if (intersecting.has(id) && !isScrolling.current) {
            setActiveIndex(i);
            return;
          }
        }
      },
      { root: container, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    container
      .querySelectorAll('[id^="list-item-"]')
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [orderedScenes]);

  const handleSidebarClick = (index: number) => {
    const entry = orderedScenes[index];
    if (!entry) return;
    const id = entryIsScene(entry)
      ? `list-item-scene-${entry.scene.id}`
      : `list-item-section-${entry.section.id}`;

    setActiveIndex(index);
    isScrolling.current = true;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      isScrolling.current = false;
    }, 500);
  };

  if (orderedScenes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No scenes yet. Add a scene to start your story.
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="y-scroller overflow-y-auto h-[var(--grid-height)]"
      style={{
        "--grid-height": `calc(100vh - 61px)`,
        "--sidebar-height": `calc(100vh - 101px)`,
      }}
    >
      <div className="flex mx-auto gap-x-4 px-6 pt-6">
        <div className="shrink w-[300px] sticky top-0 bg-white h-[var(--sidebar-height)] shadow-md">
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%" }}
            context={{ isScrolling }}
            data={orderedScenes}
            itemContent={(_index, entry) => {
              const isExcluded = entryIsScene(entry)
                ? hasFilters && !includedSceneIdSet.has(entry.scene.id)
                : false;
              return (
                <ListViewSidebarItem
                  entry={entry}
                  isActive={activeIndex === _index}
                  isFilterExcluded={isExcluded}
                  filterVisibilityMode={filterVisibilityMode}
                  onClick={() => handleSidebarClick(_index)}
                />
              );
            }}
          />
        </div>
        <div className="grow max-w-[1000px]">
          <div className="sticky top-0 z-155">
            <StoryFiltersBar
              plots={plots}
              scenes={scenes}
              tags={tags}
              characters={characters}
            />
          </div>
          <div className="flex my-6 flex-col gap-y-2">
            {orderedScenes.map((entry) => {
              if (entryIsScene(entry)) {
                const { scene, plot } = entry;
                return (
                  <div key={scene.id} id={`list-item-scene-${scene.id}`}>
                    <ListViewScene
                      scene={scene}
                      plot={plot}
                      tags={tags}
                      characters={characters}
                      filterVisibilityMode={filterVisibilityMode}
                      isFilterExcluded={
                        hasFilters && !includedSceneIdSet.has(scene.id)
                      }
                    />
                  </div>
                );
              }

              const { section } = entry;
              return (
                <div key={section.id} id={`list-item-section-${section.id}`}>
                  <ListViewSection section={section} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
