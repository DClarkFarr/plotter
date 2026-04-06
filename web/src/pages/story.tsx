import { Portal } from "../components/helpers/Portal";
import { StoryHeading } from "../components/story/StoryHeading";
import { StoryLoading } from "../components/story/StoryLoading";
import { StoryFiltersMenu } from "../components/story/StoryFiltersMenu";
import { StoryFilterTextModal } from "../components/story/StoryFilterTextModal";

import { useStoryStore } from "../store/storyStore";
import { useParams } from "@tanstack/react-router";
import { PlotGrid } from "../components/plot/PlotGrid";
import { ListView } from "../components/story/ListView";
import { useState } from "react";

import IconViewGrid from "~icons/mdi/view-grid";
import IconMenu from "~icons/mdi/menu";
import IconAccountGroup from "~icons/mdi/account-group";
import IconTag from "~icons/mdi/tag";
import { Tooltip } from "flowbite-react";
import {
  useStoryCharactersQuery,
  useStoryPlotsQuery,
  useStoryQuery,
  useStoryTagsQuery,
} from "../queries/story/story-queries";
import { useSidebarStore } from "../store/sidebarStore";
import { CharacterModal } from "../components/character/CharacterModal";

export function StoryPage() {
  const { storyId } = useParams({
    from: "/dashboard/story/$storyId",
  });
  const storyQuery = useStoryQuery(storyId);
  const tagsQuery = useStoryTagsQuery(storyId);
  const plotsQuery = useStoryPlotsQuery(storyId);
  const charactersQuery = useStoryCharactersQuery(storyId);
  const { cardDisplay, cardSize, setCardDisplay, setCardSize } =
    useStoryStore();
  const addFilter = useStoryStore((state) => state.addFilter);
  const addSidebarView = useSidebarStore((state) => state.addSidebarView);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const [isCustomTextOpen, setIsCustomTextOpen] = useState(false);

  const story = storyQuery.data;
  const plots = plotsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const characters = charactersQuery.data ?? [];

  const isLoading =
    storyQuery.isLoading ||
    tagsQuery.isLoading ||
    plotsQuery.isLoading ||
    charactersQuery.isLoading;
  const error =
    storyQuery.error ||
    tagsQuery.error ||
    plotsQuery.error ||
    charactersQuery.error;

  if (isLoading) {
    return (
      <main className="h-full p-6">
        <StoryLoading />
      </main>
    );
  }

  if (error || !story) {
    return (
      <main className="h-full p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load this story. Please check the link and try again.
        </div>
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
          {cardDisplay === "grid" && (
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
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Filters
            </span>
            <StoryFiltersMenu
              tags={tags}
              plots={plots}
              characters={characters}
              onOpenCustomText={() => setIsCustomTextOpen(true)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Assets
            </span>
            <div className="button-group">
              <Tooltip content="Manage characters">
                <button
                  type="button"
                  onClick={() => {
                    addSidebarView("character");
                    openSidebar();
                  }}
                  className="button px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600"
                >
                  <IconAccountGroup className="text-sm" />
                </button>
              </Tooltip>
              <Tooltip content="Manage tags">
                <button
                  type="button"
                  onClick={() => {
                    addSidebarView("tag");
                    openSidebar();
                  }}
                  className="button px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600"
                >
                  <IconTag className="text-sm" />
                </button>
              </Tooltip>
            </div>
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

      <div className="plots-wrapper bg-gray-100">
        {cardDisplay === "grid" ? (
          <PlotGrid storyId={storyId} plots={plots} />
        ) : (
          <ListView storyId={storyId} plots={plots} />
        )}
      </div>
      <CharacterModal />
      <StoryFilterTextModal
        isOpen={isCustomTextOpen}
        onClose={() => setIsCustomTextOpen(false)}
        onSubmit={(value) => {
          addFilter({ type: "search", value1: value });
          setIsCustomTextOpen(false);
        }}
      />
    </main>
  );
}
