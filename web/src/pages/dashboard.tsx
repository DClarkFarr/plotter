import { Button } from "flowbite-react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CreateStoryModal } from "../components/dashboard/CreateStoryModal";
import { ImportOutlineModal } from "../components/dashboard/ImportOutlineModal";
import { StoryGrid } from "../components/dashboard/StoryGrid";
import {
  useCreateStoryMutation,
  useDuplicateStoryMutation,
  useExportStoryMutation,
  useStoriesQuery,
} from "../hooks/useStories";
import { useDashboardStore } from "../store/dashboardStore";
import { computeExportToastDuration } from "../api/stories";
import { alert } from "../utils/alert";
import IconPlus from "~icons/mdi/plus";
import IconImport from "~icons/mdi/file-upload-outline";
import type { Story } from "../api/types";

export function DashboardPage() {
  const { data = [], isLoading, isError } = useStoriesQuery();
  const navigate = useNavigate();
  const createStoryMutation = useCreateStoryMutation();
  const duplicateStoryMutation = useDuplicateStoryMutation();
  const exportStoryMutation = useExportStoryMutation();
  const [recentlyImportedId, setRecentlyImportedId] = useState<string | null>(
    null,
  );
  const exportToastIds = useRef<Map<string, string | number>>(new Map());
  const {
    isCreateStoryOpen,
    isImportOutlineOpen,
    duplicatingStoryIds,
    exportingStoryIds,
    openCreateStory,
    closeCreateStory,
    openImportOutline,
    closeImportOutline,
  } = useDashboardStore();

  const errorMessage = useMemo(() => {
    const error = createStoryMutation.error;
    if (!error) {
      return undefined;
    }

    return error instanceof Error ? error.message : "Unable to create story";
  }, [createStoryMutation.error]);

  const handleCloseModal = () => {
    closeCreateStory();
    createStoryMutation.reset();
  };

  const handleCreateStory = (title: string) => {
    createStoryMutation.mutate(
      { title },
      {
        onSuccess: (story) => {
          closeCreateStory();
          navigate({ to: `/dashboard/story/${story.id}` });
        },
      },
    );
  };

  const handleDuplicate = useCallback(
    (story: Story) => {
      duplicateStoryMutation.mutate(story.id, {
        onSuccess: (newStory) => {
          setRecentlyImportedId(newStory.id);
          alert.success("story created");
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "Unable to duplicate story";
          alert.error(message);
        },
      });
    },
    [duplicateStoryMutation],
  );

  const handleExport = useCallback(
    (story: Story) => {
      const duration = computeExportToastDuration(story.stats.scenes);
      const toastId = toast.info("Preparing your export\u2026", {
        autoClose: duration,
        isLoading: false,
      });
      exportToastIds.current.set(story.id, toastId);

      exportStoryMutation.mutate(story.id, {
        onSuccess: (blob) => {
          const toastRef = exportToastIds.current.get(story.id);
          if (toastRef !== undefined) {
            toast.dismiss(toastRef);
            exportToastIds.current.delete(story.id);
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${story.title}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        onError: (err) => {
          const toastRef = exportToastIds.current.get(story.id);
          const message = err instanceof Error ? err.message : "Export failed";
          if (toastRef !== undefined) {
            toast.update(toastRef, {
              render: message,
              type: "error",
              autoClose: 4000,
              isLoading: false,
            });
            exportToastIds.current.delete(story.id);
          } else {
            alert.error(message);
          }
        },
      });
    },
    [exportStoryMutation],
  );

  const onViewStory = useCallback(
    (story: Story) => {
      navigate({
        to: `/dashboard/story/$storyId`,
        params: { storyId: story.id },
      });
    },
    [navigate],
  );

  return (
    <main className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Your stories
          </p>
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button color="light" type="button" onClick={openImportOutline}>
            <IconImport className="mr-2" /> Import
          </Button>
          <Button color="dark" type="button" onClick={openCreateStory}>
            <IconPlus className="mr-2" /> Story
          </Button>
        </div>
      </header>
      <StoryGrid
        stories={data}
        isLoading={isLoading}
        isError={isError}
        onViewStory={onViewStory}
        recentlyImportedId={recentlyImportedId}
        duplicatingStoryIds={duplicatingStoryIds}
        onDuplicateStory={handleDuplicate}
        exportingStoryIds={exportingStoryIds}
        onExportStory={handleExport}
      />
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        isSubmitting={createStoryMutation.isPending}
        errorMessage={errorMessage}
        onClose={handleCloseModal}
        onCreate={handleCreateStory}
      />
      <ImportOutlineModal
        isOpen={isImportOutlineOpen}
        onClose={closeImportOutline}
        onImportComplete={setRecentlyImportedId}
      />
    </main>
  );
}
