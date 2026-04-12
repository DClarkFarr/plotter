import React, { useMemo } from "react";
import type { Plot, Scene, Section } from "../../api/types";

import type {
  DraggableSceneData,
  EmptyRendererProps,
  SceneCardTypes,
  SceneRenderer,
  SceneRendererProps,
} from "./plot.types";
import { EmptyCard } from "./SceneRenderer/EmptyCard";
import { SceneCard } from "./SceneRenderer/SceneCard";
import { PlotHeaderCreate } from "./SceneRenderer/PlotHeaderCreate";
import { PlotHeader } from "./SceneRenderer/PlotHeader";
import { ColHeader } from "./ColHeader";
import { SectionRow } from "./SectionRow";
import { DragDropProvider } from "@dnd-kit/react";
import { Feedback } from "@dnd-kit/dom";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { MoveSceneMutations } from "../../queries/scene/scene-mutations";
import { SceneActionsCard } from "./SceneRenderer/SceneActionsCard";
import { StoryFiltersBar } from "../story/StoryFiltersBar";
import { useStoryStore } from "../../store/storyStore";
import {
  useStoryCharactersQuery,
  useStoryTagsQuery,
} from "../../queries/story/story-queries";
import { useStorySectionsQuery } from "../../queries/section/section-queries";
import { applyFiltersToPlots } from "../../utils/applyFiltersToPlots";
import {
  useStoryPlotsQuery,
  useStoryScenesQuery,
} from "../../queries/story/story-queries";
import { CustomSensitivityModifier } from "./PlotGrid/CustomSensitivityModifier";

export type PlotGridProps = {
  storyId: string;
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
    }
  | {
      type: "section";
      section: Section;
    }
  | {
      type: "section-spacer";
    };

const getCellColIndex = (gridIndex: number) => {
  return gridIndex - 1;
};
const getCellRowIndex = (gridIndex: number) => {
  return gridIndex - 1;
};

function assertIsDraggableSceneData(data: object): data is DraggableSceneData {
  const d = data as DraggableSceneData;
  if (
    typeof d !== "object" ||
    d === null ||
    typeof d.plot !== "object" ||
    typeof d.scene !== "object" ||
    typeof d.verticalIndex !== "number"
  ) {
    return false;
  }

  return true;
}

