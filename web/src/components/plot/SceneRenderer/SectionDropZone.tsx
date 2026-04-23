import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { memo } from "react";
import type { Section } from "../../../api/types";

type SectionDropZoneProps = {
  verticalIndex: number;
  draggingSection: Section | null;
  hasSectionAtRow: boolean;
};

export const SectionDropZone = memo(
  ({
    verticalIndex,
    draggingSection,
    hasSectionAtRow,
  }: SectionDropZoneProps) => {
    const isDisabled =
      !draggingSection ||
      draggingSection.verticalIndex === verticalIndex ||
      hasSectionAtRow;

    const { isDropTarget, ref } = useDroppable({
      id: `section-dz-${verticalIndex}`,
      accept: "section",
      type: "section-droppable",
      disabled: isDisabled,
      data: { verticalIndex },
      collisionPriority: CollisionPriority.High,
    });

    return (
      <div
        ref={ref}
        data-r={verticalIndex}
        style={{ gridColumn: "2 / -1" }}
        className={`transition-[height] transition-colors duration-250 ${
          isDropTarget && !isDisabled
            ? "h-[60px] bg-purple-900 text-white shadow-lg"
            : isDisabled
              ? "h-0"
              : "h-[20px] bg-gray-200"
        }`}
      />
    );
  },
);
