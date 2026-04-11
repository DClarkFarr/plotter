import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSectionInput,
  Section,
  UpdateSectionInput,
} from "../../api/types";
import { createSection, deleteSection, updateSection } from "../../api/stories";
import { useStorySectionsQuery } from "./section-queries";
import { sortSections } from "./section-helpers";
import { applyShiftedResources } from "../story/shifted-resources";

export function useCreateSectionMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSectionInput) => createSection(storyId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStorySectionsQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Section = {
          id: tempId,
          storyId,
          title: input.title,
          verticalIndex: input.verticalIndex,
          type: input.type,
        };

        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(storyId),
          sortSections([...previous, optimistic]),
        );
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (response, _input, context) => {
      const section = response.section;
      queryClient.setQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [section];
          }

          const replaced = current.map((entry) =>
            entry.id === context?.tempId ? section : entry,
          );
          const hasSection = replaced.some((entry) => entry.id === section.id);
          return sortSections(hasSection ? replaced : [...replaced, section]);
        },
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
  });
}

type UpdateSectionPayload = UpdateSectionInput & {
  sectionId: string;
};

export function useUpdateSectionMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSectionPayload) =>
      updateSection(storyId, input.sectionId, input),
    onSuccess: (response) => {
      const section = response.section;
      queryClient.setQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [section];
          }

          const next = current.map((entry) =>
            entry.id === section.id ? section : entry,
          );
          const hasSection = next.some((entry) => entry.id === section.id);
          return sortSections(hasSection ? next : [...next, section]);
        },
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
  });
}

export function useDeleteSectionMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) => deleteSection(storyId, sectionId),
    onMutate: async (sectionId) => {
      await queryClient.cancelQueries({
        queryKey: useStorySectionsQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );

      if (previous) {
        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(storyId),
          previous.filter((section) => section.id !== sectionId),
        );
      }

      return { previous };
    },
    onError: (_error, _sectionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (response, sectionId) => {
      queryClient.setQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
        (current) =>
          current
            ? current.filter((section) => section.id !== sectionId)
            : current,
      );
      applyShiftedResources(queryClient, storyId, response.shiftedResources);
    },
  });
}
