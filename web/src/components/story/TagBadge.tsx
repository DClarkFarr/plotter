import type { Tag } from "../../api/types";
import { usePlotTheme } from "../../hooks/usePlotTheme";

export type TagBadgeProps = {
  tag: Tag;
  onClick: () => void;
};
export const TagBadge = ({ tag, onClick }: TagBadgeProps) => {
  const { textColor } = usePlotTheme(tag.color);
  return (
    <button
      key={tag.id}
      type="button"
      onClick={onClick}
      style={{ backgroundColor: tag.color, color: textColor }}
      className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold shadow-sm"
    >
      {tag.name}
    </button>
  );
};
