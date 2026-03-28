import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTagInput,
  DeleteTagInput,
  Tag,
  UpdateTagInput,
} from "../../api/types";
import {
  addTagVariant,
  createTag,
  deleteTag,
  deleteTagVariant,
  updateTag,
} from "../../api/stories";
import { useStoryTagsQuery } from "../story/story-queries";
import { useSceneEditorStore } from "../../store/sceneEditorStore";

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, tagId }: DeleteTagInput) =>
      deleteTag(storyId, tagId),
    // onMutate: async ({ storyId, tagId }) => {
    //   await queryClient.cancelQueries({
    //     queryKey: useStoryTagsQuery.queryKey(storyId),
    //   });

    //   const previous = queryClient.getQueryData<Tag[]>(
    //     useStoryTagsQuery.queryKey(storyId),
    //   );

    //   if (previous) {
    //     queryClient.setQueryData<Tag[]>(
    //       useStoryTagsQuery.queryKey(storyId),
    //       previous.filter((tag) => tag.id !== tagId),
    //     );
    //   }
    //   return { previous, tagId, storyId };
    // },
    // onError: (_error, _input, context) => {
    //   if (context?.previous && context.storyId) {
    //     queryClient.setQueryData(
    //       useStoryTagsQuery.queryKey(context.storyId),
    //       context.previous,
    //     );
    //   }
    // },
    onSuccess: (_data, { storyId, tagId }) => {
      queryClient.setQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [];
          }
          return current.filter((tag) => tag.id !== tagId);
        },
      );
    },
  });
}

export function useCreateTagMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(storyId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryTagsQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Tag = {
          id: tempId,
          name: input.name,
          color: input.color,
          variant: false,
          variants: [],
          storyId,
        };

        queryClient.setQueryData<Tag[]>(useStoryTagsQuery.queryKey(storyId), [
          ...previous,
          optimistic,
        ]);
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryTagsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (tag, _input, context) => {
      queryClient.setQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [tag];
          }

          const replaced = current.map((entry) =>
            entry.id === context?.tempId ? tag : entry,
          );
          const hasTag = replaced.some((entry) => entry.id === tag.id);
          return hasTag ? replaced : [...replaced, tag];
        },
      );
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

type UpdateTagPayload = UpdateTagInput & {
  tagId: string;
};

export function useUpdateTagMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTagPayload) =>
      updateTag(storyId, input.tagId, input),
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [tag];
          }

          const next = current.map((entry) =>
            entry.id === tag.id ? tag : entry,
          );
          const hasTag = next.some((entry) => entry.id === tag.id);
          return hasTag ? next : [...next, tag];
        },
      );
    },
  });
}

type AddTagVariantPayload = {
  tagId: string;
  name: string;
};

export function useAddTagVariantMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddTagVariantPayload) =>
      addTagVariant(storyId, input.tagId, input.name),
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [tag];
          }

          const next = current.map((entry) =>
            entry.id === tag.id ? tag : entry,
          );
          const hasTag = next.some((entry) => entry.id === tag.id);
          return hasTag ? next : [...next, tag];
        },
      );
    },
  });
}

type DeleteTagVariantPayload = {
  tagId: string;
  variantName: string;
};

export function useDeleteTagVariantMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteTagVariantPayload) =>
      deleteTagVariant(storyId, input.tagId, input.variantName),
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(
        useStoryTagsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [tag];
          }

          const next = current.map((entry) =>
            entry.id === tag.id ? tag : entry,
          );
          const hasTag = next.some((entry) => entry.id === tag.id);
          return hasTag ? next : [...next, tag];
        },
      );
    },
  });
}
