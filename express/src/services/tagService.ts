import { ObjectId } from "mongodb";
import {
  createTag as createTagModel,
  CreateTagInput,
  TagDocument,
  updateTagById as updateTagByIdModel,
  UpdateTagInput,
} from "../models/tags";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";

const assertStoryExists = async (storyId: string | ObjectId): Promise<void> => {
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
};

export const createTag = async (
  input: CreateTagInput,
): Promise<TagDocument> => {
  await assertStoryExists(input.storyId);

  return createTagModel({
    ...input,
    storyId: ensureObjectId(input.storyId, "storyId"),
  });
};

export const updateTagById = async (
  id: string | ObjectId,
  updates: UpdateTagInput,
): Promise<TagDocument | null> => {
  if (updates.storyId) {
    await assertStoryExists(updates.storyId);
  }

  return updateTagByIdModel(id, updates);
};
