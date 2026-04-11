import { useMemo } from "react";
import type { Plot } from "../../api/types";
import {
  entryIsScene,
  orderScenesForListView,
} from "../../utils/listViewOrdering";
import { ListViewScene } from "./ListViewScene";
import { useStoryStore } from "../../store/storyStore";
import {
  useStoryCharactersQuery,
  useStoryTagsQuery,
} from "../../queries/story/story-queries";
import { StoryFiltersBar } from "./StoryFiltersBar";
import { applyFiltersToPlots } from "../../utils/applyFiltersToPlots";
import { useStorySectionsQuery } from "../../queries/section/section-queries";
import { ListViewSection } from "./ListViewSection";

export type ListViewProps = {
  storyId: string;
  plots: Plot[];
};

export const ListView = ({ storyId, plots }: ListViewProps) => {
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const { data: characters = [] } = useStoryCharactersQuery(storyId);
  const { data: sections = [] } = useStorySectionsQuery(storyId);

  const filters = useStoryStore((state) => state.filters);
  const hasFilters = useStoryStore((state) => state.hasFilters());
  const filterVisibilityMode = useStoryStore(
    (state) => state.filterVisibilityMode,
  );
  const { includedSceneIds } = useMemo(
    () => applyFiltersToPlots(plots, filters, { tags, characters }),
    [plots, filters, tags, characters],
  );

  const includedSceneIdSet = useMemo(
    () => new Set(includedSceneIds),
    [includedSceneIds],
  );
  const orderedScenes = useMemo(
    () => orderScenesForListView(plots, sections),
    [plots, sections],
  );

  if (orderedScenes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No scenes yet. Add a scene to start your story.
      </div>
    );
  }

  return (
    <div
      className="y-scroller overflow-y-auto h-[var(--grid-height)]"
      style={{ "--grid-height": `calc(100vh - 61px)` }}
    >
      <div className="sticky top-0 z-155 mx-auto max-w-[1000px]">
        <StoryFiltersBar plots={plots} tags={tags} characters={characters} />
      </div>

      <div className="flex my-6 flex-col mx-auto max-w-[1000px] gap-y-2">
        {orderedScenes.map((entry) => {
          if (entryIsScene(entry)) {
            const { scene, plot } = entry;
            return (
              <ListViewScene
                key={scene.id}
                scene={scene}
                plot={plot}
                tags={tags}
                characters={characters}
                filterVisibilityMode={filterVisibilityMode}
                isFilterExcluded={
                  hasFilters && !includedSceneIdSet.has(scene.id)
                }
              />
            );
          }

          const { section } = entry;
          return <ListViewSection section={section} />;
        })}
      </div>
    </div>
  );
};
