import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSectionInput,
  Plot,
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
import { useStoryPlotsQuery } from "../story/story-queries";
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
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      const plotsSnapshot = previousPlots ?? [];
      const sectionsSnapshot = previous ?? [];

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        let nextPlots = plotsSnapshot;
        let nextSections = sectionsSnapshot;
        const shouldShift = shouldShiftForSectionInsert(
          nextPlots,
          nextSections,
          input.verticalIndex,
        );

        if (shouldShift) {
          const shifted = applyOptimisticShiftToState(nextPlots, nextSections, {
            rangeStart: input.verticalIndex,
            rangeEnd: undefined,
            shift: 1,
          });
          nextPlots = shifted.plots;
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

        if (shouldShift && previousPlots) {
          queryClient.setQueryData<Plot[]>(
            useStoryPlotsQuery.queryKey(storyId),
            nextPlots,
          );
        }
      }

      return { previous: { sections: previous, plots: previousPlots }, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.plots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous.plots,
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
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });

      const previousSections = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      if (!previousSections) {
        return {
          previous: { sections: previousSections, plots: previousPlots },
        };
      }

      const target = previousSections.find(
        (section) => section.id === input.sectionId,
      );
      if (!target) {
        return {
          previous: { sections: previousSections, plots: previousPlots },
        };
      }

      let nextSections = previousSections;
      let nextPlots = previousPlots ?? [];

      if (
        input.verticalIndex !== undefined &&
        input.verticalIndex !== target.verticalIndex
      ) {
        const fallbackPlotId = nextPlots[0]?.id;
        if (fallbackPlotId) {
          const shift = getMoveRangeShift({
            fromIndex: target.verticalIndex,
            toIndex: input.verticalIndex,
            fromPlotId: fallbackPlotId,
            toPlotId: fallbackPlotId,
            resource: { id: target.id, type: "section" },
            plots: nextPlots,
            sections: nextSections,
          });

          if (shift) {
            const shifted = applyOptimisticShiftToState(
              nextPlots,
              nextSections,
              shift,
            );
            nextPlots = shifted.plots;
            nextSections = shifted.sections;
          }
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
              }
            : section,
        ),
      );

      queryClient.setQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
        nextSections,
      );

      if (previousPlots) {
        queryClient.setQueryData<Plot[]>(
          useStoryPlotsQuery.queryKey(storyId),
          nextPlots,
        );
      }

      return { previous: { sections: previousSections, plots: previousPlots } };
    },
    onError: (_error, _input, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.plots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous.plots,
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
        queryKey: useStoryPlotsQuery.queryKey(storyId),
      });

      const previous = queryClient.getQueryData<Section[]>(
        useStorySectionsQuery.queryKey(storyId),
      );
      const previousPlots = queryClient.getQueryData<Plot[]>(
        useStoryPlotsQuery.queryKey(storyId),
      );

      if (previous) {
        const target = previous.find((section) => section.id === sectionId);
        let nextSections = previous.filter(
          (section) => section.id !== sectionId,
        );
        let nextPlots = previousPlots ?? [];

        if (target) {
          const shouldShift = shouldShiftAfterSectionRemoval(
            nextPlots,
            target.verticalIndex,
          );
          if (shouldShift) {
            const shifted = applyOptimisticShiftToState(
              nextPlots,
              nextSections,
              {
                rangeStart: target.verticalIndex + 1,
                rangeEnd: undefined,
                shift: -1,
              },
            );
            nextPlots = shifted.plots;
            nextSections = shifted.sections;
          }
        }

        queryClient.setQueryData<Section[]>(
          useStorySectionsQuery.queryKey(storyId),
          nextSections,
        );

        if (previousPlots) {
          queryClient.setQueryData<Plot[]>(
            useStoryPlotsQuery.queryKey(storyId),
            nextPlots,
          );
        }
      }

      return { previous: { sections: previous, plots: previousPlots } };
    },
    onError: (_error, _sectionId, context) => {
      if (context?.previous?.sections) {
        queryClient.setQueryData(
          useStorySectionsQuery.queryKey(storyId),
          context.previous.sections,
        );
      }
      if (context?.previous?.plots) {
        queryClient.setQueryData(
          useStoryPlotsQuery.queryKey(storyId),
          context.previous.plots,
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
