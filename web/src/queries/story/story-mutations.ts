import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteStory,
  importStoryOutline,
  shiftStoryGrid,
  updateStory,
  type UpdateStoryInput,
} from "../../api/stories";
import type { ImportOutlineInput, StoryGridShiftInput } from "../../api/types";
import type { Story } from "../../api/types";
import {
  applyOptimisticShift,
  applyShiftedResources,
} from "./shifted-resources";
import { useStoryPlotsQuery } from "./story-queries";
import { useStorySectionsQuery } from "../section/section-queries";
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

export function useImportOutlineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportOutlineInput) => importStoryOutline(input),
    onSuccess: (_data, input) => {
      if (input.mode === "create") {
        queryClient.invalidateQueries({ queryKey: ["stories"] });
      }
    },
  });
}

export function useStoryGridShiftMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StoryGridShiftInput) => shiftStoryGrid(storyId, input),
    onMutate: (input) => {
      const rangeStart =
        input.shift === -1 ? input.startIndex + 1 : input.startIndex;
      applyOptimisticShift(queryClient, storyId, {
        rangeStart,
        rangeEnd: undefined,
        shift: input.shift,
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });
      queryClient.invalidateQueries({
        queryKey: useStorySectionsQuery.queryKey(storyId),
      });
    },
    onSuccess: (response) => {
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
  });
}

export function useDeleteStoryMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteStory(storyId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previousStories = queryClient.getQueryData<Story[]>(["stories"]);
      if (previousStories) {
        queryClient.setQueryData<Story[]>(
          ["stories"],
          previousStories.filter((s) => s.id !== storyId),
        );
      }
      return { previousStories };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories"], context.previousStories);
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["story", storyId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
