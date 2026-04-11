import { useMemo } from "react";
import type { Section } from "../../api/types";
import { Button } from "flowbite-react";
import IconArrowAll from "~icons/mdi/arrow-all";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import { useDraggable } from "@dnd-kit/react";
import { useSidebarStore } from "../../store/sidebarStore";
import { useSectionEditorStore } from "../../store/sectionEditorStore";
import { CustomTooltip } from "../helpers/CustomTooltip";

export type SectionRowProps = {
  section: Section;
  className?: string;
};

export const SectionRow = ({ section, className }: SectionRowProps) => {
  const selectSection = useSectionEditorStore((s) => s.selectSection);
  const openSidebar = useSidebarStore((s) => s.openSidebar);
  const addSidebarView = useSidebarStore((s) => s.addSidebarView);

  const titleSize = useMemo(
    () => (section.type === "act" ? "text-4xl" : "text-2xl"),
    [section.type],
  );

  const {
    ref: containerRef,
    isDragging,
    handleRef,
  } = useDraggable({
    id: section.id,
    type: "section",
    data: {
      section,
      verticalIndex: section.verticalIndex,
    },
  });

  const handleEdit = () => {
    selectSection(section.id);
    openSidebar();
    addSidebarView("section");
  };

  return (
    <div
      ref={containerRef}
      className={`section-row group flex items-center gap-4 w-full h-full ${isDragging ? `scale-80` : ``} ${className ?? ""}`}
      style={{ gridColumn: "2 / -1" }}
    >
      <div className="max-w-full">
        <div className={`whitespace-nowrap font-semibold px-3 ${titleSize}`}>
          {section.title}
        </div>
      </div>
      <div className="grow flex flex-col justify-center rounded-full w-full relative">
        <div className="h-1 bg-slate-300/80"></div>
        <div className="button-group absolute left-1 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <CustomTooltip content={`Move ${section.type}`}>
            <Button ref={handleRef} color="gray" size="xs" type="button">
              <IconArrowAll />
            </Button>
          </CustomTooltip>
          <CustomTooltip content={`Edit ${section.type}`}>
            <Button color="cyan" size="xs" type="button" onClick={handleEdit}>
              <IconLeadPencil />
            </Button>
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};
