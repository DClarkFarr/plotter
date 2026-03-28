import type { AxiosError } from "axios";
import axios from "axios";

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface StoryStats {
  plots: number;
  scenes: number;
}

export interface Story {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  stats: StoryStats;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  variant: boolean;
  variants: string[];
  storyId: string;
}

export interface Character {
  id: string;
  storyId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
}

export interface CreateCharacterInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface SceneTodoItem {
  text: string;
  isDone: boolean;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  plotId: string;
  tags: string[];
  todo: SceneTodoItem[];
  scene: string | null;
  verticalIndex: number;
  pov: string | null;
}

export interface Plot {
  id: string;
  title: string;
  description: string;
  color: string;
  storyId: string;
  horizontalIndex: number;
  scenes: Scene[];
}

export interface CreatePlotInput {
  title: string;
  description: string | undefined;
  color: string;
  horizontalIndex: number;
}

export interface UpdatePlotInput {
  title?: string;
  description?: string;
  color?: string;
  horizontalIndex?: number;
}

export interface CreateSceneInput {
  title: string;
  description: string;
  scene?: string | null;
  tags?: string[];
  todo?: SceneTodoItem[];
  verticalIndex: number;
  pov?: string | null;
}

export interface UpdateSceneInput {
  title?: string;
  description?: string;
  scene?: string | null;
  tags?: string[];
  todo?: SceneTodoItem[];
  verticalIndex?: number;
  pov?: string | null;
}

// ─── Response Envelopes ───────────────────────────────────────────────────────

export interface AuthUserResponse {
  user: AuthUser;
}

export interface StoryResponse {
  story: Story;
}

export interface StoriesResponse {
  stories: Story[];
}

export interface TagsResponse {
  tags: Tag[];
}

export interface CharactersResponse {
  characters: Character[];
}

export interface CharacterResponse {
  character: Character;
}

export interface TagResponse {
  tag: Tag;
}

export interface PlotsResponse {
  plots: Plot[];
}

export interface PlotResponse {
  plot: Plot;
}

export interface SceneResponse {
  scene: Scene;
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}

// ─── Error Class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly serverMessage: string;

  constructor(status: number, serverMessage: string) {
    super(serverMessage);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// ─── Axios Error Normaliser ───────────────────────────────────────────────────

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    const status = axiosErr.response?.status ?? 0;
    const message =
      axiosErr.response?.data?.error ?? axiosErr.message ?? "Network error";
    return new ApiError(status, message);
  }
  if (err instanceof ApiError) {
    return err;
  }
  return new ApiError(0, "Unexpected error");
}
