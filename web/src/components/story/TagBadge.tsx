import type { Tag } from "../../api/types";
import { usePlotTheme } from "../../hooks/usePlotTheme";

export type TagBadgeSize = "sm" | "lg";

export type TagBadgeProps = {
  tag: Tag;
  variant?: string;
  onClick: () => void;
  size?: TagBadgeSize;
};
export const TagBadge = ({
  tag,
  variant,
  onClick,
  size = "sm",
}: TagBadgeProps) => {
  const { textColor } = usePlotTheme(tag.color);
  const sizeClassName =
    size === "lg" ? "px-2 py-1 text-sm" : "px-1 py-0.5 text-xs";
  return (
    <button
      key={tag.id}
      type="button"
      onClick={onClick}
      style={{ backgroundColor: tag.color, color: textColor }}
      className={`inline-flex items-center rounded font-semibold shadow-sm ${sizeClassName}`}
    >
      {tag.name}
      {variant ? (
        <>
          :
          <span
            className={`ml-1 font-semibold ${
              size === "lg" ? "text-xs" : "text-[10px]"
            }`}
          >
            {variant}
          </span>
        </>
      ) : null}
    </button>
  );
};
