import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Character,
  CreateCharacterInput,
  DeleteCharacterInput,
  ImportCharactersInput,
  UpdateCharacterInput,
} from "../../api/types";
import {
  createCharacter,
  deleteCharacter,
  importStoryCharacters,
  updateCharacter,
} from "../../api/stories";
import { uploadCharacterImage } from "../../api/uploads";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { useStoryCharactersQuery } from "../story/story-queries";

export function useCreateCharacterMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCharacterInput) =>
      createCharacter(storyId, input),
    onMutate: async (input) => {
      useSceneEditorStore.getState().setSaving(true);
      await queryClient.cancelQueries({
        queryKey: useStoryCharactersQuery.queryKey(storyId),
      });
      const previous = queryClient.getQueryData<Character[]>(
        useStoryCharactersQuery.queryKey(storyId),
      );

      const tempId = `temp-${Date.now()}`;
      if (previous) {
        const optimistic: Character = {
          id: tempId,
          storyId,
          title: input.title,
          description: input.description ?? null,
          imageUrl: input.imageUrl ?? null,
          characteristics: input.characteristics ?? null,
          customCharacteristics: input.customCharacteristics ?? [],
          lists: input.lists ?? [],
        };

        queryClient.setQueryData<Character[]>(
          useStoryCharactersQuery.queryKey(storyId),
          [...previous, optimistic],
        );
      }

      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          useStoryCharactersQuery.queryKey(storyId),
          context.previous,
        );
      }
    },
    onSuccess: (character, _input, context) => {
      queryClient.setQueryData<Character[]>(
        useStoryCharactersQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [character];
          }

          const replaced = current.map((entry) =>
            entry.id === context?.tempId ? character : entry,
          );
          const hasCharacter = replaced.some(
            (entry) => entry.id === character.id,
          );
          return hasCharacter ? replaced : [...replaced, character];
        },
      );
    },
    onSettled: () => {
      useSceneEditorStore.getState().setSaving(false);
    },
  });
}

type UpdateCharacterPayload = UpdateCharacterInput & {
  characterId: string;
};

export function useUpdateCharacterMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCharacterPayload) =>
      updateCharacter(storyId, input.characterId, input),
    onSuccess: (character) => {
      queryClient.setQueryData<Character[]>(
        useStoryCharactersQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [character];
          }

          const next = current.map((entry) =>
            entry.id === character.id ? character : entry,
          );
          const hasCharacter = next.some((entry) => entry.id === character.id);
          return hasCharacter ? next : [...next, character];
        },
      );
    },
  });
}

export function useDeleteCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storyId, characterId }: DeleteCharacterInput) =>
      deleteCharacter(storyId, characterId),
    onSuccess: (_data, { storyId, characterId }) => {
      queryClient.setQueryData<Character[]>(
        useStoryCharactersQuery.queryKey(storyId),
        (current) => {
          if (!current) {
            return [];
          }
          return current.filter((character) => character.id !== characterId);
        },
      );
    },
  });
}

export function useUploadCharacterImageMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadCharacterImage(file),
  });
}

export function useImportCharactersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportCharactersInput) => importStoryCharacters(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: useStoryCharactersQuery.queryKey(input.toStoryId),
      });
    },
  });
}
