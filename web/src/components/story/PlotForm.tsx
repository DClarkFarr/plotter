import { useEffect, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Textarea,
  TextInput,
} from "flowbite-react";

import { useStoryPlotsQuery } from "../../queries/story/story-queries";
import { useUpdatePlotMutation } from "../../queries/plot/plot-mutations";
import { useSidebarStore } from "../../store/sidebarStore";
import { usePlotEditorStore } from "../../store/plotEditorStore";
import { ColorPaletteDropdown } from "../ui/ColorPaletteDropdown";
import { useDeletePlotMutation } from "../../queries/plot/plot-mutations";

export const PlotForm = () => {
  const { storyId: storyIdRaw } = useParams({ strict: false });
  const storyId = storyIdRaw ?? "";

  const { data: plots = [], isLoading } = useStoryPlotsQuery(storyId);
  const selectedPlotId = usePlotEditorStore((state) => state.selectedPlotId);
  const setSaving = usePlotEditorStore((state) => state.setSaving);
  const error = usePlotEditorStore((state) => state.error);
  const setError = usePlotEditorStore((state) => state.setError);
  const clearSelection = usePlotEditorStore((state) => state.clearSelection);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedPlot = useMemo(() => {
    if (!selectedPlotId) {
      return null;
    }

    return plots.find((plot) => plot.id === selectedPlotId) ?? null;
  }, [plots, selectedPlotId]);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftColor, setDraftColor] = useState("#94A3B8");

  useEffect(() => {
    if (!selectedPlot) {
      return;
    }

    setDraftTitle(selectedPlot.title);
    setDraftDescription(selectedPlot.description);
    setDraftColor(selectedPlot.color);
    setError(null);
  }, [selectedPlot, setError]);

  const updatePlotMutation = useUpdatePlotMutation(
    storyId,
    selectedPlotId ?? "",
  );
  const deletePlotMutation = useDeletePlotMutation(storyId);
  const canDelete = plots.length > 1;

  const handleSave = async () => {
    if (!selectedPlot) {
      return;
    }

    const title = draftTitle.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updatePlotMutation.mutateAsync({
        title,
        description: draftDescription.trim(),
        color: draftColor,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save plot");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlot || !selectedPlotId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deletePlotMutation.mutateAsync(selectedPlotId);
      setIsDeleteModalOpen(false);
      clearSelection();
      closeSidebar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete plot");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading plot...</div>;
  }

  if (!selectedPlot) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Select a plot to start editing.
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-col gap-4 min-h-full">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
          Plot {selectedPlot.horizontalIndex + 1}
        </p>
        <TextInput
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          placeholder="Plot title"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Description
        </p>
        <Textarea
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          rows={6}
          placeholder="Plot description"
        />
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          Plot Color
        </p>
        <ColorPaletteDropdown
          storyId={storyId}
          value={draftColor}
          onChange={setDraftColor}
        />
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      {updatePlotMutation.error ? (
        <div className="text-sm text-rose-600">
          {updatePlotMutation.error.message}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-end gap-2">
        <Button type="button" color="gray" onClick={closeSidebar}>
          Close
        </Button>
        <Button
          type="button"
          color="green"
          onClick={handleSave}
          disabled={updatePlotMutation.isPending}
        >
          {updatePlotMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-rose-500">
              Danger Zone
            </div>
            {!canDelete ? (
              <p className="mt-1 text-xs text-rose-600">
                You cannot delete the only active plot.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            color="red"
            size="lg"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!canDelete || deletePlotMutation.isPending}
          >
            Delete Plot
          </Button>
        </div>
      </div>

      <Modal
        dismissible
        show={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="md"
        className="z-999"
      >
        <ModalHeader>Are you sure you want to delete?</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              This will remove the plot from the active story grid and move its
              scenes to an adjacent plot.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                color="gray"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deletePlotMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                onClick={handleConfirmDelete}
                disabled={deletePlotMutation.isPending}
              >
                Yes, delete plot
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
