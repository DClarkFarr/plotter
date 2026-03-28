import { apiClient } from "../lib/apiClient";
import {
  toApiError,
  type CreateSceneInput,
  type CreateTagInput,
  type CreatePlotInput,
  type Plot,
  type PlotResponse,
  type PlotsResponse,
  type Scene,
  type SceneResponse,
  type Tag,
  type TagResponse,
  type TagsResponse,
  type Story,
  type StoryResponse,
  type StoriesResponse,
  type UpdateSceneInput,
  type UpdatePlotInput,
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

export async function createTag(
  storyId: string,
  input: CreateTagInput,
): Promise<Tag> {
  try {
    const { data } = await apiClient.post<TagResponse>(
      `/stories/${storyId}/tags`,
      input,
    );
    return data.tag;
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

export async function createPlot(
  storyId: string,
  input: CreatePlotInput,
): Promise<Plot> {
  try {
    const { data } = await apiClient.post<PlotResponse>(
      `/stories/${storyId}/plots`,
      input,
    );
    return data.plot;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updatePlot(
  storyId: string,
  plotId: string,
  input: UpdatePlotInput,
): Promise<Plot> {
  try {
    const { data } = await apiClient.patch<PlotResponse>(
      `/stories/${storyId}/plots/${plotId}`,
      input,
    );
    return data.plot;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createScene(
  storyId: string,
  plotId: string,
  input: CreateSceneInput,
): Promise<Scene> {
  try {
    const { data } = await apiClient.post<SceneResponse>(
      `/stories/${storyId}/plots/${plotId}/scenes`,
      input,
    );
    return data.scene;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateScene(
  storyId: string,
  sceneId: string,
  input: UpdateSceneInput,
): Promise<Scene> {
  try {
    const { data } = await apiClient.patch<SceneResponse>(
      `/stories/${storyId}/scenes/${sceneId}`,
      input,
    );
    return data.scene;
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
