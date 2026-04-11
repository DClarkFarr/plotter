import type { Section } from "../../api/types";

export type ListViewSectionProps = {
  section: Section;
};
export const ListViewSection = ({ section }: ListViewSectionProps) => {
  return (
    <div className="list-view-heading py-6 bg-gray-100">
      {section.type === "act" && (
        <div className="pb-2 mb-6 border-b border-b-3 border-slate-700">
          <h1 className="text-4xl">{section.title}</h1>
        </div>
      )}
      {section.type === "chapter" && (
        <div className="mb-4">
          <h1 className="text-2xl">{section.title}</h1>
        </div>
      )}

      {section.description && (
        <div
          className="tiptap text-sm text-slate-700 leading-6"
          dangerouslySetInnerHTML={{ __html: section.description }}
        />
      )}
    </div>
  );
};
