import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { memo } from "react";
import type { Plot, Scene } from "../../../api/types";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";

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
    const draggingScene = useSceneEditorStore((s) => s.draggingScene);

    const { width } = useGridSizes({ cardSize });

    const isCurrentPosition =
      sceneIndex === draggingScene?.verticalIndex &&
      plot?.id === draggingScene?.plotId;

    const isDroppable =
      !isDisabled &&
      ((sceneIndex === 0 && !!nextScene?.id) ||
        (!!prevScene?.id && !!nextScene?.id));

    const { isDropTarget, ref } = useDroppable({
      id: `actions-${plot?.id}-${sceneIndex}`,
      accept: "scene",
      type: "droppable",
      disabled: !isDroppable || isCurrentPosition,
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
        className={`card card--actions py-1 px-2 radius-2 transition-all duration-250 ${isDropTarget && isDroppable ? `text-white bg-purple-900 shadow-lg h-[100px]` : "bg-gray-200"} ${
          isDisabled ? "opacity-50" : ""
        }`}
      ></div>
    );
  },
);
