import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { memo } from "react";
import type { Plot, Scene } from "../../../api/types";

type SceneActionsCardProps = {
  storyId: string;
  plot: Plot | undefined;
  plotIndex: number;
  sceneIndex: number;
  nextScene: Scene | undefined;
  prevScene: Scene | undefined;
  isDisabled?: boolean;
};
export const SceneActionsCard = memo(
  ({
    isDisabled,
    plot,
    sceneIndex,
    plotIndex,
    nextScene,
    prevScene,
  }: SceneActionsCardProps) => {
    const theme = usePlotTheme(plot?.color);

    const cardSize = useStoryStore((s) => s.cardSize);

    const { width } = useGridSizes({ cardSize });

    const isDroppable =
      !isDisabled && (sceneIndex === 0 || (!!prevScene?.id && !!nextScene?.id));

    const { isDropTarget, ref } = useDroppable({
      id: `actions-${plot?.id}-${sceneIndex}`,
      accept: "scene",
      type: "droppable",
      disabled: !isDroppable,
      data: {
        plot,
        verticalIndex: sceneIndex,
      },
      collisionPriority: CollisionPriority.High,
    });

    const themeStyles = {
      "--plot-color": theme.baseColor,
      "--plot-color-soft": theme.softColor,
      "--plot-text": theme.textColor,
      "--column-width": `${width}px`,
    };

    return (
      <div
        data-r={sceneIndex}
        data-c={plotIndex}
        ref={ref}
        style={themeStyles}
        className={`card card--actions py-1 px-2 radius-2 transition-all duration-250 ${isDropTarget && isDroppable ? `text-white shadow-lg h-[100px]` : `h-0 ${isDroppable ? "bg-[var(--plot-color)]" : "bg-gray-200"} border-[var(--plot-color)] text-[var(--plot-text)]`} ${
          isDisabled ? "opacity-50" : ""
        }`}
      ></div>
    );
  },
);
