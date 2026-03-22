import { apiClient } from "../lib/apiClient";
import {
  toApiError,
  type Story,
  type StoryResponse,
  type StoriesResponse,
} from "./types";

export interface CreateStoryInput {
  title: string;
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
