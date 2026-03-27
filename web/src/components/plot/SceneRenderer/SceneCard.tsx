import type { CSSProperties } from "react";
import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";

export const SceneCard = ({ plot }: SceneRendererProps) => {
  const theme = usePlotTheme(plot.color);
  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
  } as CSSProperties;

  return (
    <div
      style={themeStyles}
      className="card card--empty border border-[var(--plot-color-soft)] radius-2 h-[200px] bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300"
    >
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-sm">Story scene</div>
        <div></div>
      </div>
    </div>
  );
};
