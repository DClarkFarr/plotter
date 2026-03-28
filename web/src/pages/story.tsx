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
import { PlotGrid } from "../components/plot/PlotGrid";

import IconViewGrid from "~icons/mdi/view-grid";
import IconMenu from "~icons/mdi/menu";
import IconFilter from "~icons/mdi/filter";
import { Tooltip } from "flowbite-react";

export function StoryPage() {
  const { storyId } = useParams({
    from: "/dashboard/story/$storyId",
  });
  const storyQuery = useStoryQuery(storyId);
  const tagsQuery = useStoryTagsQuery(storyId);
  const plotsQuery = useStoryPlotsQuery(storyId);
  const { cardDisplay, cardSize, setCardDisplay, setCardSize } =
    useStoryStore();

  const story = storyQuery.data;
  const plots = plotsQuery.data ?? [];

  const isLoading =
    storyQuery.isLoading || tagsQuery.isLoading || plotsQuery.isLoading;
  const error = storyQuery.error || tagsQuery.error || plotsQuery.error;

  if (error || !story) {
    return (
      <main className="h-full p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load this story. Please check the link and try again.
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="h-full p-6">
        <StoryLoading />
      </main>
    );
  }

  return (
    <main className="page--story min-h-full w-full flex flex-col gap-6">
      <Portal wrapperId="dashboard-topbar">
        <div className="story-controls flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              View
            </span>

            <div className="button-group">
              <Tooltip content="Grid view">
                <button
                  type="button"
                  onClick={() => setCardDisplay("grid")}
                  className={`button px-3 py-1 text-xs font-semibold ${
                    cardDisplay === "grid"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <IconViewGrid className="text-sm" />
                </button>
              </Tooltip>
              <Tooltip content="List view">
                <button
                  type="button"
                  onClick={() => setCardDisplay("list")}
                  className={`button px-3 py-1 text-xs font-semibold ${
                    cardDisplay === "list"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <IconMenu className="text-sm" />
                </button>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Card Size
            </span>
            <div className="button-group">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Filters
            </span>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600`}
            >
              <IconFilter className="text-base text-slate-600" />
            </button>
          </div>
        </div>
      </Portal>

      <div className="p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Story Details
        </p>
        <StoryHeading
          storyId={storyId}
          title={story?.title}
          description={story?.description}
        />
      </div>

      <h2 className="text-sm mb-3 px-6 font-semibold uppercase tracking-[0.2em] text-slate-400">
        Plots
      </h2>

      <div className="plots-wrapper bg-gray-100">
        <PlotGrid storyId={storyId} plots={plots} plotIndex={0} />
      </div>
    </main>
  );
}
