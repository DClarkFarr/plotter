import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDescriptionExcerpt } from "../../../hooks/use-description-excerpt";
import { findCharacterById } from "../../../utils/characterLookup";
import { CharacterDisplay } from "../../character/CharacterDisplay";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import {
  useStoryCharactersQuery,
  useStoryPlotsQuery,
  useStoryTagsQuery,
} from "../../../queries/story/story-queries";
import { MoveSceneMutations } from "../../../queries/scene/scene-mutations";
import { SceneTags } from "../../story/SceneTags";
import IconArrowAll from "~icons/mdi/arrow-all";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import IconSwapHorizontal from "~icons/mdi/swap-horizontal";
import IconEyeRemove from "~icons/mdi/eye-remove";
import IconEyeMinus from "~icons/mdi/eye-minus";
import { memo } from "react";
import { useDraggable } from "@dnd-kit/react";
import { CustomTooltip } from "../../helpers/CustomTooltip";
import { alert } from "../../../utils/alert";

export const SceneCard = memo(
  ({
    plot,
    scene,
    plotIndex,
    sceneIndex,
    isFilterExcluded,
  }: SceneRendererProps) => {
    const theme = usePlotTheme(plot.color);
    const selectScene = useSceneEditorStore((s) => s.selectScene);
    const openSidebar = useSidebarStore((s) => s.openSidebar);
    const addSidebarView = useSidebarStore((s) => s.addSidebarView);
    const cardSize = useStoryStore((s) => s.cardSize);
    const filterVisibilityMode = useStoryStore((s) => s.filterVisibilityMode);
    const selectedSceneId = useSceneEditorStore((s) => s.selectedSceneId);
    const { data: characters = [] } = useStoryCharactersQuery(plot.storyId);
    const { data: storyPlots = [] } = useStoryPlotsQuery(plot.storyId);
    const { moveSingleCardWithinPlot, isMutating: isMovingScene } =
      MoveSceneMutations.useMoveSingleWithinPlot();

    const { data } = useStoryTagsQuery(plot.storyId);

    const tags = data ?? [];

    const { width, padding, minHeight } = useGridSizes({ cardSize });

    const descriptionText = useDescriptionExcerpt({
      description: scene.description,
      cardSize,
    });

    const {
      ref: containerRef,
      isDragSource,
      isDragging,
      handleRef,
    } = useDraggable({
      id: scene.id,
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

    const handleChangePlot = async (targetPlotId: string) => {
      if (targetPlotId === scene.plotId) {
        return;
      }

      try {
        await moveSingleCardWithinPlot({
          storyId: plot.storyId,
          sceneId: scene.id,
          fromPlotId: scene.plotId,
          toPlotId: targetPlotId,
          fromIndex: scene.verticalIndex,
          toIndex: scene.verticalIndex,
        });

        if (selectedSceneId === scene.id) {
          useSceneEditorStore.getState().selectScene(scene.id, targetPlotId);
        }
      } catch (error) {
        if (error instanceof Error) {
          alert.error(error.message);
        }
      }
    };

    if (isFilterExcluded) {
      if (filterVisibilityMode === "hide") {
        return (
          <div
            ref={containerRef}
            style={themeStyles}
            data-r={sceneIndex}
            data-c={plotIndex}
            className="card card--scene flex items-center gap-2 w-[var(--column-width)] border border-[var(--plot-color-soft)] bg-white/70 text-slate-500 px-3 py-1 min-h-[36px]"
          >
            <IconEyeRemove className="text-sm" />
            <span className="text-xs uppercase tracking-[0.2em]">Hidden</span>
          </div>
        );
      }

      return (
        <div
          ref={containerRef}
          style={themeStyles}
          data-r={sceneIndex}
          data-c={plotIndex}
          className="card card--scene flex items-center gap-2 w-[var(--column-width)] border border-[var(--plot-color-soft)] bg-white/70 text-slate-600 px-3 py-2 min-h-[48px]"
        >
          <IconEyeMinus className="text-sm" />
          <span className="text-sm font-semibold truncate">
            {scene.title?.trim() || "Untitled scene"}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        style={themeStyles}
        data-r={sceneIndex}
        data-c={plotIndex}
        className={`card card--scene group relative z-1 focus-within:z-10 p-[var(--card-padding)] w-[var(--column-width)] min-h-[var(--card-min-height)] border border-[var(--plot-color-soft)] radius-2 h-full ${isDragging ? `scale-80` : ``} ${isDropTarget && !isDragSource ? `text-white border-purple-300 bg-purple-900 shadow-lg` : `bg-[var(--plot-color)]  border-[var(--plot-color)] text-[var(--plot-text)]`}`}
      >
        <div className="button-group absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <CustomTooltip content="Move scene">
            <Button ref={handleRef} color="gray" size="xs" type="button">
              <IconArrowAll />
            </Button>
          </CustomTooltip>
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative"
          >
            <CustomTooltip content="Move to Plot">
              <Dropdown
                label=""
                placement="bottom-end"
                renderTrigger={() => (
                  <Button
                    color="blue"
                    size="xs"
                    type="button"
                    disabled={isMovingScene}
                    aria-label="Change plot"
                    className="rounded-none!"
                  >
                    <IconSwapHorizontal />
                  </Button>
                )}
              >
                {storyPlots
                  .filter((p) => p.id !== scene.plotId)
                  .map((targetPlot) => (
                    <DropdownItem
                      className="min-w-[150px]"
                      key={targetPlot.id}
                      onClick={() => void handleChangePlot(targetPlot.id)}
                    >
                      {targetPlot.title ||
                        `Plot ${targetPlot.horizontalIndex + 1}`}
                    </DropdownItem>
                  ))}
              </Dropdown>
            </CustomTooltip>
          </div>
          <CustomTooltip content="Edit scene">
            <Button color="cyan" size="xs" type="button" onClick={handleEdit}>
              <IconLeadPencil />
            </Button>
          </CustomTooltip>
        </div>
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
