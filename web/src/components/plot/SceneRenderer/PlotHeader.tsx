import { useCallback, useState } from "react";
import {
  Button,
  ButtonGroup,
  Textarea,
  TextInput,
  Tooltip,
} from "flowbite-react";
import type { Plot } from "../../../api/types";
import { useUpdatePlotMutation } from "../../../hooks/useStory";
import { useDebounce } from "../../../utils/useDebounce";
import { usePlotTheme } from "../../../hooks/usePlotTheme";

import IconMoveRight from "~icons/mdi/arrow-right-thick";
import IconMoveLeft from "~icons/mdi/arrow-left-thick";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import IconClose from "~icons/mdi/close-thick";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";

export type PlotHeaderProps = {
  storyId: string;
  plot: Plot;
  plotIndex: number;
  maxHorizontalIndex: number;
};

export const PlotHeader = ({
  storyId,
  plot,
  plotIndex,
  maxHorizontalIndex,
}: PlotHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(plot.title);
  const [draftDescription, setDraftDescription] = useState(plot.description);
  const [draftColor, setDraftColor] = useState(plot.color);
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdatePlotMutation(storyId, plot.id);
  const theme = usePlotTheme(plot.color);

  const cardSize = useStoryStore((s) => s.cardSize);
  const { width } = useGridSizes({ cardSize });

  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
    "--column-width": `${width}px`,
  };

  const onClickOutside = useCallback(() => {
    setIsEditing(false);
  }, []);

  const { containerRef } = useClickOutside<HTMLDivElement>({
    onClickOutside,
  });

  const onSaveDebounced = useDebounce(() => {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setError(null);
    updateMutation.mutate({
      title: trimmedTitle,
      description: draftDescription.trim(),
      color: draftColor,
    });
  }, 500);

  const handleEdit = () => {
    setError(null);
    setDraftTitle(plot.title);
    setDraftDescription(plot.description);
    setDraftColor(plot.color);
    setIsEditing(true);
  };

  const canMoveLeft = plot.horizontalIndex > 0;
  const canMoveRight = plot.horizontalIndex < maxHorizontalIndex + 1;
  const isPending = updateMutation.isPending;

  const onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftTitle(event.target.value);
    onSaveDebounced();
  };

  const onChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDraftDescription(event.target.value);
    onSaveDebounced();
  };
  const onChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraftColor(event.target.value);
    onSaveDebounced();
  };

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        style={themeStyles}
        className="plot-header group w-[var(--column-width)] rounded-lg border border-[var(--plot-color)] bg-[var(--plot-color-soft)] p-6 h-full relative z-10 text-[var(--plot-text)] transition-colors duration-300"
      >
        <ButtonGroup className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-100">
          <Button
            color="gray"
            size="xs"
            type="button"
            onClick={() => setIsEditing(false)}
          >
            <Tooltip content="Close" className="whitespace-nowrap">
              <IconClose />
            </Tooltip>
          </Button>
        </ButtonGroup>
        <div className="flex flex-col gap-3">
          <TextInput
            value={draftTitle}
            onChange={onChangeTitle}
            placeholder={`Plot ${plotIndex + 1} title`}
          />
          <Textarea
            value={draftDescription}
            onChange={onChangeDescription}
            rows={4}
            placeholder="Plot description"
          />

          <label className="flex items-center gap-2">
            <input
              type="color"
              value={draftColor}
              onChange={onChangeColor}
              className=""
            />
            <span>Plot Color</span>
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {updateMutation.error ? (
            <p className="text-sm text-rose-600">
              {updateMutation.error.message}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      style={themeStyles}
      className="plot-header w-[var(--column-width)] group relative rounded-lg border border-[var(--plot-color)] bg-[var(--plot-color-soft)] p-6 h-full text-[var(--plot-text)] transition-colors duration-300"
    >
      <ButtonGroup className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {canMoveLeft ? (
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
            <Tooltip content="Move left" className="whitespace-nowrap">
              <IconMoveLeft />
            </Tooltip>
          </Button>
        ) : null}
        {canMoveRight ? (
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
            <Tooltip content="Move right" className="whitespace-nowrap">
              <IconMoveRight />
            </Tooltip>
          </Button>
        ) : null}
        <Button color="cyan" size="xs" type="button" onClick={handleEdit}>
          <Tooltip content="Edit">
            <IconLeadPencil />
          </Tooltip>
        </Button>
      </ButtonGroup>

      <div>
        {cardSize !== "sm" && (
          <div className="text-xs uppercase tracking-[0.2em] opacity-70">
            Plot {plotIndex + 1}
          </div>
        )}
        <h3
          className={`mt-2 text-lg font-semibold ${cardSize !== "lg" && `whitespace-nowrap overflow-hidden text-ellipsis`}`}
        >
          {plot.title}
        </h3>
        <p className="mt-2 text-sm opacity-80">{plot.description}</p>
      </div>
    </div>
  );
};
