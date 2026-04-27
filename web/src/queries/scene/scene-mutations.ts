import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSceneInput,
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
import { useStoryScenesQuery } from "../story/story-queries";
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
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );
      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previousScenes) {
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

        let nextScenes = previousScenes;
        const hasSectionsCache = previousSections !== undefined;
        let nextSections = previousSections ?? [];

        const shouldShift = shouldShiftForSceneInsert(
          nextScenes,
          nextSections,
          input.plotId,
          input.verticalIndex,
        );

        if (shouldShift) {
          const shifted = applyOptimisticShiftToState(
            nextScenes,
            nextSections,
            {
              rangeStart: input.verticalIndex,
              rangeEnd: undefined,
              shift: 1,
            },
          );
          nextScenes = shifted.scenes;
          nextSections = shifted.sections;
        }

        nextScenes = sortScenes([...nextScenes, optimistic]);

        queryClient.setQueryData<Scene[]>(
          useStoryScenesQuery.queryKey(storyId),
          nextScenes,
        );

        if (hasSectionsCache) {
          queryClient.setQueryData<Section[]>(
            useStorySectionsQuery.queryKey(storyId),
            nextSections,
          );
        }
      }

      return {
        previous: { scenes: previousScenes, sections: previousSections },
        tempId,
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.scenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous.scenes,
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
      queryClient.setQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return current;
          }

          const replaced = current.map((entry) =>
            entry.id === context?.tempId ? scene : entry,
          );
          const hasScene = replaced.some((entry) => entry.id === scene.id);
          return sortScenes(hasScene ? replaced : [...replaced, scene]);
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
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );

      if (previous) {
        const target = previous.find((scene) => scene.id === input.sceneId);

        const shifted =
          target && input.verticalIndex !== undefined
            ? shiftScenesForInsert(previous, target.id, input.verticalIndex)
            : previous;

        const updated = shifted.map((scene) =>
          scene.id === input.sceneId
            ? { ...scene, ...input, id: scene.id, plotId: scene.plotId }
            : scene,
        );

        queryClient.setQueryData<Scene[]>(
          useStoryScenesQuery.queryKey(storyId),
          sortScenes(updated),
        );
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (response) => {
      const scene = response.scene;
      queryClient.setQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return current;
          }
          return sortScenes(
            current.map((entry) => (entry.id === scene.id ? scene : entry)),
          );
        },
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

export function useDeleteSceneMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sceneId: string) => deleteScene(storyId, sceneId),
    onMutate: async (sceneId) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );
      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      if (previousScenes) {
        const target = previousScenes.find((scene) => scene.id === sceneId);

        let nextScenes = previousScenes.filter((s) => s.id !== sceneId);
        const hasSectionsCache = previousSections !== undefined;
        let nextSections = previousSections ?? [];

        if (target) {
          const shouldShift = shouldShiftAfterSceneRemoval(
            previousScenes,
            nextSections,
            target.plotId,
            target.verticalIndex,
            target.id,
          );

          if (shouldShift) {
            const shifted = applyOptimisticShiftToState(
              nextScenes,
              nextSections,
              {
                rangeStart: target.verticalIndex + 1,
                rangeEnd: undefined,
                shift: -1,
              },
            );
            nextScenes = shifted.scenes;
            nextSections = shifted.sections;
          }
        }

        queryClient.setQueryData<Scene[]>(
          useStoryScenesQuery.queryKey(storyId),
          nextScenes,
        );

        if (hasSectionsCache) {
          queryClient.setQueryData<Section[]>(
            useStorySectionsQuery.queryKey(storyId),
            nextSections,
          );
        }
      }

      return {
        previous: { scenes: previousScenes, sections: previousSections },
      };
    },
    onError: (_error, _sceneId, context) => {
      if (context?.previous?.scenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous.scenes,
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
      queryClient.setQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
        (current) =>
          current ? current.filter((s) => s.id !== sceneId) : current,
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

  const { mutateAsync, isIdle, isPending } = useMutation({
    mutationFn: moveSingleSceneWithinPlot,

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStoryScenesQuery.queryKey(input.storyId),
      });

      const previousScenes =
        queryClient.getQueryData<Scene[]>(
          useStoryScenesQuery.queryKey(input.storyId),
        ) ?? [];

      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(input.storyId),
      );

      let nextScenes = previousScenes;
      const hasSectionsCache = previousSections !== undefined;
      let nextSections = previousSections ?? [];

      const shift = getMoveRangeShift({
        fromIndex: input.fromIndex,
        toIndex: input.toIndex,
        fromPlotId: input.fromPlotId,
        toPlotId: input.toPlotId,
        resource: { id: input.sceneId, type: "scene" },
        scenes: nextScenes,
        sections: nextSections,
      });

      if (shift) {
        const shifted = applyOptimisticShiftToState(
          nextScenes,
          nextSections,
          shift,
        );
        nextScenes = shifted.scenes;
        nextSections = shifted.sections;
      }

      // update moved scene's verticalIndex and plotId
      nextScenes = sortScenes(
        nextScenes.map((scene) => {
          if (scene.id !== input.sceneId) {
            return scene;
          }
          return {
            ...scene,
            verticalIndex: input.toIndex,
            plotId: input.toPlotId,
          };
        }),
      );

      queryClient.setQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(input.storyId),
        nextScenes,
      );

      if (hasSectionsCache) {
        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(input.storyId),
          nextSections,
        );
      }

      return {
        previous: {
          scenes: previousScenes,
          sections: previousSections,
        },
      };
    },
    onError: (_error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(input.storyId),
          context.previous.scenes,
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

  return {
    moveSingleCardWithinPlot: mutateAsync,
    isMutating: !isIdle || isPending,
  };
};

export const MoveSceneMutations = {
  useMoveSingleWithinPlot,
};
