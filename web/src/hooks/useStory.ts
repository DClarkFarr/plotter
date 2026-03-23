import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStory,
  listStoryPlots,
  listStoryTags,
  updateStory,
  type UpdateStoryInput,
} from "../api/stories";
import type { Story } from "../api/types";

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
