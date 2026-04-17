import { Button } from "flowbite-react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { CreateStoryModal } from "../components/dashboard/CreateStoryModal";
import { ImportOutlineModal } from "../components/dashboard/ImportOutlineModal";
import { StoryGrid } from "../components/dashboard/StoryGrid";
import {
  useCreateStoryMutation,
  useDuplicateStoryMutation,
  useStoriesQuery,
} from "../hooks/useStories";
import { useDashboardStore } from "../store/dashboardStore";
import { alert } from "../utils/alert";
import IconPlus from "~icons/mdi/plus";
import IconImport from "~icons/mdi/file-upload-outline";
import type { Story } from "../api/types";

export function DashboardPage() {
  const { data = [], isLoading, isError } = useStoriesQuery();
  const navigate = useNavigate();
  const createStoryMutation = useCreateStoryMutation();
  const duplicateStoryMutation = useDuplicateStoryMutation();
  const [recentlyImportedId, setRecentlyImportedId] = useState<string | null>(
    null,
  );
  const {
    isCreateStoryOpen,
    isImportOutlineOpen,
    duplicatingStoryIds,
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
