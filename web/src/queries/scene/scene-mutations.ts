import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSceneInput,
  Plot,
  Scene,
  Section,
  ShiftedResources,
  UpdateSceneInput,
} from "../../api/types";
import {
  createScene,
  deleteScene,
  moveSingleSceneWithinPlot,
  updateScene,
} from "../../api/stories";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { useStoryPlotsQuery } from "../story/story-queries";
import { useStorySectionsQuery } from "../section/section-queries";
import { shiftScenesForInsert, sortScenes } from "./scene-helpers";
import {
  applyOptimisticShiftToState,
  applyShiftedResources,
} from "../story/shifted-resources";
import {
  getMoveRangeShift,
  shouldShiftAfterSceneRemoval,
  shouldShiftForSceneInsert,
} from "../story/shift-logic";

export function useCreateSceneMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSceneInput) =>
      createScene(storyId, input.plotId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );
      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previousPlots) {
        const optimistic: Scene = {
          id: tempId,
          title: input.title,
          description: input.description,
          plotId: input.plotId,
          tags: input.tags ?? [],
          tagVariants: input.tagVariants ?? [],
          todo: input.todo ?? [],
          snippets: input.snippets ?? [],
          scene: input.scene ?? null,
          verticalIndex: input.verticalIndex,
          pov: input.pov ?? null,
        };

        let nextPlots = previousPlots;
        const hasSectionsCache = previousSections !== undefined;
        let nextSections = previousSections ?? [];

        const shouldShift = shouldShiftForSceneInsert(
          nextPlots,
          nextSections,
          input.plotId,
          input.verticalIndex,
        );

        if (shouldShift) {
          const shifted = applyOptimisticShiftToState(nextPlots, nextSections, {
            rangeStart: input.verticalIndex,
            rangeEnd: undefined,
            shift: 1,
          });
          nextPlots = shifted.plots;
          nextSections = shifted.sections;
        }

        nextPlots = nextPlots.map((plot) => {
          if (plot.id !== input.plotId) {
            return plot;
          }

          return {
            ...plot,
            scenes: sortScenes([...plot.scenes, optimistic]),
          };
        });

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          nextPlots,
        );

        if (hasSectionsCache) {
          queryClient.setQueryData<Section[]>(
            useStorySectionsQuery.queryKey(storyId),
            nextSections,
          );
        }
      }

      return {
        previous: { plots: previousPlots, sections: previousSections },
        tempId,
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.plots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous.plots,
        );
      }
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
    },
    onSuccess: (response, _input, context) => {
      const scene = response.scene;
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return current;
          }

          return current.map((plot) => {
            if (plot.id !== scene.plotId) {
              return plot;
            }

            const replaced = plot.scenes.map((entry) =>
              entry.id === context?.tempId ? scene : entry,
            );

            const hasScene = replaced.some((entry) => entry.id === scene.id);
            return {
              ...plot,
              scenes: sortScenes(hasScene ? replaced : [...replaced, scene]),
            };
          });
        },
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

type UpdateScenePayload = UpdateSceneInput & {
  sceneId: string;
};

export function useUpdateSceneMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateScenePayload) =>
      updateScene(storyId, input.sceneId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      if (previous) {
        const updated = previous.map((plot) => {
          const target = plot.scenes.find(
            (scene) => scene.id === input.sceneId,
          );
          if (!target) {
            return plot;
          }

          const shifted =
            input.verticalIndex !== undefined
              ? shiftScenesForInsert(
                  plot.scenes,
                  target.id,
                  input.verticalIndex,
                )
              : plot.scenes;

          const nextScenes = shifted.map((scene) =>
            scene.id === input.sceneId
              ? { ...scene, ...input, id: scene.id, plotId: scene.plotId }
              : scene,
          );

          return { ...plot, scenes: sortScenes(nextScenes) };
        });

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          updated,
        );
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (response) => {
      const scene = response.scene;
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return current;
          }

          return current.map((plot) => {
            if (plot.id !== scene.plotId) {
              return plot;
            }

            const nextScenes = plot.scenes.map((entry) =>
              entry.id === scene.id ? scene : entry,
            );

            return { ...plot, scenes: sortScenes(nextScenes) };
          });
        },
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

const removeSceneFromPlots = (plots: Plot[], sceneId: string) =>
  plots.map((plot) => {
    const found = plot.scenes.find((scene) => scene.id === sceneId);
    if (!found) {
      return plot;
    }
    return {
      ...plot,
      scenes: plot.scenes.filter((scene) => scene.id !== sceneId),
    };
  });

