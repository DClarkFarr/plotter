import type { EmptyRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import IconPlus from "~icons/mdi/plus";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useCreateSceneMutation } from "../../../queries/scene/scene-mutations";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { memo } from "react";
import { Button, ButtonGroup, Tooltip } from "flowbite-react";

export const EmptyCard = memo(
  ({
    storyId,
    isDisabled,
    plot,
    sceneIndex,
    // plotIndex,
  }: EmptyRendererProps) => {
    const theme = usePlotTheme(plot?.color);
    const createSceneMutation = useCreateSceneMutation(storyId);
    const selectScene = useSceneEditorStore((s) => s.selectScene);
    const openSidebar = useSidebarStore((s) => s.openSidebar);
    const addSidebarView = useSidebarStore((s) => s.addSidebarView);

    const cardSize = useStoryStore((s) => s.cardSize);

    const { width, padding } = useGridSizes({ cardSize });

    const isBusy = createSceneMutation.isPending || Boolean(isDisabled);

    const { isDropTarget, ref } = useDroppable({
      id: `empty-${plot?.id}-${sceneIndex}`,
      accept: "scene",
      type: "droppable",
      data: {
        plot: plot,
        verticalIndex: sceneIndex,
      },
      collisionPriority: CollisionPriority.Normal,
    });

    // TODO: put this back and make it better
    // console.log("empty", plotIndex, sceneIndex, { isDropTarget });

    const themeStyles = {
      "--plot-color": theme.baseColor,
      "--plot-color-soft": theme.softColor,
      "--plot-text": theme.textColor,
      "--column-width": `${width}px`,
      "--card-padding": `${padding}px`,
    };

    const handleCreate = async () => {
      if (!plot || isBusy) {
        return;
      }

      const rowNumber = sceneIndex + 1;
      const plotName = plot.title?.trim() || "Untitled Plot";
      const title = `Scene ${rowNumber} in ${plotName}`;

      const response = await createSceneMutation.mutateAsync({
        plotId: plot.id,
        title,
        description: "",
        scene: null,
        tags: [],
        todo: [],
        verticalIndex: sceneIndex,
      });

      if (response?.scene) {
        selectScene(response?.scene.id, response?.scene.plotId);
        openSidebar();
        addSidebarView("scene");
      }
    };

    // console.log("render EmptyCard", plotIndex, sceneIndex);

    return (
      <div
        ref={ref}
        style={themeStyles}
        className={`card card--empty group relative p-[var(--card-padding)] w-[var(--column-width)] h-full border radius-2 transition-colors duration-250 ${isDropTarget ? `text-white border-purple-300 bg-purple-900 shadow-lg` : `bg-gray-200 border-gray-300 text-gray-800`} ${
          isDisabled ? "opacity-50" : ""
        }`}
      >
        {!isDropTarget && (
          <div className="h-full w-full flex justify-center items-center">
            <ButtonGroup className="button-group opacity-0 transition-opacity duration-250 -z-1 group-hover:opacity-100 group-hover:z-1">
              <Tooltip content="Create a new scene">
                <Button
                  type="button"
                  className="px-2 py-2 leading-none h-auto cursor-pointer"
                  color="dark"
                  aria-disabled={isBusy}
                  disabled={isBusy}
                  onClick={handleCreate}
                >
                  <IconPlus />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </div>
        )}
      </div>
    );
  },
);
