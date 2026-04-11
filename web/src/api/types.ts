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
  characters: number;
  tags: number;
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
  characteristics: CharacteristicFields | null;
  customCharacteristics: CharacterCustomAttribute[];
  lists: CharacterList[];
}

export interface CharacteristicFields {
  description?: string;
  history?: string;
  height?: string;
  weight?: string;
  age?: string;
  hair?: string;
  eyeColor?: string;
  mantra?: string;
  skinColor?: string;
  build?: string;
}

export interface CharacterCustomAttribute {
  label: string;
  value: string;
}

export interface CharacterList {
  label: string;
  items: string[];
}

export interface CreateCharacterInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  characteristics?: CharacteristicFields;
  customCharacteristics?: CharacterCustomAttribute[];
  lists?: CharacterList[];
}

export interface UpdateCharacterInput {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  characteristics?: CharacteristicFields;
  customCharacteristics?: CharacterCustomAttribute[];
  lists?: CharacterList[];
}

export interface DeleteCharacterInput {
  storyId: string;
  characterId: string;
}

export interface ImportCharactersInput {
  fromStoryId: string;
  toStoryId: string;
  characterIds: string[];
}

export type ImportOutlineMode = "preview" | "create";

export interface ImportOutlineInput {
  mode: ImportOutlineMode;
  file: File;
  storyName?: string;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface ImportTagsInput {
  fromStoryId: string;
  toStoryId: string;
  tagIds: string[];
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  variant?: boolean;
  variants?: string[];
}

export interface SceneTodoItem {
  text: string;
  isDone: boolean;
}

export interface SceneSnippet {
  label: string;
  text: string;
}

export interface DeleteTagInput {
  storyId: string;
  tagId: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  plotId: string;
  tags: string[];
  tagVariants?: SceneTagVariant[];
  todo: SceneTodoItem[];
  snippets: SceneSnippet[];
  scene: string | null;
  verticalIndex: number;
  pov: string | null;
}

export interface SceneTagVariant {
  tagId: string;
  variant: string;
}

export type SectionType = "act" | "section";

export interface Section {
  id: string;
  storyId: string;
  title: string;
  verticalIndex: number;
  type: SectionType;
  description?: string | null;
}

export interface ShiftedResources {
  scenes: Scene[];
  sections: Section[];
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
  plotId: string;
  scene?: string | null;
  tags?: string[];
  tagVariants?: SceneTagVariant[];
  todo?: SceneTodoItem[];
  snippets?: SceneSnippet[];
  verticalIndex: number;
  pov?: string | null;
}

export interface UpdateSceneInput {
  title?: string;
  description?: string;
  scene?: string | null;
  tags?: string[];
  tagVariants?: SceneTagVariant[];
  todo?: SceneTodoItem[];
  snippets?: SceneSnippet[];
  verticalIndex?: number;
  pov?: string | null;
}

export interface CreateSectionInput {
  title: string;
  verticalIndex: number;
  type: SectionType;
  description?: string;
}

export interface UpdateSectionInput {
  title?: string;
  verticalIndex?: number;
  type?: SectionType;
  description?: string;
}

export interface StoryGridShiftInput {
  startIndex: number;
  shift: number;
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

export interface ImportTagsResponse {
  createdTags: Tag[];
  skippedTagIds: string[];
}

export interface ImportCharactersResponse {
  createdCharacters: Character[];
  skippedCharacterIds: string[];
}

export interface ImportOutlineResponse {
  mode: ImportOutlineMode;
  storyName: string;
  summary: string;
  message?: string | null;
  storyId?: string | null;
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
  shiftedResources?: ShiftedResources;
}

export interface SectionsResponse {
  sections: Section[];
}

export interface SectionResponse {
  section: Section;
  shiftedResources?: ShiftedResources;
}

export interface StoryGridShiftResponse {
  shiftedResources?: ShiftedResources;
}

export interface DeleteSceneResponse {
  deleted: true;
  shiftedResources?: ShiftedResources;
}

export interface DeleteSectionResponse {
  deleted: true;
  shiftedResources?: ShiftedResources;
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
