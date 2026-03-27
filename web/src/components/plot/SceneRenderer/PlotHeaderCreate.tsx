import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, TextInput, Tooltip } from "flowbite-react";
import type { Plot } from "../../../api/types";
import { useCreatePlotMutation } from "../../../hooks/useStory";

import IconCheckThick from "~icons/mdi/check-thick";
import IconDotsCircle from "~icons/mdi/dots-circle";

export type PlotHeaderCreateProps = {
  storyId: string;
  plot?: Plot;
  plotIndex: number;
};
export const PlotHeaderCreate = ({
  storyId,
  plot,
  plotIndex,
}: PlotHeaderCreateProps) => {
  const defaultTitle = useMemo(() => `Plot ${plotIndex}`, [plotIndex]);
  const [title, setTitle] = useState(defaultTitle);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreatePlotMutation(storyId);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  const isPending = createMutation.isPending;

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    setError(null);
    createMutation.mutate({
      title: trimmedTitle,
      description: "",
      color: "#94A3B8",
      horizontalIndex: plotIndex,
    });
  };

  if (plot) {
    return (
      <div className="text-red-600">
        this should never happen, plot already exists for this index: {plot.id}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col h-full relative group">
      <ButtonGroup className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          color="gray"
          size="xs"
          type="button"
          onClick={handleCreate}
          disabled={isPending}
        >
          <Tooltip
            content={isPending ? "Creating..." : "Create"}
            className="whitespace-nowrap"
          >
            {isPending ? (
              <IconDotsCircle className="animate-spin" />
            ) : (
              <IconCheckThick />
            )}
          </Tooltip>
        </Button>
      </ButtonGroup>

      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Create Plot {plotIndex + 1}
      </div>
      <div className="mt-2">
        <TextInput
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      {createMutation.error ? (
        <p className="mt-2 text-sm text-rose-600">
          {createMutation.error.message}
        </p>
      ) : null}
    </div>
  );
};
