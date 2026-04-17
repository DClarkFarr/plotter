import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStory,
  duplicateStory,
  listStories,
  type CreateStoryInput,
} from "../api/stories";
import { useDashboardStore } from "../store/dashboardStore";

export function useStoriesQuery() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: listStories,
    staleTime: 30 * 1000,
  });
}

export function useCreateStoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStoryInput) => createStory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useDuplicateStoryMutation() {
  const queryClient = useQueryClient();
  const { addDuplicatingId, removeDuplicatingId } = useDashboardStore();

  return useMutation({
    mutationFn: (storyId: string) => duplicateStory(storyId),
    onMutate: (storyId) => {
      addDuplicatingId(storyId);
    },
    onSuccess: (_data, storyId) => {
      removeDuplicatingId(storyId);
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (_error, storyId) => {
      removeDuplicatingId(storyId);
    },
  });
}
