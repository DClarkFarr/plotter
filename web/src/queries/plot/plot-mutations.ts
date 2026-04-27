import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePlotInput,
  Plot,
  Scene,
  UpdatePlotInput,
} from "../../api/types";
import { createPlot, deletePlot, updatePlot } from "../../api/stories";
import {
  useStoryPlotsQuery,
  useStoryScenesQuery,
} from "../story/story-queries";
import { shiftPlotsForInsert, sortPlots } from "./plot-helpers";
import { stripEmptyKeys } from "../../utils/object";

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
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Plot = {
          id: tempId,
          title: input.title,
          description: input.description || "",
          color: input.color,
          storyId,
          horizontalIndex: input.horizontalIndex,
        };

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          sortPlots([...previous, optimistic]),
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
    onSuccess: (plot, _input, context) => {
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
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
      // queryClient.invalidateQueries({ queryKey: useStoryPlotsQuery.queryKey(storyId) });
    },
  });
}

export function useUpdatePlotMutation(storyId: string, plotId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlotInput) => updatePlot(storyId, plotId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["story", storyId, "plots"],
      });
      const previous = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      if (previous) {
        const shifted =
          input.horizontalIndex === undefined
            ? previous
            : shiftPlotsForInsert(previous, plotId, input.horizontalIndex);

        const optimistic = shifted.map((plot) => {
          // TODO: strip undefined from object
          return plot.id === plotId
            ? { ...plot, ...stripEmptyKeys(input) }
            : plot;
        });

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          sortPlots(optimistic),
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
    onSuccess: (plot) => {
      queryClient.setQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
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
      // queryClient.invalidateQueries({ queryKey: useStoryPlotsQuery.queryKey(storyId) });
    },
  });
}

export function useDeletePlotMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plotId: string) => deletePlot(storyId, plotId),
    onMutate: async (plotId) => {
      await queryClient.cancelQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );

      const hasScenesInCache =
        previousScenes?.some((scene) => scene.plotId === plotId) ?? false;

      // Skip optimistic removal for in-use plots to avoid UI flicker before a 409 rollback.
      if (hasScenesInCache) {
        return { previousPlots, previousScenes };
      }

      if (previousPlots) {
        const removed = previousPlots.find((plot) => plot.id === plotId);
        const nextPlots = previousPlots
          .filter((plot) => plot.id !== plotId)
          .map((plot) => {
            if (!removed || plot.horizontalIndex < removed.horizontalIndex) {
              return plot;
            }

            return { ...plot, horizontalIndex: plot.horizontalIndex - 1 };
          });

        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          sortPlots(nextPlots),
        );
      }

      return { previousPlots, previousScenes };
    },
    onError: (_error, _plotId, context) => {
      if (context?.previousPlots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previousPlots,
        );
      }

      if (context?.previousScenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previousScenes,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      queryClient.invalidateQueries({
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });
    },
  });
}