export const PlotGrid = ({
  storyId,
  renderSceneCard,
  renderEmptyCard,
}: PlotGridProps) => {
  const dragMode = useSceneEditorStore((state) => state.dragMode);

  const startDraggingScene = useSceneEditorStore(
    (state) => state.startDraggingScene,
  );
  const stopDraggingScene = useSceneEditorStore(
    (state) => state.stopDraggingScene,
  );

  const { moveSingleCardWithinPlot } =
    MoveSceneMutations.useMoveSingleWithinPlot();

  const handleDragEnd = (
    targetPlot: Plot,
    targetVerticalIndex: number,
    sourcePlot: Plot,
    sourceScene: Scene,
  ) => {
    if (!sourcePlot || !sourceScene) {
      return;
    }

    if (dragMode === "singleCard") {
      moveSingleCardWithinPlot({
        storyId: sourcePlot.storyId,
        fromPlotId: sourcePlot.id,
        toPlotId: targetPlot.id,
        sceneId: sourceScene.id,
        fromIndex: sourceScene.verticalIndex,
        toIndex: targetVerticalIndex,
      });
    } else {
      console.warn("Unknown drag mode", { dragMode });
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

          const data = event.operation.source?.data;
          if (!data || !assertIsDraggableSceneData(data)) {
            console.warn("Invalid drag data", { data });
            return;
          }
          console.log("on drag start", data.scene);
          startDraggingScene(data.scene || null);
        }}
        onDragOver={() => {
          // console.log("on drag over", { event, manager });
        }}
        onDragEnd={(event, manager) => {
          const { target, source } = event.operation;

          stopDraggingScene();

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
          renderSceneCard={renderSceneCard}
          renderEmptyCard={renderEmptyCard}
        />
      </DragDropProvider>
    </div>
  );
};

const PlotGridBody = ({
  storyId,
  renderSceneCard,
  renderEmptyCard,
}: PlotGridProps) => {
  const { data: plots = [] } = useStoryPlotsQuery(storyId);
  const { data: scenes = [] } = useStoryScenesQuery(storyId);
  const filters = useStoryStore((state) => state.filters);
  const hasFilters = useStoryStore((state) => state.hasFilters());
  const { data: tags = [] } = useStoryTagsQuery(storyId);
  const { data: characters = [] } = useStoryCharactersQuery(storyId);
  const { data: sections = [] } = useStorySectionsQuery(storyId);

  const { includedSceneIds } = useMemo(
    () => applyFiltersToPlots(plots, scenes, filters, { tags, characters }),
    [plots, scenes, filters, tags, characters],
  );

  const includedSceneIdSet = useMemo(
    () => new Set(includedSceneIds),
    [includedSceneIds],
  );

  const sectionsByRowIndex = useMemo(() => {
    const map = new Map<number, Section>();
    for (const section of sections) {
      map.set(section.verticalIndex, section);
    }
    return map;
  }, [sections]);

  const gridCols = getGridCols(plots);
  const gridRows = getGridRows(scenes, sections);

  const RenderSceneCard = renderSceneCard || SceneCard;
  const RenderEmptyCard = renderEmptyCard || EmptyCard;
  const maxHorizontalIndex = Math.max(
    0,
    ...plots.map((plot) => plot.horizontalIndex),
  );

  const plotsByRowIndex = useMemo(() => {
    const map = new Map<number, Plot>();
    for (const plot of plots) {
      map.set(plot.horizontalIndex, plot);
    }
    return map;
  }, [plots]);

  const scenesByColIndex = useMemo(() => {
    const plotMap = new Map<string, Map<number, Scene>>();
    for (const scene of scenes) {
      let sceneMap = plotMap.get(scene.plotId);
      if (!sceneMap) {
        sceneMap = new Map<number, Scene>();
        plotMap.set(scene.plotId, sceneMap);
      }
      sceneMap.set(scene.verticalIndex, scene);
    }
    return plotMap;
  }, [scenes]);

  const grid = useMemo(() => {
    const rows: GridCellTypes[][] = [];
    const topRow: GridCellTypes[] = [{ type: "corner" }];
    for (let c = 1; c < gridCols + 1; c++) {
      topRow.push({ type: "plot", index: c });
    }
    rows.push(topRow);

    for (let r = 0; r < gridRows; r++) {
      const row: GridCellTypes[] = [{ type: "col-header", index: r }];

      const section = sectionsByRowIndex.get(r);
      if (section) {
        row.push({ type: "section", section });
        for (let c = 2; c < gridCols + 1; c++) {
          row.push({ type: "section-spacer" });
        }
        rows.push(row);
        continue;
      }

      for (let c = 1; c < gridCols + 1; c++) {
        const plot = plots.find(
          (p) => p.horizontalIndex === getCellColIndex(c),
        );
        if (!plot) {
          row.push({ type: "empty" });
          continue;
        }
        const hasScene = scenesByColIndex.get(plot.id)?.has(r) ?? false;
        if (!hasScene) {
          row.push({ type: "empty" });
        } else {
          row.push({ type: "scene", index: r });
        }
      }
      rows.push(row);
    }

    return rows;
  }, [plots, gridCols, gridRows, sectionsByRowIndex, scenesByColIndex]);

  return (
    <div
      className="y-scroller overflow-y-auto h-[var(--grid-height)]"
      style={{ "--grid-height": `calc(100vh - 61px)` }}
    >
      {hasFilters && (
        <div className="sticky top-0 z-155 pl-[140px] pr-6 py-2">
          <StoryFiltersBar
            plots={plots}
            scenes={scenes}
            tags={tags}
            characters={characters}
          />
        </div>
      )}

      <div className="x-scroller h-full overflow-x-auto">
        <div
          className={`grid story-grid p-6 ${hasFilters && "pt-0"}  plot-grid gap-x-4 gap-y-2 bg-gray-100`}
          style={{ "--grid-cols": gridCols }}
        >
          {grid.map((row, r) => {
            return (
              <React.Fragment key={`row-${r}`}>
                {row.map((cell, c) => {
                  if (
                    cell.type === "col-header" ||
                    cell.type === "corner" ||
                    cell.type === "plot" ||
                    cell.type === "section" ||
                    cell.type === "section-spacer"
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
                      <ColHeader
                        key={`col-header-${r}-${c}`}
                        storyId={storyId}
                        rowIndex={getCellRowIndex(r)}
                        scenes={scenes}
                        sections={sections}
                      />
                    );
                  } else if (cell.type === "section") {
                    return (
                      <SectionRow
                        key={`section-${cell.section.id}`}
                        section={cell.section}
                      />
                    );
                  } else if (cell.type === "section-spacer") {
                    return null;
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
                    const isFilterExcluded =
                      hasFilters &&
                      !!scene &&
                      !includedSceneIdSet.has(scene.id);
                    return (
                      <RenderSceneCard
                        key={`scene-${scene!.id}`}
                        sceneIndex={getCellRowIndex(r)}
                        plotIndex={getCellColIndex(c)}
                        scene={scene!}
                        plot={plot!}
                        isFilterExcluded={isFilterExcluded}
                      />
                    );
                  } else if (cell.type === "plot") {
                    const plot = plotsByRowIndex.get(getCellColIndex(c));
                    return plot ? (
                      <PlotHeader
                        key={`plot-header-${r}-${c}`}
                        storyId={storyId}
                        plot={plot}
                        plotIndex={getCellColIndex(c)}
                        maxHorizontalIndex={maxHorizontalIndex}
                      />
                    ) : (
                      <PlotHeaderCreate
                        key={`plot-header-${r}-${c}`}
                        storyId={storyId}
                        plot={plot}
                        plotIndex={getCellColIndex(c)}
                      />
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

const getGridRows = (scenes: Scene[], sections: Section[]) => {
  const sceneMax = scenes.reduce(
    (max, scene) => Math.max(max, scene.verticalIndex),
    0,
  );

  const sectionMax = sections.reduce(
    (max, section) => Math.max(max, section.verticalIndex),
    0,
  );

  return Math.max(sceneMax, sectionMax) + 3;
};
