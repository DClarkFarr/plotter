import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Button, TextInput } from "flowbite-react";
import { CustomTooltip } from "../../helpers/CustomTooltip";
import type { Plot } from "../../../api/types";
import { usePlotTheme } from "../../../hooks/usePlotTheme";

import IconCheckThick from "~icons/mdi/check-thick";
import IconDotsCircle from "~icons/mdi/dots-circle";
import { useCreatePlotMutation } from "../../../queries/plot/plot-mutations";

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
  const theme = usePlotTheme(plot?.color);
  const themeStyles = {
    "--plot-color": theme.baseColor,
    "--plot-color-soft": theme.softColor,
    "--plot-text": theme.textColor,
  } as CSSProperties;

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
      color: "#FFF",
      horizontalIndex: plotIndex,
    });
  };

  if (plot) {
    return (
      <div
        style={themeStyles}
        className="text-red-600 border border-[var(--plot-color-soft)] bg-[var(--plot-color)] text-[var(--plot-text)] transition-colors duration-300"
      >
        this should never happen, plot already exists for this index: {plot.id}
      </div>
    );
  }

  return (
    <div
      style={themeStyles}
      className="rounded-lg row-header z-150 border border-[var(--plot-color-soft)] bg-[var(--plot-color)] p-6 flex flex-col h-full relative group text-[var(--plot-text)] transition-colors duration-300"
    >
      <div className="button-group absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <CustomTooltip
          content={isPending ? "Creating..." : "Create"}
          className="whitespace-nowrap"
        >
          <Button
            color="gray"
            size="xs"
            type="button"
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <IconDotsCircle className="animate-spin" />
            ) : (
              <IconCheckThick />
            )}
          </Button>
        </CustomTooltip>
      </div>

      <div className="text-xs uppercase tracking-[0.2em] opacity-70">
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
