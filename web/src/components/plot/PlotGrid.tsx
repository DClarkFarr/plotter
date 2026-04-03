import React, { useMemo } from "react";
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
import { DragDropManager, Feedback } from "@dnd-kit/dom";
import { Modifier, type DragOperation } from "@dnd-kit/abstract";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { MoveSceneMutations } from "../../queries/scene/scene-mutations";
import { SceneActionsCard } from "./SceneRenderer/SceneActionsCard";
import type { Coordinates } from "@dnd-kit/utilities";

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

type SensitivityOptions = {
  xModifier: number;
  yModifier: number;
};
class CustomSensitivityModifier extends Modifier {
  constructor(manager: DragDropManager, options?: SensitivityOptions) {
    super(manager, options);
  }

  public apply(operation: DragOperation): Coordinates {
    // console.log("got operation", operation);
    if (this.disabled) return operation.transform;

    const { xModifier = 1, yModifier = 1 } = this.options ?? {};
    const { transform } = operation;

    return {
      ...transform,
      x: transform.x * xModifier,
      y: transform.y * yModifier,
    };
  }
}

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
        modifiers={[
          CustomSensitivityModifier.configure({
            xModifier: 1,
            yModifier: 1,
          }),
        ]}
        onDragStart={(event, manager) => {
          const feedback = manager.plugins.find(
            (plugin) => plugin instanceof Feedback,
          );
          if (feedback) {
            feedback.dropAnimation = undefined;
          }

          console.log("on drag start", event);
        }}
        onDragOver={(event, manager) => {
          console.log("on drag over", { event, manager });
        }}
        onDragEnd={(event, manager) => {
          const { target, source } = event.operation;

          if (
            target &&
            ["droppable"].includes(String(target.type)) &&
            source &&
            source.type === "scene"
          ) {
            const feedback = manager.plugins.find(
              (plugin) => plugin instanceof Feedback,
            );

            if (feedback) {
              feedback.dropAnimation = null;
            }

            const { plot, verticalIndex } = target.data as {
              plot: Plot;
              verticalIndex: number;
            };
            const { plot: sourcePlot, scene: sourceScene } =
              (source.data as {
                plot: Plot;
                scene: Scene;
              }) || {};

            if (
              sourcePlot?.id === plot.id &&
              sourceScene?.verticalIndex === verticalIndex
            ) {
              console.log("dropped in same place, ignoring");
              return;
            }
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
            return (
              <React.Fragment key={`row-${r}`}>
                {row.map((cell, c) => {
                  if (
                    cell.type === "col-header" ||
                    cell.type === "corner" ||
                    cell.type === "plot"
                  ) {
                    return (
                      <div
                        className="nbsp"
                        key={`nbsp-${r}-${c}`}
                        data-r={r}
                        data-c={c}
                      ></div>
                    );
                  } else {
                    return (
                      <SceneActionsCard
                        key={`actions-${getCellColIndex(c)}-${getCellRowIndex(r)}`}
                        storyId={storyId}
                        plot={plotsByRowIndex.get(getCellColIndex(c))}
                        plotIndex={getCellColIndex(c)}
                        sceneIndex={getCellRowIndex(r)}
                        nextScene={scenesByColIndex
                          .get(
                            plotsByRowIndex.get(getCellColIndex(c))?.id || "",
                          )
                          ?.get(getCellRowIndex(r))}
                        prevScene={scenesByColIndex
                          .get(
                            plotsByRowIndex.get(getCellColIndex(c))?.id || "",
                          )
                          ?.get(getCellRowIndex(r) - 1)}
                        isDisabled={!plotsByRowIndex.get(getCellColIndex(c))}
                      />
                    );
                  }
                })}

                {row.map((cell, c) => {
                  if (cell.type === "corner") {
                    return (
                      <div
                        key={`corner-${r}-${c}`}
                        className="corner"
                        data-row={r}
                        data-col={c}
                      ></div>
                    );
                  } else if (cell.type === "col-header") {
                    return (
                      <div
                        key={`col-header-${r}-${c}`}
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
                      <RenderEmptyCard
                        key={`empty-${getCellColIndex(c)}-${getCellRowIndex(r)}`}
                        storyId={storyId}
                        sceneIndex={getCellRowIndex(r)}
                        plotIndex={getCellColIndex(c)}
                        plot={plot}
                        isDisabled={!plot}
                      />
                    );
                  } else if (cell.type === "scene") {
                    const plot = plotsByRowIndex.get(getCellColIndex(c));

                    const scene = scenesByColIndex
                      .get(plot?.id || "")
                      ?.get(getCellRowIndex(r));
                    return (
                      <RenderSceneCard
                        key={`scene-${scene!.id}`}
                        sceneIndex={getCellRowIndex(r)}
                        plotIndex={getCellColIndex(c)}
                        scene={scene!}
                        plot={plot!}
                      />
                    );
                  } else if (cell.type === "plot") {
                    const plot = plotsByRowIndex.get(getCellColIndex(c));
                    return (
                      <div
                        key={`plot-header-${r}-${c}`}
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
              </React.Fragment>
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
