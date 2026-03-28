import type { SceneTagVariant, Tag } from "../../api/types";
import { TagBadge } from "./TagBadge";
import IconPlusThick from "~icons/mdi/plus-thick";

export type SceneTagsProps = {
  tags: Tag[];
  selectedTags: string[];
  tagVariants: SceneTagVariant[];
  onOpen: () => void;
};

export const SceneTags = ({
  tags,
  selectedTags,
  tagVariants,
  onOpen,
}: SceneTagsProps) => {
  const selected = tags.filter((tag) => selectedTags.includes(tag.id));
  const variantMap = new Map(
    tagVariants.map((entry) => [entry.tagId, entry.variant]),
  );

  if (selected.length === 0) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
      >
        <IconPlusThick className="inline-block w-4 h-4 mr-1" /> Tags
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          variant={variantMap.get(tag.id)}
          onClick={onOpen}
        />
      ))}
    </div>
  );
};
