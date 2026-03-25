import { useMemo } from "react";
import type { Plot } from "../../api/types";
import type {
  SceneRenderer,
  EmptyRendererProps,
  SceneRendererProps,
  SceneCardTypes,
} from "./plot.types";
import { SceneCard } from "./SceneRenderer/SceneCard";
import { EmptyCard } from "./SceneRenderer/EmptyCard";
import type {
  StoryCardDisplay,
  StoryCardSize,
} from "../../store/storyStore.types";

export type SortablePlotProps = {
  plot?: Plot;
  plotIndex: number;
  verticalStackSize: number;
  cardSize: StoryCardSize;
  cardDisplay: StoryCardDisplay;
  renderSceneCard?: SceneRenderer<SceneRendererProps>;
  renderEmptyCard?: SceneRenderer<EmptyRendererProps>;
};

export const SortablePlot = ({
  plot,
  verticalStackSize,
  plotIndex,
  cardSize,
  renderSceneCard = SceneCard,
  renderEmptyCard = EmptyCard,
}: SortablePlotProps) => {
  const cards = useMemo(() => {
    const cs: SceneCardTypes[] = [];
    for (let i = 0; i < verticalStackSize; i++) {
      const index = plot?.scenes.findIndex((s) => s.verticalIndex === i);
      if (index === -1 || index === undefined) {
        cs.push({ type: "empty" });
      } else {
        cs.push({ type: "scene", index });
      }
    }
    return cs;
  }, [plot, verticalStackSize]);

  const Scene = renderSceneCard;
  const Empty = renderEmptyCard;

  let width = "300px";
  if (cardSize === "md") {
    width = "400px";
  } else if (cardSize === "lg") {
    width = "500px";
  }

  return (
    <div
      className="plot w-[var(--plot-width)] shrink-0 h-full gap-4 flex flex-col"
      data-index={plotIndex}
      style={{ "--plot-width": width }}
    >
      {cards.map((card, i) => {
        if (card.type === "empty") {
          return (
            <div key={i} className="scene-card empty">
              <Empty sceneIndex={i} plotIndex={plotIndex} plot={plot} />
            </div>
          );
        }
        return (
          <div key={i} className="scene-card">
            {plot && card.type === "scene" && plot.scenes[card.index] && (
              <Scene
                sceneIndex={i}
                plotIndex={plotIndex}
                scene={plot.scenes[card.index]}
                plot={plot}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
