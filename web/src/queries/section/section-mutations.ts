import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSectionInput,
  Scene,
  Section,
  UpdateSectionInput,
} from "../../api/types";
import { createSection, deleteSection, updateSection } from "../../api/stories";
import { useStorySectionsQuery } from "./section-queries";
import { sortSections } from "./section-helpers";
import {
  applyOptimisticShiftToState,
  applyShiftedResources,
} from "../story/shifted-resources";
import { useStoryScenesQuery } from "../story/story-queries";
import {
  getMoveRangeShift,
  shouldShiftAfterSectionRemoval,
  shouldShiftForSectionInsert,
} from "../story/shift-logic";

export function useCreateSectionMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSectionInput) => createSection(storyId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStorySectionsQuery.queryKey(storyId),
      });
      await queryClient.cancelQueries({
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );

      const scenesSnapshot = previousScenes ?? [];
      const sectionsSnapshot = previous ?? [];

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        let nextScenes = scenesSnapshot;
        let nextSections = sectionsSnapshot;
        const shouldShift = shouldShiftForSectionInsert(
          nextScenes,
          nextSections,
          input.verticalIndex,
        );

        if (shouldShift) {
          const shifted = applyOptimisticShiftToState(
            nextScenes,
            nextSections,
            {
              rangeStart: input.verticalIndex,
              rangeEnd: undefined,
              shift: 1,
            },
          );
          nextScenes = shifted.scenes;
          nextSections = shifted.sections;
        }

        const optimistic: Section = {
          id: tempId,
          storyId,
          title: input.title,
          verticalIndex: input.verticalIndex,
          type: input.type,
        };

        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(storyId),
          sortSections([...nextSections, optimistic]),
        );

        if (shouldShift && previousScenes) {
          queryClient.setQueryData<Scene[]>(
            useStoryScenesQuery.queryKey(storyId),
            nextScenes,
          );
        }
      }

      return {
        previous: { sections: previous, scenes: previousScenes },
        tempId,
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.scenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous.scenes,
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
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: useStorySectionsQuery.queryKey(storyId),
      });
      await queryClient.cancelQueries({
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });

      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );

      if (!previousSections) {
        return {
          previous: { sections: previousSections, scenes: previousScenes },
        };
      }

      const target = previousSections.find(
        (section) => section.id === input.sectionId,
      );
      if (!target) {
        return {
          previous: { sections: previousSections, scenes: previousScenes },
        };
      }

      let nextSections = previousSections;
      let nextScenes = previousScenes ?? [];

      if (
        input.verticalIndex !== undefined &&
        input.verticalIndex !== target.verticalIndex
      ) {
        const shift = getMoveRangeShift({
          fromIndex: target.verticalIndex,
          toIndex: input.verticalIndex,
          fromPlotId: "",
          toPlotId: "",
          resource: { id: target.id, type: "section" },
          scenes: nextScenes,
          sections: nextSections,
        });

        if (shift) {
          const shifted = applyOptimisticShiftToState(
            nextScenes,
            nextSections,
            shift,
          );
          nextScenes = shifted.scenes;
          nextSections = shifted.sections;
        }
      }

      nextSections = sortSections(
        nextSections.map((section) =>
          section.id === input.sectionId
            ? {
                ...section,
                ...(input.title !== undefined && { title: input.title }),
                ...(input.type !== undefined && { type: input.type }),
                ...(input.verticalIndex !== undefined && {
                  verticalIndex: input.verticalIndex,
                }),
                ...(input.description !== undefined && {
                  description: input.description,
                }),
              }
            : section,
        ),
      );

      queryClient.setQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
        nextSections,
      );

      if (previousScenes) {
        queryClient.setQueryData<Scene[]>(
          useStoryScenesQuery.queryKey(storyId),
          nextScenes,
        );
      }

      return {
        previous: { sections: previousSections, scenes: previousScenes },
      };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.scenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous.scenes,
        );
      }
    },
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
      await queryClient.cancelQueries({
        queryKey: useStoryScenesQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousScenes = queryClient.getQueryData<Scene[]>(
        useStoryScenesQuery.queryKey(storyId),
      );

      if (previous) {
        const target = previous.find((section) => section.id === sectionId);
        let nextSections = previous.filter(
          (section) => section.id !== sectionId,
        );
        let nextScenes = previousScenes ?? [];

        if (target) {
          const shouldShift = shouldShiftAfterSectionRemoval(
            nextScenes,
            target.verticalIndex,
          );
          if (shouldShift) {
            const shifted = applyOptimisticShiftToState(
              nextScenes,
              nextSections,
              {
                rangeStart: target.verticalIndex + 1,
                rangeEnd: undefined,
                shift: -1,
              },
            );
            nextScenes = shifted.scenes;
            nextSections = shifted.sections;
          }
        }

        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(storyId),
          nextSections,
        );

        if (previousScenes) {
          queryClient.setQueryData<Scene[]>(
            useStoryScenesQuery.queryKey(storyId),
            nextScenes,
          );
        }
      }

      return { previous: { sections: previous, scenes: previousScenes } };
    },
    onError: (_error, _sectionId, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.scenes) {
        queryClient.setQueryData(
          useStoryScenesQuery.queryKey(storyId),
          context.previous.scenes,
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
