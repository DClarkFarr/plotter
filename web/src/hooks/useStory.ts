import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlot,
  getStory,
  listStoryPlots,
  listStoryTags,
  updateStory,
  updatePlot,
  type UpdateStoryInput,
} from "../api/stories";
import type {
  CreatePlotInput,
  Plot,
  Story,
  UpdatePlotInput,
} from "../api/types";

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
