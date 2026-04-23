import React, { useMemo } from "react";
import type { Plot, Scene, Section } from "../../api/types";

import type {
  DraggableSceneData,
  EmptyRendererProps,
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
import { useSectionEditorStore } from "../../store/sectionEditorStore";
import { MoveSceneMutations } from "../../queries/scene/scene-mutations";
import { useMoveSectionMutation } from "../../queries/section/section-mutations";
import { SceneActionsCard } from "./SceneRenderer/SceneActionsCard";
import { SectionDropZone } from "./SceneRenderer/SectionDropZone";
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

type GridCellType =
  | { type: "scene" }
  | {
      type: "plot";
    }
  | {
      type: "section";
    }
  | {
      type: "empty";
    }
  | {
      type: "corner";
    }
  | {
      type: "col-header";
    }
  | {
      type: "section-spacer";
    };

type GridCellVariant<T extends GridCellType = GridCellType> = T & {
  horizontalIndex: number;
  verticalIndex: number;
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

  const startDraggingSection = useSectionEditorStore(
    (state) => state.startDraggingSection,
  );
  const stopDraggingSection = useSectionEditorStore(
    (state) => state.stopDraggingSection,
  );

  const { mutate: moveSection } = useMoveSectionMutation(storyId);

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

          const source = event.operation.source;
          if (source?.type === "section") {
            const { section } = source.data as { section: Section };
            startDraggingSection(section);
            return;
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
          stopDraggingSection();

          if (
            source?.type === "section" &&
            target?.type === "section-droppable"
          ) {
            const { verticalIndex } = target.data as { verticalIndex: number };
            const { section } = source.data as { section: Section };
            if (section.verticalIndex !== verticalIndex) {
              moveSection({ sectionId: section.id, toIndex: verticalIndex });
            }
            return;
          }

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
  const filters = useStoryStore((state) => state.filters);
  const hasFilters = useStoryStore((state) => state.hasFilters());

  const draggingSection = useSectionEditorStore(
    (state) => state.draggingSection,
  );

  const { data: plots = [] } = useStoryPlotsQuery(storyId);
  const { data: scenes = [] } = useStoryScenesQuery(storyId);
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

  const gridCols = getGridCols(plots);
  const gridRows = getGridRows(scenes, sections);

  const RenderSceneCard = renderSceneCard || SceneCard;
  const RenderEmptyCard = renderEmptyCard || EmptyCard;
  const maxHorizontalIndex = Math.max(
    0,
    ...plots.map((plot) => plot.horizontalIndex),
  );

  const sectionsHorizontalIndexMap = useMemo(() => {
    const map = new Map<number, Section>();
    for (const section of sections) {
      map.set(section.verticalIndex, section);
    }
    return map;
  }, [sections]);

  const plotsHorizontalIndexMap = useMemo(() => {
    const map = new Map<number, Plot>();
    for (const plot of plots) {
      map.set(plot.horizontalIndex, plot);
    }
    return map;
  }, [plots]);

  const scenesPlotIdVerticalIndexMap = useMemo(() => {
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
    const rows: GridCellVariant[][] = [];
    const topRow: GridCellVariant[] = [
      { type: "corner", horizontalIndex: -1, verticalIndex: -1 },
    ];
    for (let c = 0; c < gridCols; c++) {
      topRow.push({
        type: "plot",
        horizontalIndex: c,
        verticalIndex: 0,
      });
    }
    rows.push(topRow);

    for (let r = 0; r < gridRows; r++) {
      const row: GridCellVariant[] = [
        { type: "col-header", horizontalIndex: -1, verticalIndex: r },
      ];

      const section = sectionsHorizontalIndexMap.get(r);
      if (section) {
        row.push({
          type: "section",
          horizontalIndex: 0,
          verticalIndex: r,
        });
        for (let c = 2; c < gridCols + 1; c++) {
          row.push({
            type: "section-spacer",
            horizontalIndex: c,
            verticalIndex: r,
          });
        }
        rows.push(row);
        continue;
      }

      for (let c = 0; c < gridCols; c++) {
        const plot = plots.find((p) => p.horizontalIndex === c);
        if (!plot) {
          row.push({ type: "empty", horizontalIndex: c, verticalIndex: r });
          continue;
        }
        const currentScene =
          scenesPlotIdVerticalIndexMap.get(plot.id)?.has(r) ?? false;
        if (currentScene) {
          row.push({
            type: "scene",
            horizontalIndex: c,
            verticalIndex: r,
          });
        } else {
          row.push({ type: "empty", horizontalIndex: c, verticalIndex: r });
        }
      }
      rows.push(row);
    }

    return rows;
  }, [
    plots,
    gridCols,
    gridRows,
    sectionsHorizontalIndexMap,
    scenesPlotIdVerticalIndexMap,
  ]);

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
            const rowVerticalIndex = row[0].verticalIndex;
            return (
              <React.Fragment key={`row-${r}`}>
                {rowVerticalIndex !== -1 && (
                  <>
                    <div
                      className="nbsp"
                      key={`section-dz-nbsp-${rowVerticalIndex}`}
                    />
                    <SectionDropZone
                      key={`section-dz-${rowVerticalIndex}`}
                      verticalIndex={rowVerticalIndex}
                      draggingSection={draggingSection}
                      hasSectionAtRow={sectionsHorizontalIndexMap.has(
                        rowVerticalIndex,
                      )}
                    />
                  </>
                )}
                {row.map((cell) => {
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
                        key={`nbsp-${cell.verticalIndex}-${cell.horizontalIndex}`}
                        data-r={cell.verticalIndex}
                        data-c={cell.horizontalIndex}
                      ></div>
                    );
                  } else {
                    return (
                      <SceneActionsCard
                        key={`actions-${cell.horizontalIndex}-${cell.verticalIndex}`}
                        storyId={storyId}
                        plot={plotsHorizontalIndexMap.get(cell.horizontalIndex)}
                        plotIndex={cell.horizontalIndex}
                        sceneIndex={cell.verticalIndex}
                        nextScene={scenesPlotIdVerticalIndexMap
                          .get(
                            plotsHorizontalIndexMap.get(cell.horizontalIndex)
                              ?.id || "",
                          )
                          ?.get(cell.verticalIndex + 1)}
                        prevScene={scenesPlotIdVerticalIndexMap
                          .get(
                            plotsHorizontalIndexMap.get(cell.horizontalIndex)
                              ?.id || "",
                          )
                          ?.get(cell.verticalIndex - 1)}
                        isDisabled={
                          !plotsHorizontalIndexMap.get(cell.horizontalIndex)
                        }
                      />
                    );
                  }
                })}

                {row.map((cell) => {
                  if (cell.type === "corner") {
                    return (
                      <div
                        key={`corner-${cell.verticalIndex}-${cell.horizontalIndex}`}
                        className="corner"
                        data-row={cell.verticalIndex}
                        data-col={cell.horizontalIndex}
                      ></div>
                    );
                  } else if (cell.type === "col-header") {
                    return (
                      <ColHeader
                        key={`col-header-${cell.verticalIndex}-${cell.horizontalIndex}`}
                        storyId={storyId}
                        rowIndex={cell.verticalIndex}
                        scenes={scenes}
                        sections={sections}
                      />
                    );
                  } else if (cell.type === "section") {
                    const section = sectionsHorizontalIndexMap.get(
                      cell.verticalIndex,
                    );
                    if (section) {
                      return (
                        <SectionRow
                          key={`section-${section?.id}`}
                          section={section}
                        />
                      );
                    }
                    return <div>Section not found: {cell.verticalIndex}</div>;
                  } else if (cell.type === "section-spacer") {
                    return null;
                  } else if (cell.type === "empty") {
                    const plot = plotsHorizontalIndexMap.get(
                      cell.horizontalIndex,
                    );
                    return (
                      <RenderEmptyCard
                        key={`empty-${cell.horizontalIndex}-${cell.verticalIndex}`}
                        storyId={storyId}
                        sceneIndex={cell.verticalIndex}
                        plotIndex={cell.horizontalIndex}
                        plot={plot}
                        isDisabled={!plot}
                      />
                    );
                  } else if (cell.type === "scene") {
                    const plot = plotsHorizontalIndexMap.get(
                      cell.horizontalIndex,
                    );

                    const scene = scenesPlotIdVerticalIndexMap
                      .get(plot?.id || "")
                      ?.get(cell.verticalIndex);
                    const isFilterExcluded =
                      hasFilters &&
                      !!scene &&
                      !includedSceneIdSet.has(scene.id);

                    if (!plot) {
                      return <div>Plot not found: {cell.horizontalIndex}</div>;
                    }
                    if (!scene) {
                      return (
                        <div>
                          Scene not found: {cell.verticalIndex} in plot{" "}
                          {plot.id}
                        </div>
                      );
                    }
                    return (
                      <RenderSceneCard
                        key={`scene-${scene.id}`}
                        sceneIndex={cell.verticalIndex}
                        plotIndex={cell.horizontalIndex}
                        scene={scene}
                        plot={plot}
                        isFilterExcluded={isFilterExcluded}
                      />
                    );
                  } else if (cell.type === "plot") {
                    const plot = plotsHorizontalIndexMap.get(
                      cell.horizontalIndex,
                    );
                    return plot ? (
                      <PlotHeader
                        key={`plot-header-${cell.horizontalIndex}-${cell.verticalIndex}`}
                        storyId={storyId}
                        plot={plot}
                        plotIndex={cell.horizontalIndex}
                        maxHorizontalIndex={maxHorizontalIndex}
                      />
                    ) : (
                      <PlotHeaderCreate
                        key={`plot-header-${cell.horizontalIndex}-${cell.verticalIndex}`}
                        storyId={storyId}
                        plot={plot}
                        plotIndex={cell.horizontalIndex}
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
