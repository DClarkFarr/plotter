import type { StoryCardSize } from "../store/storyStore.types";

type UseGridSizesProps = {
  cardSize: StoryCardSize;
};
export const useGridSizes = ({ cardSize }: UseGridSizesProps) => {
  const cardSizeMap: Record<StoryCardSize, number> = {
    sm: 250,
    md: 350,
    lg: 500,
  };

  return {
    width: cardSizeMap[cardSize],
  };
};
