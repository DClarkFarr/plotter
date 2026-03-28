import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSceneInput,
  Plot,
  Scene,
  UpdateSceneInput,
} from "../../api/types";
import { createScene, updateScene } from "../../api/stories";
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
