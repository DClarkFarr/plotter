import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStory,
  listStories,
  type CreateStoryInput,
} from "../api/stories";

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
