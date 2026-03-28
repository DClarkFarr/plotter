import type { SceneRendererProps } from "../plot.types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { useSidebarStore } from "../../../store/sidebarStore";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useDescriptionExcerpt } from "../../../hooks/use-description-excerpt";
import { findCharacterById } from "../../../utils/characterLookup";
import { CharacterDisplay } from "../../character/CharacterDisplay";
import {
  useStoryCharactersQuery,
  useStoryTagsQuery,
} from "../../../queries/story/story-queries";
import { SceneTags } from "../../story/SceneTags";

export const SceneCard = ({ plot, scene }: SceneRendererProps) => {
  const theme = usePlotTheme(plot.color);
  const selectScene = useSceneEditorStore((s) => s.selectScene);
  const openSidebar = useSidebarStore((s) => s.openSidebar);
  const cardSize = useStoryStore((s) => s.cardSize);
  const { data: characters = [] } = useStoryCharactersQuery(plot.storyId);

  const { data } = useStoryTagsQuery(plot.storyId);

  const tags = data ?? [];

  const { width, padding, minHeight } = useGridSizes({ cardSize });

  const descriptionText = useDescriptionExcerpt({
    description: scene.description,
    cardSize,
  });

  const povCharacter = findCharacterById(characters, scene.pov);

  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
    "--card-padding": `${padding}px`,
    "--column-width": `${width}px`,
    "--card-min-height": `${minHeight}px`,
  };

  const handleSelect = () => {
    selectScene(scene.id, plot.id);
    openSidebar();
  };

  return (
    <div
      style={themeStyles}
      className="card card--empty p-[var(--card-padding)] w-[var(--column-width)] min-h-[var(--card-min-height)] border border-[var(--plot-color-soft)] radius-2 h-full bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300 cursor-pointer hover:bg-[var(--plot-color-soft)]"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className={`flex flex-col gap-2 h-full relative`}>
        <div className="flex gap-2 items-center">
          {cardSize === "lg" && (
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--plot-text)]/70">
              Row {scene.verticalIndex + 1}
            </div>
          )}

          {povCharacter ? (
            <div className="ml-auto">
              {cardSize !== "sm" ? (
                <CharacterDisplay character={povCharacter} showColorDot />
              ) : (
                <CharacterDisplay character={povCharacter} avatarOnly />
              )}
            </div>
          ) : null}
        </div>

        <SceneTags
          tags={tags}
          selectedTags={scene.tags ?? []}
          tagVariants={scene.tagVariants ?? []}
        />

        <div
          className={`text-lg font-semibold ${cardSize === "md" ? "whitespace-nowrap overflow-hidden text-ellipsis" : ""}`}
        >
          {scene.title?.trim() || "Untitled scene"}
        </div>

        {cardSize === "md" && (
          <div className="text-sm text-[var(--plot-text)]/80 line-clamp-3">
            {descriptionText || "No description yet."}
          </div>
        )}
        {cardSize === "lg" && (
          <div
            className="text-sm text-[var(--plot-text)]/80 line-clamp-3 tiptap overflow-y-auto grow-1"
            dangerouslySetInnerHTML={{ __html: descriptionText }}
          ></div>
        )}
      </div>
    </div>
  );
};
