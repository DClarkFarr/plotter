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

export const EmptyCard = ({
  storyId,
  isDisabled,
  plot,
  sceneIndex,
  plotIndex,
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
    accept: "item",
    type: "droppable",
    data: {
      plot: plot,
      verticalIndex: sceneIndex,
    },
    collisionPriority: CollisionPriority.Normal,
  });

  console.log("empty", plotIndex, sceneIndex, { isDropTarget });

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

    const scene = await createSceneMutation.mutateAsync({
      plotId: plot.id,
      title,
      description: "",
      scene: null,
      tags: [],
      todo: [],
      verticalIndex: sceneIndex,
    });

    if (scene?.id) {
      selectScene(scene.id, scene.plotId);
      openSidebar();
      addSidebarView("scene");
    }
  };

  return (
    <div
      ref={ref}
      style={themeStyles}
      className={`card card--empty p-[var(--card-padding)] w-[var(--column-width)] h-full border radius-2 transition-all duration-250 ${isDropTarget ? `text-white border-purple-300 bg-purple-900 shadow-lg` : `bg-[var(--plot-color)]  border-[var(--plot-color)] text-[var(--plot-text)]`} ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <div
        className={`flex ${cardSize !== "sm" && "flex-col"} gap-4 items-center justify-center h-full`}
      >
        <div className="text-lg">Create scene</div>
        <div>
          <button
            className={`text-2xl ${cardSize === "lg" ? "p-4" : "p-2"} text-[var(--plot-text)] ${
              isBusy
                ? "cursor-not-allowed bg-gray-200"
                : "cursor-pointer bg-[var(--plot-color-soft)]"
            }`}
            type="button"
            aria-disabled={isBusy}
            disabled={isBusy}
            onClick={handleCreate}
          >
            <IconPlus />
          </button>
        </div>
      </div>
    </div>
  );
};
