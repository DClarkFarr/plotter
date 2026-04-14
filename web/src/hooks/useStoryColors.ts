import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStoryColors,
  updateStoryColor,
  type UpdateStoryColorInput,
} from "../api/colors";
import type { StoryColor } from "../types/color";

export function useStoryColors(storyId: string) {
  return useQuery({
    queryKey: useStoryColors.queryKey(storyId),
    queryFn: () => getStoryColors(storyId),
    enabled: Boolean(storyId),
    staleTime: 60 * 1000,
  });
}

useStoryColors.queryKey = (storyId: string) => ["story", storyId, "colors"];

export function useUpdateStoryColor(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      colorId,
      patch,
    }: {
      colorId: string;
      patch: UpdateStoryColorInput;
    }) => updateStoryColor(storyId, colorId, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData<StoryColor[]>(
        useStoryColors.queryKey(storyId),
        (current) => {
          if (!current) return [updated];
          return current.map((c) => (c.id === updated.id ? updated : c));
        },
      );
    },
  });
}
