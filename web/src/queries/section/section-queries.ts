import { useQuery } from "@tanstack/react-query";
import { listStorySections } from "../../api/stories";

export function useStorySectionsQuery(storyId: string) {
  return useQuery({
    queryKey: useStorySectionsQuery.queryKey(storyId),
    queryFn: () => listStorySections(storyId),
    enabled: Boolean(storyId),
    staleTime: 30 * 1000,
  });
}

useStorySectionsQuery.queryKey = (storyId: string) => [
  "story",
  storyId,
  "sections",
];
