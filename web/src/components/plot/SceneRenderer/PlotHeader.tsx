import { useState } from "react";
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

import IconMoveRight from "~icons/mdi/arrow-right-thick";
import IconMoveLeft from "~icons/mdi/arrow-left-thick";
import IconLeadPencil from "~icons/mdi/lead-pencil";

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
  const canMoveRight = plot.horizontalIndex < maxHorizontalIndex;
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
      <div className="plot-header rounded-lg border border-slate-200 bg-white p-6 h-full">
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
    <div className="plot-header group relative rounded-lg border border-slate-200 bg-white p-6 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Plot {plotIndex + 1}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {plot.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{plot.description}</p>
        </div>
      </div>

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
        <Button color="gray" size="xs" type="button" onClick={handleEdit}>
          <Tooltip content="Edit">
            <IconLeadPencil />
          </Tooltip>
        </Button>
      </ButtonGroup>
    </div>
  );
};
