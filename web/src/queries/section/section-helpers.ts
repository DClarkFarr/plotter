import type { Section } from "../../api/types";
import type { MoveRangeShift } from "../story/shift-logic";

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

const shouldShiftIndex = (verticalIndex: number, shift: MoveRangeShift) => {
  if (shift.rangeEnd === undefined) {
    return verticalIndex >= shift.rangeStart;
  }

  return verticalIndex >= shift.rangeStart && verticalIndex <= shift.rangeEnd;
};

export const shiftSectionsInRange = (
  sections: Section[],
  shift: MoveRangeShift,
) =>
  sections.map((section) =>
    shouldShiftIndex(section.verticalIndex, shift)
      ? { ...section, verticalIndex: section.verticalIndex + shift.shift }
      : section,
  );
