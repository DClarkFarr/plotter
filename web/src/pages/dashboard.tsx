import { Button } from "flowbite-react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CreateStoryModal } from "../components/dashboard/CreateStoryModal";
import { StoryGrid } from "../components/dashboard/StoryGrid";
import { useCreateStoryMutation, useStoriesQuery } from "../hooks/useStories";
import { useDashboardStore } from "../store/dashboardStore";
import IconPlus from "~icons/mdi/plus";

export function DashboardPage() {
  const { data = [], isLoading, isError } = useStoriesQuery();
  const navigate = useNavigate();
  const createStoryMutation = useCreateStoryMutation();
  const { isCreateStoryOpen, openCreateStory, closeCreateStory } =
    useDashboardStore();

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

  return (
    <main className="flex h-full flex-col gap-6 px-6 py-6 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Your stories
          </p>
          <h1 className="font-serif text-2xl font-semibold text-slate-900">
            Dashboard
          </h1>
        </div>
        <Button color="dark" type="button" onClick={openCreateStory}>
          <IconPlus className="mr-2" /> Story
        </Button>
      </header>
      <section className="overflow-auto min-h-[400px] rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <StoryGrid stories={data} isLoading={isLoading} isError={isError} />
      </section>
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        isSubmitting={createStoryMutation.isPending}
        errorMessage={errorMessage}
        onClose={handleCloseModal}
        onCreate={handleCreateStory}
      />
    </main>
  );
}
