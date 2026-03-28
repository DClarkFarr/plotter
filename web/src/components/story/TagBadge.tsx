import type { Tag } from "../../api/types";
import { usePlotTheme } from "../../hooks/usePlotTheme";

export type TagBadgeProps = {
  tag: Tag;
  variant?: string;
  onClick: () => void;
};
export const TagBadge = ({ tag, variant, onClick }: TagBadgeProps) => {
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
      {variant ? (
        <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
          {variant}
        </span>
      ) : null}
    </button>
  );
};
