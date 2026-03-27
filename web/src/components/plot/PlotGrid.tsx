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
import { PlotHeaderCreate } from "./SceneRenderer/PlotHeaderCreate";
import { PlotHeader } from "./SceneRenderer/PlotHeader";

export type PlotGridProps = {
  storyId: string;
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

const getCellColIndex = (gridIndex: number) => {
  return gridIndex - 1;
};
const getCellRowIndex = (gridIndex: number) => {
  return gridIndex - 1;
};

export const PlotGrid = ({
  storyId,
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
  const maxHorizontalIndex = Math.max(
    0,
    ...plots.map((plot) => plot.horizontalIndex),
  );

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
        const plot = plots[getCellColIndex(c)];
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
    <div
      className="y-scroller overflow-y-auto h-[var(--grid-height)]"
      style={{ "--grid-height": `calc(100vh - 61px)` }}
    >
      <div className="x-scroller h-full overflow-x-auto">
        <div
          className="grid p-6 plot-grid gap-4 bg-gray-100"
          style={{ "--grid-cols": gridCols }}
        >
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
                    className="col-header flex items-center justify-center bg-gray-100"
                    data-row={r}
                    data-col={c}
                  >
                    <h4 className="font-bold text-2xl text-gray-500">
                      Row {r}
                    </h4>
                  </div>
                );
              } else if (cell.type === "empty") {
                const plot = plots[getCellColIndex(c)];
                return (
                  <div
                    key={`${r}-${c}`}
                    className="scene-card empty"
                    data-row={r}
                    data-col={c}
                  >
                    <RenderEmptyCard
                      sceneIndex={getCellRowIndex(r)}
                      plotIndex={getCellColIndex(c)}
                      plot={plot}
                      isDisabled={!plot}
                    />
                  </div>
                );
              } else if (cell.type === "scene") {
                const plot = plots[getCellColIndex(c)];
                const scene = plot?.scenes[cell.index];
                return (
                  <div
                    key={`${r}-${c}`}
                    className="scene-card"
                    data-row={r}
                    data-col={c}
                  >
                    <RenderSceneCard
                      sceneIndex={getCellRowIndex(r)}
                      plotIndex={getCellColIndex(c)}
                      scene={scene!}
                      plot={plot!}
                    />
                  </div>
                );
              } else if (cell.type === "plot") {
                const plot = plots.find(
                  (p) => p.horizontalIndex === getCellColIndex(c),
                );
                return (
                  <div
                    key={`${r}-${c}`}
                    className="plot-header row-header"
                    data-row={r}
                    data-col={c}
                  >
                    {plot ? (
                      <PlotHeader
                        storyId={storyId}
                        plot={plot}
                        plotIndex={getCellColIndex(c)}
                        maxHorizontalIndex={maxHorizontalIndex}
                      />
                    ) : (
                      <PlotHeaderCreate
                        storyId={storyId}
                        plot={plot}
                        plotIndex={getCellColIndex(c)}
                      />
                    )}
                  </div>
                );
              }

              return null;
            }),
          )}
        </div>
      </div>
    </div>
  );
};

const getGridCols = (plots: Plot[]) => {
  const maxVerticalPosition =
    plots.reduce((max, plot) => {
      return Math.max(max, plot.horizontalIndex);
    }, 0) + 2;

  return maxVerticalPosition;
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

  return maxVerticalPosition;
};
