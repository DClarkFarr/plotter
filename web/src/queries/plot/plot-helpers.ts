import type { Plot } from "../../api/types";

export const sortPlots = (plots: Plot[]) =>
  [...plots].sort((a, b) => a.horizontalIndex - b.horizontalIndex);

export const shiftPlotsForInsert = (
  plots: Plot[],
  plotId: string,
  toIndex: number,
) => {
  const plot = plots.find((p) => p.id === plotId);
  if (!plot) {
    return plots;
  }

  const fromIndex = plot.horizontalIndex;
  const isMovingUp = toIndex > fromIndex;

  return plots.map((plot) => {
    if (plot.id === plotId) {
      return plot;
    }

    if (isMovingUp) {
      if (plot.horizontalIndex > fromIndex && plot.horizontalIndex <= toIndex) {
        return { ...plot, horizontalIndex: plot.horizontalIndex - 1 };
      }
    } else {
      if (plot.horizontalIndex < fromIndex && plot.horizontalIndex >= toIndex) {
        return { ...plot, horizontalIndex: plot.horizontalIndex + 1 };
      }
    }

    return plot;
  });
};
