import { useEffect, useMemo, useState } from "react";
import { Button, TextInput } from "flowbite-react";
import type { Plot } from "../../../api/types";
import { useCreatePlotMutation } from "../../../hooks/useStory";

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

  const isDirty = title.trim() !== defaultTitle.trim();
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

  if (!plot) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 h-[150px] flex flex-col self-stretch">
        <div className="">
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
        <div className="flex justify-end mt-auto">
          <div
            className={`transition-opacity duration-200 ${
              isDirty ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Button onClick={handleCreate} disabled={!isDirty || isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-300 px-4 py-2">
      <div className="text-sm text-slate-500">Plot {plotIndex + 1}</div>
    </div>
  );
};
