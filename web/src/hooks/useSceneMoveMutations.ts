export type MoveSingleCardWithinPlotProps = {
  plotId: string;
  sceneId: string;
  fromIndex: number;
  toIndex: number;
};

export type MoveSingleCardBetweenPlotsProps = MoveSingleCardWithinPlotProps & {
  targetPlotId: string;
};

const useMoveSingleWithinPlot = () => {
  const moveSingleCardWithinPlot = ({
    plotId,
    sceneId,
    fromIndex,
    toIndex,
  }: MoveSingleCardWithinPlotProps) => {
    console.log("moveSingleCardWithinPlot", {
      plotId,
      sceneId,
      fromIndex,
      toIndex,
    });
  };

  return { moveSingleCardWithinPlot };
};

const useMoveSingleBetweenPlots = () => {
  const moveSingleCardBetweenPlots = ({
    plotId,
    sceneId,
    fromIndex,
    toIndex,
    targetPlotId,
  }: MoveSingleCardBetweenPlotsProps) => {
    console.log("moveSingleCardBetweenPlots", {
      plotId,
      sceneId,
      fromIndex,
      toIndex,
      targetPlotId,
    });
  };

  return { moveSingleCardBetweenPlots };
};

export const MoveSceneMutations = {
  useMoveSingleWithinPlot,
  useMoveSingleBetweenPlots,
};
