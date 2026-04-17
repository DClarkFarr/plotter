import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStory,
  duplicateStory,
  exportStoryDocx,
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

export function useExportStoryMutation() {
  const { addExportingId, removeExportingId } = useDashboardStore();

  return useMutation({
    mutationFn: (storyId: string) => exportStoryDocx(storyId),
    onMutate: (storyId) => {
      addExportingId(storyId);
    },
    onSuccess: (blob, storyId) => {
      removeExportingId(storyId);
      return blob;
    },
    onError: (_error, storyId) => {
      removeExportingId(storyId);
    },
  });
}
