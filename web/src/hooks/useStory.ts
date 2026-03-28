import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTag,
  createScene,
  createPlot,
  getStory,
  listStoryPlots,
  listStoryTags,
  updateScene,
  updateStory,
  updatePlot,
  type UpdateStoryInput,
} from "../api/stories";
import type {
  CreateSceneInput,
  CreateTagInput,
  CreatePlotInput,
  Plot,
  Scene,
  Story,
  Tag,
  UpdateSceneInput,
  UpdatePlotInput,
} from "../api/types";
import { useSceneEditorStore } from "../store/sceneEditorStore";

const sortPlots = (plots: Plot[]) =>
  [...plots].sort((a, b) => a.horizontalIndex - b.horizontalIndex);

const shiftPlotsForInsert = (
  plots: Plot[],
  plotId: string,
  toIndex: number,
) => {
  const plot = plots.find((p) => p.id === plotId);
  if (!plot) {
    return plots;
  }

  const fromIndex = plot.horizontalIndex;
  const isMovingUp = toIndex > fromIndex;

  return plots.map((plot) => {
    if (plot.id === plotId) {
      return plot;
    }

    if (isMovingUp) {
      if (plot.horizontalIndex > fromIndex && plot.horizontalIndex <= toIndex) {
        return { ...plot, horizontalIndex: plot.horizontalIndex - 1 };
      }
    } else {
      if (plot.horizontalIndex < fromIndex && plot.horizontalIndex >= toIndex) {
        return { ...plot, horizontalIndex: plot.horizontalIndex + 1 };
      }
    }

    return plot;
  });
};

const sortScenes = (scenes: Scene[]) =>
  [...scenes].sort((a, b) => a.verticalIndex - b.verticalIndex);

const shiftScenesForInsert = (
  scenes: Scene[],
  sceneId: string,
  toIndex: number,
) => {
  const target = scenes.find((scene) => scene.id === sceneId);
  if (!target) {
    return scenes;
  }

  const fromIndex = target.verticalIndex;
  const isMovingUp = toIndex > fromIndex;

  return scenes.map((scene) => {
    if (scene.id === sceneId) {
      return scene;
    }

    if (isMovingUp) {
      if (scene.verticalIndex > fromIndex && scene.verticalIndex <= toIndex) {
        return { ...scene, verticalIndex: scene.verticalIndex - 1 };
      }
    } else {
      if (scene.verticalIndex < fromIndex && scene.verticalIndex >= toIndex) {
        return { ...scene, verticalIndex: scene.verticalIndex + 1 };
      }
    }

    return scene;
  });
};

export function useStoryQuery(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: () => getStory(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

export function useStoryTagsQuery(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId, "tags"],
    queryFn: () => listStoryTags(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

export function useStoryPlotsQuery(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId, "plots"],
    queryFn: () => listStoryPlots(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

export function useUpdateStoryMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStoryInput) => updateStory(storyId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["story", storyId] });
      const previous = queryClient.getQueryData<Story>(["story", storyId]);
      if (previous) {
        queryClient.setQueryData<Story>(["story", storyId], {
          ...previous,
          ...input,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId], context.previous);
      }
    },
    onSuccess: (story) => {
      queryClient.setQueryData(["story", storyId], story);
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useCreatePlotMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlotInput) =>
      createPlot(storyId, {
        ...input,
        description: input.description || undefined,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "plots"],
      });
      const previous = queryClient.getQueryData<Plot[]>([
        "story",
        storyId,
        "plots",
      ]);

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Plot = {
          id: tempId,
          title: input.title,
          description: input.description || "",
          color: input.color,
          storyId,
          horizontalIndex: input.horizontalIndex,
          scenes: [],
        };

        queryClient.setQueryData<Plot[]>(
          ["story", storyId, "plots"],
          sortPlots([...previous, optimistic]),
        );
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId, "plots"], context.previous);
      }
    },
    onSuccess: (plot, _input, context) => {
      queryClient.setQueryData<Plot[]>(
        ["story", storyId, "plots"],
        (current) => {
          if (!current) {
            return [plot];
          }

          const replaced = current.map((entry) =>
            entry.id === context?.tempId ? plot : entry,
          );

          const hasPlot = replaced.some((entry) => entry.id === plot.id);
          return sortPlots(hasPlot ? replaced : [...replaced, plot]);
        },
      );
      // queryClient.invalidateQueries({ queryKey: ["story", storyId, "plots"] });
    },
  });
}

