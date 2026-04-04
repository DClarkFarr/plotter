import { create } from "zustand";

import type {
  Character,
  CharacterCustomAttribute as CharacterCustomAttributeApi,
  CharacterList,
  CharacteristicFields,
} from "../api/types";
import {
  DEFAULT_CHARACTERISTIC_ORDER,
  DEFAULT_CHARACTER_LIST_LABELS,
} from "../utils/characterCharacteristics";
import type {
  CharacterCustomAttributeDraft,
  CharacterListDraft,
} from "../types/characterEditor";

const buildCharacteristicState = (
  characteristics: CharacteristicFields | null | undefined,
): Record<string, string> => {
  const next: Record<string, string> = {};
  DEFAULT_CHARACTERISTIC_ORDER.forEach((key) => {
    const value = characteristics?.[key];
    next[key] = value === undefined || value === null ? "" : String(value);
  });
  return next;
};

const buildCustomAttributesState = (
  custom: CharacterCustomAttributeApi[] | undefined,
): CharacterCustomAttributeDraft[] => {
  if (!custom) {
    return [];
  }

  return custom.map((entry) => ({
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: entry.label,
    value: entry.value,
  }));
};

const buildListState = (
  lists: CharacterList[] | undefined,
): CharacterListDraft[] => {
  const defaults: CharacterListDraft[] = DEFAULT_CHARACTER_LIST_LABELS.map(
    (label) => {
      const existing = lists?.find((entry) => entry.label === label);
      return {
        id: `list-${label}`,
        label,
        items: existing?.items ?? [],
        isDefault: true,
      };
    },
  );

  const custom = (lists ?? [])
    .filter(
      (entry) =>
        !(DEFAULT_CHARACTER_LIST_LABELS as unknown as string[]).includes(
          entry.label,
        ),
    )
    .map((entry) => ({
      id: `list-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: entry.label,
      items: entry.items,
      isDefault: false,
    }));

  return [...defaults, ...custom];
};

const createEmptyState = () => ({
  title: "",
  description: "",
  characteristics: buildCharacteristicState(undefined),
  customAttributes: [] as CharacterCustomAttributeDraft[],
  lists: buildListState(undefined),
});

type CharacterEditorState = {
  character: Character | null;
  title: string;
  description: string;
  characteristics: Record<string, string>;
  customAttributes: CharacterCustomAttributeDraft[];
  lists: CharacterListDraft[];
  setCharacter: (character: Character) => void;
  reset: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCharacteristic: (key: string, value: string) => void;
  setCustomAttributes: (items: CharacterCustomAttributeDraft[]) => void;
  setLists: (lists: CharacterListDraft[]) => void;
};

export const useCharacterEditorStore = create<CharacterEditorState>((set) => ({
  character: null,
  ...createEmptyState(),
  setCharacter: (character) =>
    set({
      character,
      title: character.title,
      description: character.description ?? "",
      characteristics: buildCharacteristicState(character.characteristics),
      customAttributes: buildCustomAttributesState(
        character.customCharacteristics,
      ),
      lists: buildListState(character.lists),
    }),
  reset: () => set({ character: null, ...createEmptyState() }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setCharacteristic: (key, value) =>
    set((state) => ({
      characteristics: {
        ...state.characteristics,
        [key]: value,
      },
    })),
  setCustomAttributes: (items) => set({ customAttributes: items }),
  setLists: (lists) => set({ lists }),
}));
