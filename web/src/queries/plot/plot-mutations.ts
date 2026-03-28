import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePlotInput, Plot, UpdatePlotInput } from "../../api/types";
import { createPlot, updatePlot } from "../../api/stories";
import { useStoryPlotsQuery } from "../story/story-queries";
import { shiftPlotsForInsert, sortPlots } from "./plot-helpers";

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
    mutationFn: (input: UpdatePlotInput) =>
      updatePlot(storyId, plotId, {
        ...input,
        description: input.description || undefined,
      }),
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

        const optimistic = shifted.map((plot) =>
          plot.id === plotId ? { ...plot, ...input } : plot,
        );

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
