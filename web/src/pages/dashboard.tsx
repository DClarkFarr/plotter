import { Button } from "flowbite-react";
import { StoryGrid } from "../components/dashboard/StoryGrid";
import { useStoriesQuery } from "../hooks/useStories";

export function DashboardPage() {
  const { data = [], isLoading, isError } = useStoriesQuery();

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
        <Button color="dark" type="button">
          + story
        </Button>
      </header>
      <section className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <StoryGrid stories={data} isLoading={isLoading} isError={isError} />
      </section>
    </main>
  );
}
