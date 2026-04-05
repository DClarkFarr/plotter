import type { Plot } from "../../api/types";
import { orderScenesForListView } from "../../utils/listViewOrdering";
import { ListViewScene } from "./ListViewScene";
import type { ListViewDisplayMode } from "../../store/storyStore.types";
import {
  useStoryCharactersQuery,
  useStoryTagsQuery,
} from "../../queries/story/story-queries";

export type ListViewProps = {
  storyId: string;
  plots: Plot[];
};

export const ListView = ({ storyId, plots }: ListViewProps) => {
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const { data: characters = [] } = useStoryCharactersQuery(storyId);
  const orderedScenes = orderScenesForListView(plots);
  const displayMode: ListViewDisplayMode = "normal";

  if (orderedScenes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No scenes yet. Add a scene to start your story.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {orderedScenes.map(({ scene, plot }) => (
        <ListViewScene
          key={scene.id}
          scene={scene}
          plot={plot}
          tags={tags}
          characters={characters}
          displayMode={displayMode}
        />
      ))}
    </div>
  );
};
