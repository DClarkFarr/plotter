import { useMemo, type CSSProperties } from "react";
import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";

function stripTagsButLeaveText(html: string) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}
export const SceneCard = ({ plot, scene }: SceneRendererProps) => {
  const theme = usePlotTheme(plot.color);
  const sidebar = useSidebarStore();
  const selectScene = useSceneEditorStore((s) => s.selectScene);
  const descriptionText = useMemo(() => {
    return stripTagsButLeaveText(scene.description || "");
  }, [scene.description]);

  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
  } as CSSProperties;

  const handleSelect = () => {
    selectScene(scene);
    sidebar.openSidebar();
  };

  return (
    <div
      style={themeStyles}
      className="card card--empty border border-[var(--plot-color-soft)] radius-2 h-[200px] bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300 cursor-pointer hover:bg-[var(--plot-color-soft)]"
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
        <div className="text-sm uppercase tracking-[0.2em] text-[var(--plot-text)]/70">
          Row {scene.verticalIndex + 1}
        </div>
        <div className="text-lg font-semibold">
          {scene.title?.trim() || "Untitled scene"}
        </div>
        <div className="text-sm text-[var(--plot-text)]/80 line-clamp-3">
          {descriptionText || "No description yet."}
        </div>
      </div>
    </div>
  );
};
