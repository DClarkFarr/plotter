import { useState } from "react";
import { Button, Textarea, TextInput } from "flowbite-react";
import type { Plot } from "../../api/types";
import { useUpdatePlotMutation } from "../../hooks/useStory";

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

  const handleCancel = () => {
    setError(null);
    setDraftTitle(plot.title);
    setDraftDescription(plot.description);
    setDraftColor(plot.color);
    setIsEditing(false);
  };

  const handleSave = () => {
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
    setIsEditing(false);
  };

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

  if (isEditing) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3">
          <TextInput
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder={`Plot ${plotIndex + 1} title`}
          />
          <Textarea
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            rows={4}
            placeholder="Plot description"
          />
          <input
            type="color"
            value={draftColor}
            onChange={(event) => setDraftColor(event.target.value)}
            className="h-10 w-20 rounded border border-slate-200"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {updateMutation.error ? (
            <p className="text-sm text-rose-600">
              {updateMutation.error.message}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <Button color="gray" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-6">
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
      <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
            Move left
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
            Move right
          </Button>
        ) : null}
        <Button color="gray" size="xs" type="button" onClick={handleEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
};
