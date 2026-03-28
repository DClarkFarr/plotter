import { ObjectId } from "mongodb";
import {
  createTag as createTagModel,
  CreateTagInput,
  deleteTagById as deleteTagByIdModel,
  getTagById,
  TagDocument,
  updateTagById as updateTagByIdModel,
  UpdateTagInput,
} from "../models/tags";
import { countScenesByTagId } from "../models/scenes";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";
import { ValidationError } from "./authService";

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

export const deleteTagById = async (
  storyId: string | ObjectId,
  tagId: string | ObjectId,
): Promise<boolean> => {
  await assertStoryExists(storyId);

  const normalizedStoryId = ensureObjectId(storyId, "storyId");
  const existingTag = await getTagById(tagId);

  if (!existingTag) {
    return false;
  }

  if (existingTag.storyId.toHexString() !== normalizedStoryId.toHexString()) {
    return false;
  }

  const usageCount = await countScenesByTagId(existingTag._id);
  if (usageCount > 0) {
    throw new ValidationError("tagId", "Tag is in use by scenes");
  }

  return deleteTagByIdModel(existingTag._id);
};
