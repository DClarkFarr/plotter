import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDescriptionExcerpt } from "../../../hooks/use-description-excerpt";
import { findCharacterById } from "../../../utils/characterLookup";
import { CharacterDisplay } from "../../character/CharacterDisplay";
import { Button, ButtonGroup } from "flowbite-react";
import {
  useStoryCharactersQuery,
  useStoryTagsQuery,
} from "../../../queries/story/story-queries";
import { SceneTags } from "../../story/SceneTags";
import IconArrowAll from "~icons/mdi/arrow-all";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import { useSortable } from "@dnd-kit/react/sortable";
import { memo } from "react";

export const SceneCard = memo(
  ({ plot, scene, plotIndex, sceneIndex }: SceneRendererProps) => {
    const theme = usePlotTheme(plot.color);
    const selectScene = useSceneEditorStore((s) => s.selectScene);
    const openSidebar = useSidebarStore((s) => s.openSidebar);
    const addSidebarView = useSidebarStore((s) => s.addSidebarView);
    const cardSize = useStoryStore((s) => s.cardSize);
    const { data: characters = [] } = useStoryCharactersQuery(plot.storyId);

    const { data } = useStoryTagsQuery(plot.storyId);

    const tags = data ?? [];

    const { width, padding, minHeight } = useGridSizes({ cardSize });

    const descriptionText = useDescriptionExcerpt({
      description: scene.description,
      cardSize,
    });

    const {
      ref: containerRef,
      // isDropTarget,
      isDragSource,
      isDragging,
      // isDropping,
      handleRef,
    } = useSortable({
      id: scene.id,
      index: sceneIndex,
      group: plotIndex,
      type: "scene",
      data: {
        plot,
        scene,
        verticalIndex: sceneIndex,
      },
    });

    const isDropTarget = false; // disabling dropping animation

    const povCharacter = findCharacterById(characters, scene.pov);

    const themeStyles = {
      "--plot-color": theme.baseColor,
      "--plot-color-soft": theme.softColor,
      "--plot-text": theme.textColor,
      "--card-padding": `${padding}px`,
      "--column-width": `${width}px`,
      "--card-min-height": `${minHeight}px`,
    };

    const handleSelect = () => {
      selectScene(scene.id, plot.id);
      openSidebar();
      addSidebarView("scene");
    };

    const handleEdit = () => {
      handleSelect();
    };

    return (
      <div
        ref={containerRef}
        style={themeStyles}
        data-r={sceneIndex}
        data-c={plotIndex}
        className={`card card--scene group relative z-1 focus-within:z-10 p-[var(--card-padding)] w-[var(--column-width)] min-h-[var(--card-min-height)] border border-[var(--plot-color-soft)] radius-2 h-full ${isDragging ? `scale-80` : ``} ${isDropTarget && !isDragSource ? `text-white border-purple-300 bg-purple-900 shadow-lg` : `bg-[var(--plot-color)]  border-[var(--plot-color)] text-[var(--plot-text)]`}`}
      >
        <ButtonGroup className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <Button
            ref={handleRef}
            color="gray"
            size="xs"
            type="button"
            aria-label="Move scene"
          >
            <IconArrowAll />
          </Button>
          <Button
            color="cyan"
            size="xs"
            type="button"
            aria-label="Edit scene"
            onClick={handleEdit}
          >
            <IconLeadPencil />
          </Button>
        </ButtonGroup>
        <div className="-mt-[var(--card-padding)] -ml-[var(--card-padding)] pt-0.5 pl-0.5 pb-1">
          <SceneTags
            tags={tags}
            selectedTags={scene.tags ?? []}
            tagVariants={scene.tagVariants ?? []}
          />
        </div>
        <div className={`flex flex-col gap-2 h-full relative`}>
          <div className="flex gap-2 items-center">
            {povCharacter ? (
              <div>
                {cardSize !== "sm" ? (
                  <CharacterDisplay
                    character={povCharacter}
                    showColorDot
                    popoverProps={{ popoverClassName: "z-1000 -left-6! mt-0!" }}
                  />
                ) : (
                  <CharacterDisplay
                    character={povCharacter}
                    avatarOnly
                    popoverProps={{ popoverClassName: "z-1000" }}
                  />
                )}
              </div>
            ) : null}
          </div>

          <div
            className={`text-lg font-semibold ${cardSize === "md" ? "whitespace-nowrap overflow-hidden text-ellipsis" : ""}`}
          >
            {scene.title?.trim() || "Untitled scene"}
          </div>

          {cardSize === "md" && (
            <div className="text-sm text-[var(--plot-text)]/80 line-clamp-3">
              {descriptionText || "No description yet."}
            </div>
          )}
          {cardSize === "lg" && (
            <div
              className="text-sm text-[var(--plot-text)]/80 tiptap overflow-y-auto grow-1 max-h-[350px]"
              dangerouslySetInnerHTML={{ __html: descriptionText }}
            ></div>
          )}
        </div>
      </div>
    );
  },
);
