import { useQuery } from "@tanstack/react-query";
import {
  getStory,
  listStoryCharacters,
  listStoryPlots,
  listStoryTags,
} from "../../api/stories";

export function useStoryQuery(storyId: string) {
  return useQuery({
    queryKey: useStoryQuery.queryKey(storyId),
    queryFn: () => getStory(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

useStoryQuery.queryKey = (storyId: string) => ["story", storyId];

export function useStoryTagsQuery(storyId: string) {
  return useQuery({
    queryKey: useStoryTagsQuery.queryKey(storyId),
    queryFn: () => listStoryTags(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

useStoryTagsQuery.queryKey = (storyId: string) => ["story", storyId, "tags"];

export function useStoryCharactersQuery(storyId: string) {
  return useQuery({
    queryKey: useStoryCharactersQuery.queryKey(storyId),
    queryFn: () => listStoryCharacters(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

useStoryCharactersQuery.queryKey = (storyId: string) => [
  "story",
  storyId,
  "characters",
];

export function useStoryPlotsQuery(storyId: string) {
  return useQuery({
    queryKey: useStoryPlotsQuery.queryKey(storyId),
    queryFn: () => listStoryPlots(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

useStoryPlotsQuery.queryKey = (storyId: string) => ["story", storyId, "plots"];
