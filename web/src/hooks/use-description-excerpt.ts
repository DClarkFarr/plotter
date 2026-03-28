import { useMemo } from "react";
import type { StoryCardSize } from "../store/storyStore.types";

export type UseDescriptionExcerptProps = {
  description: string;
  cardSize: StoryCardSize;
};

function stripTagsButLeaveText(html: string) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || " ";
}

export const useDescriptionExcerpt = ({
  description,
  cardSize,
}: UseDescriptionExcerptProps) => {
  const text = useMemo(() => {
    if (cardSize === "lg") {
      return description;
    }

    const stripped = stripTagsButLeaveText(description);
    return stripped.length > 75 ? stripped.slice(0, 75) + "..." : stripped;
  }, [description, cardSize]);

  return text;
};
