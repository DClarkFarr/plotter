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
