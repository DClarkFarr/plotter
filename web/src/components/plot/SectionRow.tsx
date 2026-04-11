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
      <input
        aria-label="Section title"
        className={`bg-transparent focus:outline-none font-semibold text-slate-700 ${titleSize} w-[360px] max-w-[60%]`}
        disabled={updateMutation.isPending}
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
      />
      <div className="flex-1 h-1 bg-slate-300/80 rounded-full" />
    </div>
  );
};
