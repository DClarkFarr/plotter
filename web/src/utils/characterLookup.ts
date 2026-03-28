import type { Character } from "../api/types";

export const findCharacterById = (
  characters: Character[],
  characterId: string | null | undefined,
): Character | null => {
  if (!characterId) {
    return null;
  }

  return characters.find((character) => character.id === characterId) ?? null;
};
