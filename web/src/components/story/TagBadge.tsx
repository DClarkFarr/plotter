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
      className="inline-flex items-center rounded px-1 py-0.5 text-xs font-semibold shadow-sm"
    >
      {tag.name}
      {variant ? (
        <>
          :<span className="ml-1 text-[10px] font-semibold">{variant}</span>
        </>
      ) : null}
    </button>
  );
};
