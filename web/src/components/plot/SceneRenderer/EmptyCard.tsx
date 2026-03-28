import type { EmptyRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import IconPlus from "~icons/mdi/plus";
import { useCreateSceneMutation } from "../../../hooks/useStory";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";

export const EmptyCard = ({
  storyId,
  isDisabled,
  plot,
  sceneIndex,
}: EmptyRendererProps) => {
  const theme = usePlotTheme(plot?.color);
  const createSceneMutation = useCreateSceneMutation(storyId);
  const selectScene = useSceneEditorStore((s) => s.selectScene);
  const openSidebar = useSidebarStore((s) => s.openSidebar);

  const cardSize = useStoryStore((s) => s.cardSize);

  const { width } = useGridSizes({ cardSize });

  const isBusy = createSceneMutation.isPending || Boolean(isDisabled);

  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
    "--column-width": `${width}px`,
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
    }
  };

  return (
    <div
      style={themeStyles}
      className={`card card--empty w-[var(--column-width)] h-full border border-[var(--plot-color)] radius-2 bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300 self-stretch ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <div
        className={`p-6 flex ${cardSize !== "sm" && "flex-col"} gap-4 items-center justify-center h-full`}
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
