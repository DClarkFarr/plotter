import { memo, useCallback, useState } from "react";
import { Button, Textarea, TextInput } from "flowbite-react";
import type { Plot } from "../../../api/types";
import { useDebounce } from "../../../utils/useDebounce";
import { usePlotTheme } from "../../../hooks/usePlotTheme";

import IconMoveRight from "~icons/mdi/arrow-right-thick";
import IconMoveLeft from "~icons/mdi/arrow-left-thick";
import IconLeadPencil from "~icons/mdi/lead-pencil";
import IconCheckThick from "~icons/mdi/check-thick";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useStoryStore } from "../../../store/storyStore";
import { useGridSizes } from "../../../hooks/use-grid-sizes";
import { useUpdatePlotMutation } from "../../../queries/plot/plot-mutations";
import { CustomTooltip } from "../../helpers/CustomTooltip";

export type PlotHeaderProps = {
  storyId: string;
  plot: Plot;
  plotIndex: number;
  maxHorizontalIndex: number;
};

export const PlotHeader = memo(
  ({ storyId, plot, plotIndex, maxHorizontalIndex }: PlotHeaderProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState(plot.title);
    const [draftDescription, setDraftDescription] = useState(plot.description);
    const [draftColor, setDraftColor] = useState(plot.color);
    const [error, setError] = useState<string | null>(null);
    const updateMutation = useUpdatePlotMutation(storyId, plot.id);
    const theme = usePlotTheme(plot.color);

    const cardSize = useStoryStore((s) => s.cardSize);
    const { width, padding } = useGridSizes({ cardSize });

    const themeStyles = {
      "--plot-color": theme.baseColor,
      "--plot-color-soft": theme.softColor,
      "--plot-text": theme.textColor,
      "--column-width": `${width}px`,
      "--card-padding": `${padding}px`,
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
          className="plot-header row-header  group w-[var(--column-width)] rounded-lg border border-[var(--plot-color)] bg-[var(--plot-color-soft)] p-[var(--card-padding)] h-full relative z-150 text-[var(--plot-text)] transition-colors duration-300"
        >
          <div className="button-group absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-100">
            <CustomTooltip content="Save & Close" placement="left">
              <Button
                color="green"
                size="xs"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                <IconCheckThick />
              </Button>
            </CustomTooltip>
          </div>
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
