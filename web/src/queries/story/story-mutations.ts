import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStory, type UpdateStoryInput } from "../../api/stories";
import type { Story } from "../../api/types";
import { useStoryQuery } from "./story-queries";

export function useUpdateStoryMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStoryInput) => updateStory(storyId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStoryQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Story>(
        useStoryQuery.queryKey(storyId),
      );
      if (previous) {
        queryClient.setQueryData<Story>(useStoryQuery.queryKey(storyId), {
          ...previous,
          ...input,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (story) => {
      queryClient.setQueryData(useStoryQuery.queryKey(storyId), story);
      queryClient.invalidateQueries({
        queryKey: useStoryQuery.queryKey(storyId),
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
