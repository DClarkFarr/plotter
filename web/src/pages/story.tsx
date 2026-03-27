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
import { PlotGrid } from "../components/plot/PlotGrid";
import { useEffect } from "react";
import { useSidebarStore } from "../store/sidebarStore";

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

  // const maxVerticalPosition =
  //   plots.reduce((max, plot) => {
  //     const sceneMax = plot.scenes.reduce(
  //       (sMax, scene) => Math.max(sMax, scene.verticalIndex),
  //       0,
  //     );
  //     return Math.max(max, sceneMax);
  //   }, 0) + 3;

  // const verticalStackSize = Math.max(5, maxVerticalPosition);

  useEffect(() => {
    /**
     * Subscribe story store to sidebar store for automatic open / close
     */

    const unsub = useStoryStore.subscribe((state, prevState) => {
      if (state.story && !prevState.story) {
        // Story was set, open sidebar
        useSidebarStore.setState({ isOpen: true });
      } else if (!state.story && prevState.story) {
        // Story was unset, close sidebar
        useSidebarStore.setState({ isOpen: false });
      }
    });
    return () => unsub();
  }, []);

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
        <PlotGrid
          storyId={storyId}
          plots={plots}
          plotIndex={0}
          cardSize={cardSize}
          cardDisplay={cardDisplay}
        />
      </div>
    </main>
  );
}
