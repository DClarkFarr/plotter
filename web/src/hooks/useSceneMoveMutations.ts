import { useMutation } from "@tanstack/react-query";
import { moveSingleSceneWithinPlot } from "../api/stories";

export type MoveSingleCardWithinPlotProps = {
  storyId: string;
  plotId: string;
  sceneId: string;
  fromIndex: number;
  toIndex: number;
};

export type MoveSingleCardBetweenPlotsProps = MoveSingleCardWithinPlotProps & {
  targetPlotId: string;
};

const useMoveSingleWithinPlot = () => {
  const { mutateAsync, isIdle } = useMutation({
    mutationFn: moveSingleSceneWithinPlot,
  });

  return { moveSingleCardWithinPlot: mutateAsync, isMutating: !isIdle };
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
