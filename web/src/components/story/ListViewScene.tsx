import type { Character, Plot, Scene, Tag } from "../../api/types";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import IconEyeMinus from "~icons/mdi/eye-minus";
import { SceneTags } from "./SceneTags";
import { CharacterDisplay } from "../character/CharacterDisplay";
import { findCharacterById } from "../../utils/characterLookup";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { ListViewTodoList } from "./ListViewTodoList";
import type { FilterVisibilityMode } from "../../store/storyStore.types";
import { usePlotTheme } from "../../hooks/usePlotTheme";
import { useStoryStore } from "../../store/storyStore";
import { useEffect, useMemo, useState } from "react";
import { Button } from "flowbite-react";

export type ListViewSceneProps = {
  scene: Scene;
  plot: Plot;
  tags: Tag[];
  characters: Character[];
  filterVisibilityMode: FilterVisibilityMode;
  isFilterExcluded: boolean;
};

export const ListViewScene = ({
  scene,
  plot,
  tags,
  characters,
  filterVisibilityMode,
  isFilterExcluded,
}: ListViewSceneProps) => {
  const selectScene = useSceneEditorStore((state) => state.selectScene);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const addSidebarView = useSidebarStore((state) => state.addSidebarView);

  const cardSize = useStoryStore((s) => s.cardSize);
  const theme = usePlotTheme(plot.color);
  const povCharacter = useMemo(() => {
    return findCharacterById(characters, scene.pov);
  }, [characters, scene.pov]);

  const handleEdit = () => {
    selectScene(scene.id, scene.plotId);
    openSidebar();
    addSidebarView("scene");
  };

  const title = scene.title?.trim() || "Untitled scene";
  const description = scene.description?.trim() || "";
  const snippets = scene.snippets ?? [];
  const snippetDefaultOpenState = cardSize === "lg";

  if (isFilterExcluded) {
    if (filterVisibilityMode === "hide") {
      return (
        <div className="py-4 border-b border-slate-200 last:border-0">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Filter hidden
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
      );
    }

    return (
      <div
        className="py-4 pl-4 border-b border-slate-200 last:border-0 border-l-4 border-l-[var(--plot-color)]"
        style={{ "--plot-color": theme.baseColor }}
      >
        <div className="flex items-center gap-2 text-slate-600">
          <IconEyeMinus className="text-sm" />
          <p className="text-sm font-semibold truncate">{title}</p>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Filtered out
          </span>
        </div>
      </div>
    );
  }

  return (
    <article className="list-view-scene group border-b border-slate-200 group-last:border-0">
      <div
        className="p-6 last:mb-0 border-l-4 border-l-[var(--plot-color)]"
        style={{ "--plot-color": theme.baseColor }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-semibold text-slate-900 flex-1 flex gap-4 flex-wrap items-center">
            <span>{title}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {plot.title}
            </span>
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
        <div className="mt-2 flex flex-wrap gap-4 items-center">
          {povCharacter ? (
            <div className="flex justify-start">
              <CharacterDisplay
                character={povCharacter}
                avatarSize="sm"
                popoverProps={{ popoverClassName: "z-1000" }}
              />
            </div>
          ) : null}

          <SceneTags
            tags={tags}
            selectedTags={scene.tags ?? []}
            tagVariants={scene.tagVariants ?? []}
            badgeSize="lg"
          />
        </div>
        <div className="mt-4">
          {description ? (
            <div
              className="tiptap text-sm text-slate-700 leading-6"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-sm italic text-slate-500">No description yet.</p>
          )}

          {cardSize === "lg" && <ListViewTodoList items={scene.todo ?? []} />}

          {cardSize !== "sm" && snippets.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 mx-6">
              {snippets.map((snippet, index) => (
                <SnippetCard
                  key={`snippet-${index}`}
                  label={snippet.label}
                  text={snippet.text}
                  defaultOpenState={snippetDefaultOpenState}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

type SnippetCardProps = {
  label?: string | null;
  text?: string | null;
  defaultOpenState: boolean;
  index: number;
};

const SnippetCard = ({
  label,
  text,
  defaultOpenState,
  index,
}: SnippetCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpenState);

  useEffect(() => {
    setIsOpen(defaultOpenState);
  }, [defaultOpenState]);

  const title = label?.trim() || "Unnamed";
  const hasText = Boolean(text?.trim());

  return (
    <div className="rounded-lg px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Snippet: <b className="text-slate-600">{title}</b>
        </div>
        <Button
          color="alternative"
          type="button"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "Hide" : "Show"}
        </Button>
      </div>
      {isOpen ? (
        hasText ? (
          <div
            id={`snippet-body-${index}`}
            className="tiptap text-sm text-slate-700 leading-6 font-mono mt-2"
            dangerouslySetInnerHTML={{ __html: text ?? "" }}
          />
        ) : (
          <p
            id={`snippet-body-${index}`}
            className="text-sm italic text-slate-500 font-mono mt-2"
          >
            No snippet text yet.
          </p>
        )
      ) : null}
    </div>
  );
};
