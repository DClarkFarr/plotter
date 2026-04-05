import { ObjectId } from "mongodb";
import {
  createTag as createTagModel,
  CreateTagInput,
  deleteTagById as deleteTagByIdModel,
  getTagById,
  listTags,
  listTagsByStoryAndIds,
  TagDocument,
  updateTagById as updateTagByIdModel,
  UpdateTagInput,
} from "../models/tags";
import { countScenesByTagId, countScenesByTagVariant } from "../models/scenes";
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
  if (updates.variants) {
    const normalized = updates.variants.map((variant) => variant.trim());
    if (normalized.some((variant) => !variant)) {
      throw new ValidationError("variants", "Variant names must be non-empty");
    }

    const unique = Array.from(new Set(normalized));
    if (unique.length !== normalized.length) {
      throw new ValidationError("variants", "Variant names must be unique");
    }

    updates.variants = unique;
  }

  if (updates.storyId) {
    await assertStoryExists(updates.storyId);
  }

  return updateTagByIdModel(id, updates);
};

export const updateTagForStory = async (
  storyId: string | ObjectId,
  tagId: string | ObjectId,
  updates: UpdateTagInput,
): Promise<TagDocument | null> => {
  await assertStoryExists(storyId);

  const existing = await getTagById(tagId);
  if (!existing) {
    return null;
  }

  const storyHex =
    storyId instanceof ObjectId ? storyId.toHexString() : storyId.toString();
  if (existing.storyId.toHexString() !== storyHex) {
    return null;
  }

  return updateTagById(tagId, updates);
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

export interface ImportTagsInput {
  fromStoryId: string | ObjectId;
  toStoryId: string | ObjectId;
  tagIds: Array<string | ObjectId>;
}

export interface ImportTagsResult {
  createdTags: TagDocument[];
  skippedTagIds: string[];
}

export const importTagsBetweenStories = async (
  input: ImportTagsInput,
): Promise<ImportTagsResult> => {
  await assertStoryExists(input.fromStoryId);
  await assertStoryExists(input.toStoryId);

  const uniqueTagIds = Array.from(
    new Set(
      input.tagIds.map((id) => ensureObjectId(id, "tagId").toHexString()),
    ),
  ).map((value) => new ObjectId(value));

  if (uniqueTagIds.length === 0) {
    return { createdTags: [], skippedTagIds: [] };
  }

  const sourceTags = await listTagsByStoryAndIds(
    input.fromStoryId,
    uniqueTagIds,
  );

  if (sourceTags.length !== uniqueTagIds.length) {
    throw new ValidationError(
      "tagIds",
      "One or more tags were not found in the source story",
    );
  }

  const destinationTags = await listTags({ storyId: input.toStoryId });
  const existingNames = new Set(destinationTags.map((tag) => tag.name));
  const skippedTagIds: string[] = [];
  const createdTags: TagDocument[] = [];

  for (const tag of sourceTags) {
    if (existingNames.has(tag.name)) {
      skippedTagIds.push(tag._id.toHexString());
      continue;
    }

    const created = await createTagModel({
      name: tag.name,
      color: tag.color,
      variant: tag.variant,
      variants: tag.variants,
      storyId: input.toStoryId,
    });
    existingNames.add(tag.name);
    createdTags.push(created);
  }

  return { createdTags, skippedTagIds };
};

const normalizeVariantName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError("variant", "Variant name must be non-empty");
  }
  return trimmed;
};

export const addVariantToTag = async (
  storyId: string | ObjectId,
  tagId: string | ObjectId,
  variantName: string,
): Promise<TagDocument | null> => {
  await assertStoryExists(storyId);
  const existingTag = await getTagById(tagId);

  if (!existingTag) {
    return null;
  }

  const storyHex =
    storyId instanceof ObjectId ? storyId.toHexString() : storyId.toString();
  if (existingTag.storyId.toHexString() !== storyHex) {
    return null;
  }

  if (!existingTag.variant) {
    throw new ValidationError("variant", "Tag is not a variant");
  }

  const normalized = normalizeVariantName(variantName);
  if (existingTag.variants.includes(normalized)) {
    throw new ValidationError("variant", "Variant already exists");
  }

  return updateTagById(existingTag._id, {
    variants: [...existingTag.variants, normalized],
  });
};

export const deleteVariantFromTag = async (
  storyId: string | ObjectId,
  tagId: string | ObjectId,
  variantName: string,
): Promise<TagDocument | null> => {
  await assertStoryExists(storyId);
  const existingTag = await getTagById(tagId);

  if (!existingTag) {
    return null;
  }

  const storyHex =
    storyId instanceof ObjectId ? storyId.toHexString() : storyId.toString();
  if (existingTag.storyId.toHexString() !== storyHex) {
    return null;
  }

  const normalized = normalizeVariantName(variantName);
  if (!existingTag.variants.includes(normalized)) {
    throw new ValidationError("variant", "Variant not found");
  }

  const usageCount = await countScenesByTagVariant(existingTag._id, normalized);
  if (usageCount > 0) {
    throw new ValidationError("variant", "Variant is in use by scenes");
  }

  return updateTagById(existingTag._id, {
    variants: existingTag.variants.filter((variant) => variant !== normalized),
  });
};
