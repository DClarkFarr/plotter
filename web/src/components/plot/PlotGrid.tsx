import { useMemo } from "react";
import type { Plot, Scene } from "../../api/types";

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
import { DragDropProvider } from "@dnd-kit/react";
// import { Feedback } from "@dnd-kit/dom";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { MoveSceneMutations } from "../../queries/scene/scene-mutations";

export type PlotGridProps = {
  storyId: string;
  plots: Plot[];
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
  renderSceneCard,
  renderEmptyCard,
}: PlotGridProps) => {
  const dragMode = useSceneEditorStore((state) => state.dragMode);

  const { moveSingleCardWithinPlot } =
    MoveSceneMutations.useMoveSingleWithinPlot();
  const { moveSingleCardBetweenPlots } =
    MoveSceneMutations.useMoveSingleBetweenPlots();

  const handleDragEnd = (
    targetPlot: Plot,
    targetVerticalIndex: number,
    sourcePlot: Plot,
    sourceScene: Scene,
  ) => {
    if (!sourcePlot || !sourceScene) {
      return;
    }

    if (targetPlot.id === sourcePlot.id) {
      if (dragMode === "singleCard") {
        moveSingleCardWithinPlot({
          storyId: sourcePlot.storyId,
          plotId: targetPlot.id,
          sceneId: sourceScene.id,
          fromIndex: sourceScene.verticalIndex,
          toIndex: targetVerticalIndex,
        });
      } else {
        console.warn("Unknown drag mode", { dragMode });
      }
    } else {
      if (dragMode === "singleCard") {
        moveSingleCardBetweenPlots({
          storyId: sourcePlot.storyId,
          plotId: sourcePlot.id,
          targetPlotId: targetPlot.id,
          sceneId: sourceScene.id,
          fromIndex: sourceScene.verticalIndex,
          toIndex: targetVerticalIndex,
        });
      } else {
        console.warn("Unknown drag mode", { dragMode });
      }
    }
  };

  return (
    <div className="w-full h-full">
      <DragDropProvider
        plugins={(defaults) => [
          ...defaults,
          // Feedback.configure({ dropAnimation: null }),
        ]}
        onDragStart={(event) => {
          console.log("on drag start", event);
        }}
        onDragOver={(event, manager) => {
          console.log("on drag over", { event, manager });
        }}
        onDragEnd={(event) => {
          const { target, source } = event.operation;
          console.log("source was", source, event);
          if (
            target &&
            target.type === "droppable" &&
            source &&
            source.type === "item"
          ) {
            const { plot, verticalIndex } = target.data as {
              plot: Plot;
              verticalIndex: number;
            };
            const { plot: sourcePlot, scene: sourceScene } =
              (source.data as {
                plot: Plot;
                scene: Scene;
              }) || {};
            handleDragEnd(plot, verticalIndex, sourcePlot, sourceScene);
          }
        }}
      >
        <PlotGridBody
          storyId={storyId}
          plots={plots}
          renderSceneCard={renderSceneCard}
          renderEmptyCard={renderEmptyCard}
        />
      </DragDropProvider>
    </div>
  );
};

const PlotGridBody = ({
  storyId,
  plots,
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
        const plot = plots.find(
          (p) => p.horizontalIndex === getCellColIndex(c),
        );
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

  const plotsByRowIndex = useMemo(() => {
    const map = new Map<number, Plot>();
    for (const plot of plots) {
      map.set(plot.horizontalIndex, plot);
    }
    return map;
  }, [plots]);

  const scenesByColIndex = useMemo(() => {
    const plotMap = new Map<string, Map<number, Scene>>();
    for (const plot of plots) {
      const sceneMap = new Map<number, Scene>();
      for (const scene of plot.scenes) {
        sceneMap.set(scene.verticalIndex, scene);
      }
      plotMap.set(plot.id, sceneMap);
    }
    return plotMap;
  }, [plots]);

  return (
    <div
      className="y-scroller overflow-y-auto h-[var(--grid-height)]"
      style={{ "--grid-height": `calc(100vh - 61px)` }}
    >
      <div className="x-scroller h-full overflow-x-auto">
        <div
          className="grid story-grid p-6 plot-grid gap-x-4 gap-y-2 bg-gray-100"
          style={{ "--grid-cols": gridCols }}
        >
          {grid.map((row, r) => {
            const nextRow = grid[r + 1];
            return (
              <>
                {row.map((cell, c) => {
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
                        className="col-header flex items-center justify-center bg-gray-200"
                        data-row={r}
                        data-col={c}
                      >
                        <h4 className="text-xl uppercase text-gray-500 tracking-[0.2em]">
                          Row {r}
                        </h4>
                      </div>
                    );
                  } else if (cell.type === "empty") {
                    const plot = plotsByRowIndex.get(getCellColIndex(c));
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="scene-card empty"
                        data-row={r}
                        data-col={c}
                      >
                        <RenderEmptyCard
                          storyId={storyId}
                          sceneIndex={getCellRowIndex(r)}
                          plotIndex={getCellColIndex(c)}
                          plot={plot}
                          isDisabled={!plot}
                        />
                      </div>
                    );
                  } else if (cell.type === "scene") {
                    const plot = plotsByRowIndex.get(getCellColIndex(c));

                    const scene = scenesByColIndex
                      .get(plot?.id || "")
                      ?.get(getCellRowIndex(r));
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
                    const plot = plotsByRowIndex.get(getCellColIndex(c));
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
                })}

                {row.map((cell, c) => {
                  if (
                    cell.type === "col-header" ||
                    cell.type === "corner" ||
                    cell.type === "plot"
                  ) {
                    return <div className="nbsp" data-r={r} data-c={c}></div>;
                  } else if (cell.type === "empty") {
                    return (
                      <div
                        className="drop-scene p-2 bg-gray-300 rounded"
                        data-enabled="false"
                        data-r={r}
                        data-c={c}
                      ></div>
                    );
                  } else if (cell.type === "scene") {
                    return (
                      <div
                        className={`drop-scene p-2 ${nextRow?.[c]?.type === "scene" ? "bg-emerald-300" : "bg-red-300"} rounded`}
                        data-enabled={
                          nextRow?.[c]?.type === "scene" ? "true" : "false"
                        }
                        data-r={r}
                        data-c={c}
                      ></div>
                    );
                  }

                  return null;
                })}
              </>
            );
          })}
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
