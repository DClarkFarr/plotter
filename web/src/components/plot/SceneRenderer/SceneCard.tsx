import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDescriptionExcerpt } from "../../../hooks/use-description-excerpt";

export const SceneCard = ({ plot, scene }: SceneRendererProps) => {
  const theme = usePlotTheme(plot.color);
  const selectScene = useSceneEditorStore((s) => s.selectScene);
  const openSidebar = useSidebarStore((s) => s.openSidebar);
  const cardSize = useStoryStore((s) => s.cardSize);

  const { width } = useGridSizes({ cardSize });

  const descriptionText = useDescriptionExcerpt({
    description: scene.description,
    cardSize,
  });

  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
  };

  const handleSelect = () => {
    selectScene(scene.id, plot.id);
    openSidebar();
  };

  return (
    <div
      style={{ ...themeStyles, "--column-width": `${width}px` }}
      className="card card--empty w-[var(--column-width)] border border-[var(--plot-color-soft)] radius-2 h-full bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300 cursor-pointer hover:bg-[var(--plot-color-soft)]"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className="p-6 flex flex-col gap-2 h-full">
        {cardSize !== "sm" && (
          <div className="text-sm uppercase tracking-[0.2em] text-[var(--plot-text)]/70">
            Row {scene.verticalIndex + 1}
          </div>
        )}
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
            className="text-sm text-[var(--plot-text)]/80 line-clamp-3 tiptap"
            dangerouslySetInnerHTML={{ __html: descriptionText }}
          ></div>
        )}
      </div>
    </div>
  );
};
