import type { OrderedSceneEntry } from "../../utils/listViewOrdering";
import { entryIsScene } from "../../utils/listViewOrdering";
import type { FilterVisibilityMode } from "../../store/storyStore.types";
import { usePlotTheme } from "../../hooks/usePlotTheme";
import IconArrowRight from "~icons/mdi/arrow-right";

export type ListViewSidebarItemProps = {
  entry: OrderedSceneEntry;
  isActive: boolean;
  isFilterExcluded: boolean;
  filterVisibilityMode: FilterVisibilityMode;
  onClick: () => void;
};

export const ListViewSidebarItem = ({
  entry,
  isActive,
  isFilterExcluded,
  filterVisibilityMode,
  onClick,
}: ListViewSidebarItemProps) => {
  const plotColor = entryIsScene(entry) ? entry.plot.color : undefined;
  const theme = usePlotTheme(plotColor);

  const isDisabled = isFilterExcluded && filterVisibilityMode === "hide";

  const handleClick = () => {
    if (isDisabled) return;
    onClick();
  };

  if (entryIsScene(entry)) {
    const { scene } = entry;
    const title = scene.title?.trim() || "Untitled scene";
    const isMinified = isFilterExcluded && filterVisibilityMode === "minify";

    return (
      <button
        type="button"
        onClick={handleClick}
        className={[
          "w-full flex items-center gap-1 text-left text-sm py-1 pl-2 pr-2",
          "border-l-4 border-l-[var(--plot-color)]",
          isActive
            ? "bg-sky-50 text-sky-700"
            : "hover:bg-slate-50 text-slate-700",
          isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
          isMinified ? "opacity-40 line-through" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ "--plot-color": theme.baseColor }}
      >
        <span className="flex-1 truncate">{title}</span>
        {isActive && <IconArrowRight className="shrink-0" />}
      </button>
    );
  }

  const { section } = entry;
  const title = section.title?.trim() || "Untitled";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "w-full flex items-center gap-1 text-left cursor-pointer",
        section.type === "act"
          ? "text-lg font-bold py-2 px-3"
          : "text-base font-semibold py-1 px-3",
        isActive
          ? "bg-sky-50 text-sky-700"
          : "hover:bg-slate-50 text-slate-800",
      ].join(" ")}
    >
      <span className="flex-1 truncate">{title}</span>
      {isActive && <IconArrowRight className="shrink-0" />}
    </button>
  );
};
