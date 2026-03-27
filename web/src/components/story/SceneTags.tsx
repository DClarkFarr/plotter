import type { Tag } from "../../api/types";

export type SceneTagsProps = {
  tags: Tag[];
  selectedTagIds: string[];
  onOpen: () => void;
};

export const SceneTags = ({ tags, selectedTagIds, onOpen }: SceneTagsProps) => {
  const selected = tags.filter((tag) => selectedTagIds.includes(tag.id));

  if (selected.length === 0) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
      >
        Add tags
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={onOpen}
          style={{ backgroundColor: tag.color }}
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold text-white shadow-sm"
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
};