export function useUpdatePlotMutation(storyId: string, plotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlotInput) =>
      updatePlot(storyId, plotId, {
        ...input,
        description: input.description || undefined,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "plots"],
      });
      const previous = queryClient.getQueryData<Plot[]>([
        "story",
        storyId,
        "plots",
      ]);

      if (previous) {
        const shifted =
          input.horizontalIndex === undefined
            ? previous
            : shiftPlotsForInsert(previous, plotId, input.horizontalIndex);

        const optimistic = shifted.map((plot) =>
          plot.id === plotId ? { ...plot, ...input } : plot,
        );

        queryClient.setQueryData<Plot[]>(
          ["story", storyId, "plots"],
          sortPlots(optimistic),
        );
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId, "plots"], context.previous);
      }
    },
    onSuccess: (plot) => {
      queryClient.setQueryData<Plot[]>(
        ["story", storyId, "plots"],
        (current) => {
          if (!current) {
            return [plot];
          }

          const replaced = current.map((entry) =>
            entry.id === plot.id ? plot : entry,
          );
          const hasPlot = replaced.some((entry) => entry.id === plot.id);
          return sortPlots(hasPlot ? replaced : [...replaced, plot]);
        },
      );
      // queryClient.invalidateQueries({ queryKey: ["story", storyId, "plots"] });
    },
  });
}

type CreateScenePayload = CreateSceneInput & {
  plotId: string;
};

export function useCreateSceneMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateScenePayload) =>
      createScene(storyId, input.plotId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "plots"],
      });
      const previous = queryClient.getQueryData<Plot[]>([
        "story",
        storyId,
        "plots",
      ]);

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Scene = {
          id: tempId,
          title: input.title,
          description: input.description,
          plotId: input.plotId,
          tags: input.tags ?? [],
          todo: input.todo ?? [],
          scene: input.scene ?? null,
          verticalIndex: input.verticalIndex,
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

        queryClient.setQueryData<Plot[]>(["story", storyId, "plots"], updated);
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId, "plots"], context.previous);
      }
    },
    onSuccess: (scene, _input, context) => {
      queryClient.setQueryData<Plot[]>(
        ["story", storyId, "plots"],
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
        queryKey: ["story", storyId, "plots"],
      });
      const previous = queryClient.getQueryData<Plot[]>([
        "story",
        storyId,
        "plots",
      ]);

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

        queryClient.setQueryData<Plot[]>(["story", storyId, "plots"], updated);
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId, "plots"], context.previous);
      }
    },
    onSuccess: (scene) => {
      queryClient.setQueryData<Plot[]>(
        ["story", storyId, "plots"],
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

export function useCreateTagMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(storyId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "tags"],
      });
      const previous = queryClient.getQueryData<Tag[]>([
        "story",
        storyId,
        "tags",
      ]);

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Tag = {
          id: tempId,
          name: input.name,
          color: input.color,
          variant: false,
          variants: [],
          storyId,
        };

        queryClient.setQueryData<Tag[]>(
          ["story", storyId, "tags"],
          [...previous, optimistic],
        );
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["story", storyId, "tags"], context.previous);
      }
    },
    onSuccess: (tag, _input, context) => {
      queryClient.setQueryData<Tag[]>(["story", storyId, "tags"], (current) => {
        if (!current) {
          return [tag];
        }

        const replaced = current.map((entry) =>
          entry.id === context?.tempId ? tag : entry,
        );
        const hasTag = replaced.some((entry) => entry.id === tag.id);
        return hasTag ? replaced : [...replaced, tag];
      });
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}
