import { useMemo, useState, type CSSProperties } from "react";
import type { Section } from "../../api/types";
import { useUpdateSectionMutation } from "../../queries/section/section-mutations";

export type SectionRowProps = {
  section: Section;
  className?: string;
  style?: CSSProperties;
};

export const SectionRow = ({ section, className, style }: SectionRowProps) => {
  const updateMutation = useUpdateSectionMutation(section.storyId);
  const [draftTitle, setDraftTitle] = useState(section.title);

  const titleSize = useMemo(
    () => (section.type === "act" ? "text-4xl" : "text-2xl"),
    [section.type],
  );

  const handleCommit = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setDraftTitle(section.title);
      return;
    }

    if (trimmed === section.title) {
      return;
    }

    updateMutation.mutate({
      sectionId: section.id,
      title: trimmed,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCommit();
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDraftTitle(section.title);
      event.currentTarget.blur();
    }
  };

  return (
    <div
      className={`section-row flex items-center gap-4 w-full h-full ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-full">
        <div
          className={`shadow whitespace-nowrap h-0 overflow-hidden font-semibold px-2 ${titleSize}`}
        >
          {draftTitle}
        </div>
        <input
          aria-label="Section title"
          className={`bg-transparent focus:outline-none focus:bg-gray-200 hover:bg-gray-200 font-semibold text-slate-700 ${titleSize} w-full`}
          disabled={updateMutation.isPending}
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="grow h-1 bg-slate-300/80 rounded-full" />
    </div>
  );
};
