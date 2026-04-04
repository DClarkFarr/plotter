import { create } from "zustand";
import type { Character } from "../api/types";
import { useCharacterEditorStore } from "./characterEditorStore";

type CharacterModalMode = "create" | "edit";

type CharacterModalState = {
  isOpen: boolean;
  mode: CharacterModalMode;
  openCreate: () => void;
  openEdit: (character: Character) => void;
  close: () => void;
};

export const useCharacterModalStore = create<CharacterModalState>((set) => ({
  isOpen: false,
  mode: "create",
  openCreate: () => {
    useCharacterEditorStore.getState().reset();
    set({ isOpen: true, mode: "create" });
  },
  openEdit: (character) => {
    useCharacterEditorStore.getState().setCharacter(character);
    set({ isOpen: true, mode: "edit" });
  },
  close: () => set({ isOpen: false }),
}));
