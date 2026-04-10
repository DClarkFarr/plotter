import type { Section } from "../../api/types";

export const sortSections = (sections: Section[]) =>
  [...sections].sort((a, b) => a.verticalIndex - b.verticalIndex);

export const shiftSectionsUpwardFromIndex = (
  sections: Section[],
  fromIndex: number,
) =>
  sections.map((section) =>
    section.verticalIndex >= fromIndex
      ? { ...section, verticalIndex: section.verticalIndex + 1 }
      : section,
  );
