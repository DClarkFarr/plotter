import type { Tag } from "../api/types";

export type TagImportRow = {
  letter: string;
  left: Tag | null;
  right: Tag | null;
  isGroupStart: boolean;
};

const normalizeLetter = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "#";
  }
  return trimmed[0]?.toUpperCase() ?? "#";
};

const sortTagsByName = (tags: Tag[]) =>
  [...tags].sort((a, b) => a.name.localeCompare(b.name));

const groupTagsByLetter = (tags: Tag[]) => {
  const grouped = new Map<string, Tag[]>();
  for (const tag of sortTagsByName(tags)) {
    const letter = normalizeLetter(tag.name);
    const existing = grouped.get(letter) ?? [];
    existing.push(tag);
    grouped.set(letter, existing);
  }
  return grouped;
};

export const buildTagImportRows = (
  sourceTags: Tag[],
  currentTags: Tag[],
): TagImportRow[] => {
  const leftGroups = groupTagsByLetter(sourceTags);
  const rightGroups = groupTagsByLetter(currentTags);
  const letters = Array.from(
    new Set([...leftGroups.keys(), ...rightGroups.keys()]),
  ).sort((a, b) => a.localeCompare(b));

  const rows: TagImportRow[] = [];
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
