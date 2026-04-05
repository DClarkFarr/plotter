import type { Character, Plot, Scene, Tag } from "../../api/types";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import { SceneTags } from "./SceneTags";
import { CharacterDisplay } from "../character/CharacterDisplay";
import { findCharacterById } from "../../utils/characterLookup";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { ListViewTodoList } from "./ListViewTodoList";
import type { ListViewDisplayMode } from "../../store/storyStore.types";

export type ListViewSceneProps = {
  scene: Scene;
  plot: Plot;
  tags: Tag[];
  characters: Character[];
  displayMode: ListViewDisplayMode;
};

export const ListViewScene = ({
  scene,
  plot,
  tags,
  characters,
  displayMode,
}: ListViewSceneProps) => {
  const selectScene = useSceneEditorStore((state) => state.selectScene);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const addSidebarView = useSidebarStore((state) => state.addSidebarView);
  const povCharacter = findCharacterById(characters, scene.pov);

  const handleEdit = () => {
    selectScene(scene.id, plot.id);
    openSidebar();
    addSidebarView("scene");
  };

  const title = scene.title?.trim() || "Untitled scene";
  const description = scene.description?.trim() || "";
  const showFull = displayMode === "normal";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {povCharacter ? (
        <div className="flex justify-end">
          <CharacterDisplay
            character={povCharacter}
            avatarOnly
            showColorDot
            avatarSize="md"
            popoverProps={{ popoverClassName: "z-1000" }}
          />
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-2">
        <h3 className="text-2xl font-semibold text-slate-900 flex-1">
          {title}
        </h3>
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-full p-1 text-slate-400 transition hover:text-slate-700"
          aria-label="Edit scene"
        >
          <IconLeadPencil className="text-lg" />
        </button>
      </div>

      <div className="mt-2">
        <SceneTags
          tags={tags}
          selectedTags={scene.tags ?? []}
          tagVariants={scene.tagVariants ?? []}
          badgeSize="lg"
        />
      </div>

      {showFull ? (
        <div className="mt-4">
          {description ? (
            <div
              className="tiptap text-sm text-slate-700 leading-6"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-sm italic text-slate-500">No description yet.</p>
          )}
          <ListViewTodoList items={scene.todo ?? []} />
        </div>
      ) : null}
    </article>
  );
};
