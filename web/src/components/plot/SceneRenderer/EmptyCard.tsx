import type { CSSProperties } from "react";
import type { EmptyRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import IconPlus from "~icons/mdi/plus";

export const EmptyCard = ({ isDisabled, plot }: EmptyRendererProps) => {
  const theme = usePlotTheme(plot?.color);
  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
  } as CSSProperties;

  return (
    <div
      style={themeStyles}
      className={`card card--empty border border-[var(--plot-color)] radius-2 bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300 self-stretch ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <div className="p-6 flex flex-col gap-4 items-center justify-center h-full">
        <div className="text-lg">Create scene</div>
        <div>
          <button
            className={`text-2xl p-4 text-[var(--plot-text)] ${
              isDisabled
                ? "cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-200"
            }`}
            type="button"
            aria-disabled={isDisabled}
            disabled={isDisabled}
          >
            <IconPlus />
          </button>
        </div>
      </div>
    </div>
  );
};