export function useDeleteSceneMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sceneId: string) => deleteScene(storyId, sceneId),
    onMutate: async (sceneId) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );
      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      if (previousPlots) {
        const target = previousPlots
          .find((plot) => plot.scenes.some((scene) => scene.id === sceneId))
          ?.scenes.find((scene) => scene.id === sceneId);

        let nextPlots = removeSceneFromPlots(previousPlots, sceneId);
        const hasSectionsCache = previousSections !== undefined;
        let nextSections = previousSections ?? [];

        if (target) {
          const shouldShift = shouldShiftAfterSceneRemoval(
            previousPlots,
            nextSections,
            target.plotId,
            target.verticalIndex,
            target.id,
          );

          if (shouldShift) {
            const shifted = applyOptimisticShiftToState(
              nextPlots,
              nextSections,
              {
                rangeStart: target.verticalIndex + 1,
                rangeEnd: undefined,
                shift: -1,
              },
            );
            nextPlots = shifted.plots;
            nextSections = shifted.sections;
          }
        }

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          nextPlots,
        );

        if (hasSectionsCache) {
          queryClient.setQueryData<Section[]>(
            useStorySectionsQuery.queryKey(storyId),
            nextSections,
          );
        }
      }

      return { previous: { plots: previousPlots, sections: previousSections } };
    },
    onError: (_error, _sceneId, context) => {
      if (context?.previous?.plots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous.plots,
        );
      }
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
    },
    onSuccess: (response, sceneId) => {
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
        (current) =>
          current ? removeSceneFromPlots(current, sceneId) : current,
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

const useMoveSingleWithinPlot = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isIdle } = useMutation({
    mutationFn: moveSingleSceneWithinPlot,

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStoryPlotsQuery.queryKey(input.storyId),
      });

      const previousPlots =
        queryClient.getQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(input.storyId),
        ) ?? [];

      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(input.storyId),
      );

      let nextPlots = previousPlots;
      const hasSectionsCache = previousSections !== undefined;
      let nextSections = previousSections ?? [];

      const shift = getMoveRangeShift({
        fromIndex: input.fromIndex,
        toIndex: input.toIndex,
        fromPlotId: input.fromPlotId,
        toPlotId: input.toPlotId,
        resource: { id: input.sceneId, type: "scene" },
        plots: nextPlots,
        sections: nextSections,
      });

      if (shift) {
        const shifted = applyOptimisticShiftToState(
          nextPlots,
          nextSections,
          shift,
        );
        nextPlots = shifted.plots;
        nextSections = shifted.sections;
      }

      const foundScene = nextPlots
        .find((plot) => plot.id === input.fromPlotId)
        ?.scenes.find((scene) => scene.id === input.sceneId);

      // update scene vertical index
      nextPlots = nextPlots.map((plot) => {
        if (
          plot.id === input.fromPlotId &&
          input.fromPlotId !== input.toPlotId
        ) {
          /**
           * If moving to new plot, remove scene from old plot
           */
          const remaining = plot.scenes.filter(
            (scene) => scene.id !== input.sceneId,
          );
          return { ...plot, scenes: sortScenes(remaining) };
        }

        if (plot.id === input.toPlotId && input.fromPlotId !== input.toPlotId) {
          /**
           * If moving to new plot, insert found scene into new plot.
           */
          if (foundScene) {
            return {
              ...plot,
              scenes: sortScenes([
                ...plot.scenes,
                {
                  ...foundScene,
                  verticalIndex: input.toIndex,
                  plotId: input.toPlotId,
                },
              ]),
            };
          }

          console.warn(
            `Scene with id ${input.sceneId} not found in plot ${input.fromPlotId}`,
          );
          return plot;
        }

        if (plot.id === input.toPlotId) {
          /**
           * Same plot move, just update vertical index of scene
           */
          const updatedScenes = plot.scenes.map((scene) => {
            if (scene.id === input.sceneId) {
              return {
                ...scene,
                verticalIndex: input.toIndex,
                plotId: input.toPlotId,
              };
            }
            return scene;
          });
          return {
            ...plot,
            scenes: sortScenes(updatedScenes),
          };
        }
        return plot;
      });

      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(input.storyId),
        nextPlots,
      );

      if (hasSectionsCache) {
        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(input.storyId),
          nextSections,
        );
      }

      return {
        previous: {
          plots: previousPlots,
          sections: previousSections,
        },
      };
    },
    onError: (_error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(input.storyId),
          context.previous.plots,
        );
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(input.storyId),
          context.previous.sections,
        );
      }
    },
    onSuccess: (response, input) => {
      if (response.shiftedResources) {
        applyShiftedResources(
          queryClient,
          input.storyId,
          response.shiftedResources,
        );
      }

      if (response.scene) {
        const shiftedResources: ShiftedResources = {
          scenes: [response.scene],
          sections: [],
        };
        applyShiftedResources(queryClient, input.storyId, shiftedResources);
      }
    },
  });

  return { moveSingleCardWithinPlot: mutateAsync, isMutating: !isIdle };
};

export const MoveSceneMutations = {
  useMoveSingleWithinPlot,
};
