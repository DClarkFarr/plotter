import type { Character } from "../api/types";

export type CharacterImportRow = {
  letter: string;
  left: Character | null;
  right: Character | null;
  isGroupStart: boolean;
};

const normalizeLetter = (title: string): string => {
  const trimmed = title.trim();
  if (!trimmed) {
    return "#";
  }
  return trimmed[0]?.toUpperCase() ?? "#";
};

const sortCharactersByTitle = (characters: Character[]) =>
  [...characters].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );

const groupCharactersByLetter = (characters: Character[]) => {
  const grouped = new Map<string, Character[]>();
  for (const character of sortCharactersByTitle(characters)) {
    const letter = normalizeLetter(character.title);
    const existing = grouped.get(letter) ?? [];
    existing.push(character);
    grouped.set(letter, existing);
  }
  return grouped;
};

export const buildCharacterImportRows = (
  sourceCharacters: Character[],
  currentCharacters: Character[],
): CharacterImportRow[] => {
  const leftGroups = groupCharactersByLetter(sourceCharacters);
  const rightGroups = groupCharactersByLetter(currentCharacters);
  const letters = Array.from(
    new Set([...leftGroups.keys(), ...rightGroups.keys()]),
  ).sort((a, b) => a.localeCompare(b));

  const rows: CharacterImportRow[] = [];
  for (const letter of letters) {
    const left = leftGroups.get(letter) ?? [];
    const right = rightGroups.get(letter) ?? [];
    const rowCount = Math.max(left.length, right.length);

    for (let i = 0; i < rowCount; i += 1) {
      rows.push({
        letter,
        left: left[i] ?? null,
        right: right[i] ?? null,
        isGroupStart: i === 0,
      });
    }
  }

  return rows;
};
