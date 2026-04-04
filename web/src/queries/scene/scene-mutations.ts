import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateSceneInput,
  Plot,
  Scene,
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
import { shiftScenesForInsert, sortScenes } from "./scene-helpers";

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
      const previous = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Scene = {
          id: tempId,
          title: input.title,
          description: input.description,
          plotId: input.plotId,
          tags: input.tags ?? [],
          tagVariants: input.tagVariants ?? [],
          todo: input.todo ?? [],
          scene: input.scene ?? null,
          verticalIndex: input.verticalIndex,
          pov: input.pov ?? null,
        };

        const updated = previous.map((plot) => {
          if (plot.id !== input.plotId) {
            return plot;
          }

          const shifted = plot.scenes.map((scene) =>
            scene.verticalIndex >= input.verticalIndex
              ? { ...scene, verticalIndex: scene.verticalIndex + 1 }
              : scene,
          );

          return {
            ...plot,
            scenes: sortScenes([...shifted, optimistic]),
          };
        });

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          updated,
        );
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (scene, _input, context) => {
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
    onSuccess: (scene) => {
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
      const previous = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      if (previous) {
        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          removeSceneFromPlots(previous, sceneId),
        );
      }

      return { previous };
    },
    onError: (_error, _sceneId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (_data, sceneId) => {
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
        (current) =>
          current ? removeSceneFromPlots(current, sceneId) : current,
      );
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

      let previousPlots =
        queryClient.getQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(input.storyId),
        ) ?? [];

      const shouldShift = moveRequiresShift(
        queryClient,
        input.storyId,
        input.toPlotId,
        input.toIndex,
      );

      if (shouldShift) {
        const shiftedResources = shiftGridUpwardOnIndex(
          previousPlots,
          input.toIndex,
        );
        previousPlots = shiftedResources.plots;
      }

      const foundScene = previousPlots
        .find((plot) => plot.id === input.fromPlotId)
        ?.scenes.find((scene) => scene.id === input.sceneId);

      // update scene vertical index
      previousPlots = previousPlots.map((plot) => {
        if (
          plot.id === input.fromPlotId &&
          input.fromPlotId !== input.toPlotId
        ) {
          /**
           * If moving to new plot, remove scene from old plot
           */
          return {
            ...plot,
            scenes: plot.scenes.filter((scene) => scene.id !== input.sceneId),
          };
        }

        if (plot.id === input.toPlotId && input.fromPlotId !== input.toPlotId) {
          /**
           * If moving to new plot, insert found scene into new plot.
           */
          if (foundScene) {
            return {
              ...plot,
              scenes: sortScenes([...plot.scenes, { ...foundScene }]),
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
          return {
            ...plot,
            scenes: plot.scenes.map((scene) => {
              if (scene.id === input.sceneId) {
                return {
                  ...scene,
                  verticalIndex: input.toIndex,
                  plotId: input.toPlotId,
                };
              }
              return scene;
            }),
          };
        }
        return plot;
      });

      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(input.storyId),
        previousPlots,
      );

      return {
        previous: {
          plots: previousPlots,
        },
      };
    },
    onError: (_error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(input.storyId),
          context.previous.plots,
        );
      }
    },
    onSuccess: ({ scenes }, input) => {
      console.log("apply scenes", scenes, "from", input);
    },
  });

  return { moveSingleCardWithinPlot: mutateAsync, isMutating: !isIdle };
};

function shiftGridUpwardOnIndex(plots: Plot[], targetVerticalIndex: number) {
  /**
   * Currently just updating plots
   */
  return {
    plots: plots.map((plot) => {
      const hasScenesToUpdate = plot.scenes.some(
        (scene) => scene.verticalIndex >= targetVerticalIndex,
      );
      if (!hasScenesToUpdate) {
        return plot;
      }

      return {
        ...plot,
        scenes: plot.scenes.map((scene) =>
          scene.verticalIndex >= targetVerticalIndex
            ? { ...scene, verticalIndex: scene.verticalIndex + 1 }
            : scene,
        ),
      };
    }),
  };
}

function moveRequiresShift(
  queryClient: QueryClient,
  storyId: string,
  targetPlotId: string,
  targetVerticalIndex: number,
) {
  // Check full grid.
  // currently just supporting scenes

  const hasScene = hasSceneOnIndex(
    queryClient,
    storyId,
    targetPlotId,
    targetVerticalIndex,
  );

  return hasScene;
}

function hasSceneOnIndex(
  queryClient: QueryClient,
  storyId: string,
  targetPlotId: string,
  targetVerticalIndex: number,
) {
  const plots = queryClient.getQueryData<Plot[]>(
    useStoryPlotsQuery.queryKey(storyId),
  );
  if (!plots) {
    return false;
  }

  const targetPlot = plots.find((plot) => plot.id === targetPlotId);
  if (!targetPlot) {
    return false;
  }

  const hasSceneAtTargetIndex = targetPlot.scenes.some(
    (scene) => scene.verticalIndex === targetVerticalIndex,
  );
  return hasSceneAtTargetIndex;
}

export const findAndUpdatePlotScenes = (plots: Plot[], scenes: Scene[]) => {
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));

  return plots.map((plot) => {
    const hasScene = plot.scenes.some((scene) => sceneMap.has(scene.id));
    if (!hasScene) {
      return plot;
    }

    const nextScenes = plot.scenes.map(
      (scene) => sceneMap.get(scene.id) ?? scene,
    );

    return { ...plot, scenes: sortScenes(nextScenes) };
  });
};

export const MoveSceneMutations = {
  useMoveSingleWithinPlot,
};
