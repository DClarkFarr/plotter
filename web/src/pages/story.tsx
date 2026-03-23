import { Badge, Card } from "flowbite-react";
import { Portal } from "../components/helpers/Portal";
import { StoryHeading } from "../components/story/StoryHeading";
import { StoryLoading } from "../components/story/StoryLoading";
import {
  useStoryPlotsQuery,
  useStoryQuery,
  useStoryTagsQuery,
} from "../hooks/useStory";
import { useStoryStore } from "../store/storyStore";
import { useParams } from "@tanstack/react-router";
import IconLabelMultiple from "~icons/mdi/label-multiple";

export function StoryPage() {
  const { storyId } = useParams({
    from: "/dashboard/story/$storyId",
  });
  const storyQuery = useStoryQuery(storyId);
  const tagsQuery = useStoryTagsQuery(storyId);
  const plotsQuery = useStoryPlotsQuery(storyId);
  const { cardDisplay, cardSize, setCardDisplay, setCardSize } =
    useStoryStore();

  const isLoading =
    storyQuery.isLoading || tagsQuery.isLoading || plotsQuery.isLoading;
  const error = storyQuery.error || tagsQuery.error || plotsQuery.error;

  if (isLoading) {
    return (
      <main className="h-full p-6">
        <StoryLoading />
      </main>
    );
  }

  if (error || !storyQuery.data) {
    return (
      <main className="h-full p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load this story. Please check the link and try again.
        </div>
      </main>
    );
  }

  const story = storyQuery.data;
  const plots = plotsQuery.data ?? [];

  const cardSizeClass =
    cardSize === "sm" ? "p-2" : cardSize === "lg" ? "p-6" : "p-4";

  return (
    <main className="h-full p-6">
      <Portal wrapperId="dashboard-topbar">
        <div className="story-controls flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              View
            </span>
            <button
              type="button"
              onClick={() => setCardDisplay("grid")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cardDisplay === "grid"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setCardDisplay("list")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cardDisplay === "list"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              List
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Card Size
            </span>
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setCardSize(size)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  cardSize === size
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Tags
            </span>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600`}
            >
              <IconLabelMultiple className="text-lg text-slate-600" />
            </button>
          </div>
        </div>
      </Portal>

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Story Details
        </p>
        <StoryHeading
          storyId={storyId}
          title={story.title}
          description={story.description}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Plots
        </h2>
        {plots.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No plots yet.</p>
        ) : (
          <div
            className={`mt-3 grid gap-4 ${
              cardDisplay === "list" ? "grid-cols-1" : "md:grid-cols-2"
            }`}
          >
            {plots.map((plot) => (
              <Card key={plot.id} className={`shadow-sm ${cardSizeClass}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">
                      {plot.title}
                    </h3>
                    <Badge color="light">{plot.scenes.length} scenes</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {plot.description || "No description"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
