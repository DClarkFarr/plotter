import { memo } from "react";
import { Button } from "flowbite-react";
import type { Plot } from "../../../api/types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";

import IconMoveRight from "~icons/mdi/arrow-right-thick";
import IconMoveLeft from "~icons/mdi/arrow-left-thick";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useUpdatePlotMutation } from "../../../queries/plot/plot-mutations";
import { CustomTooltip } from "../../helpers/CustomTooltip";
import { useSidebarStore } from "../../../store/sidebarStore";
import { usePlotEditorStore } from "../../../store/plotEditorStore";

export type PlotHeaderProps = {
  storyId: string;
  plot: Plot;
  plotIndex: number;
  maxHorizontalIndex: number;
};

export const PlotHeader = memo(
  ({ storyId, plot, plotIndex, maxHorizontalIndex }: PlotHeaderProps) => {
    const updateMutation = useUpdatePlotMutation(storyId, plot.id);
    const theme = usePlotTheme(plot.color);
    const openSidebar = useSidebarStore((state) => state.openSidebar);
    const addSidebarView = useSidebarStore((state) => state.addSidebarView);
    const selectPlot = usePlotEditorStore((state) => state.selectPlot);

    const cardSize = useStoryStore((s) => s.cardSize);
    const { width, padding } = useGridSizes({ cardSize });

    const themeStyles = {
      "--plot-color": theme.baseColor,
      "--plot-color-soft": theme.softColor,
      "--plot-text": theme.textColor,
      "--column-width": `${width}px`,
      "--card-padding": `${padding}px`,
    };
    const handleEdit = () => {
      selectPlot(plot.id);
      openSidebar();
      addSidebarView("plot");
    };

    const canMoveLeft = plot.horizontalIndex > 0;
    const canMoveRight = plot.horizontalIndex < maxHorizontalIndex + 1;
    const isPending = updateMutation.isPending;

    return (
      <div
        style={themeStyles}
        className="plot-header row-header z-150 w-[var(--column-width)] group relative rounded-lg border border-[var(--plot-color)] bg-[var(--plot-color-soft)] p-[var(--card-padding)] h-full text-[var(--plot-text)] transition-colors duration-300"
      >
        <div className="button-group absolute z-10 right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {canMoveLeft ? (
            <CustomTooltip placement="bottom" content="Move left">
              <Button
                color="gray"
                size="xs"
                type="button"
                disabled={isPending}
                onClick={() =>
                  updateMutation.mutate({
                    horizontalIndex: plot.horizontalIndex - 1,
                  })
                }
              >
                <IconMoveLeft />
              </Button>
            </CustomTooltip>
          ) : null}
          {canMoveRight ? (
            <CustomTooltip placement="bottom" content="Move right">
              <Button
                color="gray"
                size="xs"
                type="button"
                disabled={isPending}
                onClick={() =>
                  updateMutation.mutate({
                    horizontalIndex: plot.horizontalIndex + 1,
                  })
                }
              >
                <IconMoveRight />
              </Button>
            </CustomTooltip>
          ) : null}
          <CustomTooltip placement="bottom" content="Edit">
            <Button color="cyan" size="xs" type="button" onClick={handleEdit}>
              <IconLeadPencil />
            </Button>
          </CustomTooltip>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-70">
            Plot {plotIndex + 1}
          </div>
          <h3
            className={`mt-2 text-lg font-semibold ${cardSize !== "lg" && `whitespace-nowrap overflow-hidden text-ellipsis`}`}
          >
            {plot.title}
          </h3>

          {cardSize !== "sm" && (
            <p className="mt-2 text-sm opacity-80">{plot.description}</p>
          )}
        </div>
      </div>
    );
  },
);
