import { useMemo } from "react";
import type { Plot } from "../../api/types";
import type {
  StoryCardDisplay,
  StoryCardSize,
} from "../../store/storyStore.types";
import type {
  EmptyRendererProps,
  SceneCardTypes,
  SceneRenderer,
  SceneRendererProps,
} from "./plot.types";
import { EmptyCard } from "./SceneRenderer/EmptyCard";
import { SceneCard } from "./SceneRenderer/SceneCard";
import { PlotHeader } from "./SceneRenderer/PlotHeader";

export type PlotGridProps = {
  plots: Plot[];
  plotIndex: number;
  cardSize: StoryCardSize;
  cardDisplay: StoryCardDisplay;
  renderSceneCard?: SceneRenderer<SceneRendererProps>;
  renderEmptyCard?: SceneRenderer<EmptyRendererProps>;
};

type GridCellTypes =
  | SceneCardTypes
  | {
      type: "plot";
      index: number;
    }
  | {
      type: "corner";
    }
  | {
      type: "col-header";
      index: number;
    };

export const PlotGrid = ({
  plots,
  cardDisplay,
  cardSize,
  renderSceneCard,
  renderEmptyCard,
}: PlotGridProps) => {
  const gridCols = getGridCols(plots);
  const gridRows = getGridRows(plots);

  const RenderSceneCard = renderSceneCard || SceneCard;
  const RenderEmptyCard = renderEmptyCard || EmptyCard;

  const grid = useMemo(() => {
    const rows: GridCellTypes[][] = [];
    const topRow: GridCellTypes[] = [{ type: "corner" }];
    for (let c = 1; c < gridCols + 1; c++) {
      topRow.push({ type: "plot", index: c });
    }
    rows.push(topRow);

    for (let r = 0; r < gridRows; r++) {
      const row: GridCellTypes[] = [{ type: "col-header", index: r }];

      for (let c = 1; c < gridCols + 1; c++) {
        const plot = plots[c];
        if (!plot) {
          row.push({ type: "empty" });
          continue;
        }
        const sceneIndex = plot.scenes.findIndex((s) => s.verticalIndex === r);
        if (sceneIndex === -1) {
          row.push({ type: "empty" });
        } else {
          row.push({ type: "scene", index: sceneIndex });
        }
      }
      rows.push(row);
    }
    return rows;
  }, [plots, gridCols, gridRows]);

  return (
    <div className="grid plot-grid gap-4" style={{ "--grid-cols": gridCols }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          if (cell.type === "corner") {
            return (
              <div
                key={`${r}-${c}`}
                className="corner"
                data-row={r}
                data-col={c}
              ></div>
            );
          } else if (cell.type === "col-header") {
            return (
              <div
                key={`${r}-${c}`}
                className="col-header flex items-center justify-center"
                data-row={r}
                data-col={c}
              >
                <h4 className="font-bold text-2xl text-gray-500">Row {r}</h4>
              </div>
            );
          } else if (cell.type === "empty") {
            return (
              <div
                key={`${r}-${c}`}
                className="scene-card empty"
                data-row={r}
                data-col={c}
              >
                <RenderEmptyCard sceneIndex={r} plotIndex={c} plot={plots[c]} />
              </div>
            );
          } else if (cell.type === "scene") {
            const plot = plots[c];
            const scene = plot?.scenes[cell.index];
            return (
              <div
                key={`${r}-${c}`}
                className="scene-card"
                data-row={r}
                data-col={c}
              >
                <RenderSceneCard
                  sceneIndex={cell.index}
                  plotIndex={c}
                  scene={scene!}
                  plot={plot!}
                />
              </div>
            );
          } else if (cell.type === "plot") {
            return (
              <div
                key={`${r}-${c}`}
                className="plot-header row-header"
                data-row={r}
                data-col={c}
              >
                <PlotHeader plot={plots[cell.index]} plotIndex={cell.index} />
              </div>
            );
          }

          return null;
        }),
      )}
    </div>
  );
};

const getGridCols = (plots: Plot[]) => {
  return plots.length + 3;
};

const getGridRows = (plots: Plot[]) => {
  const maxVerticalPosition =
    plots.reduce((max, plot) => {
      const sceneMax = plot.scenes.reduce(
        (sMax, scene) => Math.max(sMax, scene.verticalIndex),
        0,
      );
      return Math.max(max, sceneMax);
    }, 0) + 3;

  return maxVerticalPosition + 3;
};
