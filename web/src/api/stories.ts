import { apiClient } from "../lib/apiClient";
import {
  toApiError,
  type Plot,
  type PlotsResponse,
  type Tag,
  type TagsResponse,
  type Story,
  type StoryResponse,
  type StoriesResponse,
} from "./types";

export interface CreateStoryInput {
  title: string;
}

export interface UpdateStoryInput {
  title?: string;
  description?: string;
}

export async function listStories(): Promise<Story[]> {
  try {
    const { data } = await apiClient.get<StoriesResponse>("/stories");
    return data.stories;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createStory(input: CreateStoryInput): Promise<Story> {
  try {
    const { data } = await apiClient.post<StoryResponse>("/stories", input);
    return data.story;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getStory(storyId: string): Promise<Story> {
  try {
    const { data } = await apiClient.get<StoryResponse>(`/stories/${storyId}`);
    return data.story;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function listStoryTags(storyId: string): Promise<Tag[]> {
  try {
    const { data } = await apiClient.get<TagsResponse>(
      `/stories/${storyId}/tags`,
    );
    return data.tags;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function listStoryPlots(storyId: string): Promise<Plot[]> {
  try {
    const { data } = await apiClient.get<PlotsResponse>(
      `/stories/${storyId}/plots`,
    );
    return data.plots;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateStory(
  storyId: string,
  input: UpdateStoryInput,
): Promise<Story> {
  try {
    const { data } = await apiClient.patch<StoryResponse>(
      `/stories/${storyId}`,
      input,
    );
    return data.story;
  } catch (err) {
    throw toApiError(err);
  }
}
