import { Collection, ObjectId } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";
import {
  BaseModelBlueprint,
  createTimestamps,
  ensureObjectId,
  ModelBlueprint,
  ModelDocument,
  ModelInsertInput,
  touchTimestamps,
} from "./types";

export interface TagDefinition extends BaseModelBlueprint {
  name: string;
  color: string;
  variant: boolean;
  variants: string[];
  storyId: ObjectId;
}

export type TagBlueprint = ModelBlueprint<TagDefinition>;
export type TagDocument = ModelDocument<TagDefinition>;

export const getTagsCollection = (): Collection<TagDocument> =>
  getCollection<TagDocument>(COLLECTIONS.tags);

export const ensureTagIndexes = async (): Promise<void> => {
  const collection = getTagsCollection();
  await collection.createIndex({ storyId: 1 });
  await collection.createIndex({ storyId: 1, name: 1 }, { unique: true });
};

export interface CreateTagInput {
  name: string;
  color: string;
  variant: boolean;
  variants?: string[];
  storyId: string | ObjectId;
}

export const createTag = async (
  input: CreateTagInput,
): Promise<TagDocument> => {
  const collection = getTagsCollection();
  const storyId = ensureObjectId(input.storyId, "storyId");

  const payload: ModelInsertInput<TagDefinition> = {
    name: input.name,
    color: input.color,
    variant: input.variant,
    variants: input.variants ?? [],
    storyId,
    ...createTimestamps(),
  };

  const result = await collection.insertOne(payload as unknown as TagDocument);
  return { ...payload, _id: result.insertedId };
};

export interface ListTagsOptions {
  limit?: number;
  storyId?: string | ObjectId;
}

export const listTags = async (
  options: ListTagsOptions = {},
): Promise<TagDocument[]> => {
  const collection = getTagsCollection();
  const limit = options.limit ?? 50;
  const filter = options.storyId
    ? { storyId: ensureObjectId(options.storyId, "storyId") }
    : {};

  return collection.find(filter).limit(limit).toArray();
};

export const listTagsByIds = async (
  ids: Array<string | ObjectId>,
): Promise<TagDocument[]> => {
  const collection = getTagsCollection();
  const uniqueIds = Array.from(
    new Set(ids.map((id) => ensureObjectId(id, "tagId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return [];
  }

  return collection.find({ _id: { $in: uniqueIds } }).toArray();
};

export const getTagById = async (
  id: string | ObjectId,
): Promise<TagDocument | null> => {
  const collection = getTagsCollection();
  return collection.findOne({ _id: ensureObjectId(id, "tagId") });
};

export interface UpdateTagInput {
  name?: string;
  color?: string;
  variant?: boolean;
  variants?: string[];
  storyId?: string | ObjectId;
}

export const updateTagById = async (
  id: string | ObjectId,
  updates: UpdateTagInput,
): Promise<TagDocument | null> => {
  const collection = getTagsCollection();
  const tagId = ensureObjectId(id, "tagId");
  const updatePayload: Partial<TagDefinition> = {};

  if (updates.name !== undefined) {
    updatePayload.name = updates.name;
  }

  if (updates.color !== undefined) {
    updatePayload.color = updates.color;
  }

  if (updates.variant !== undefined) {
    updatePayload.variant = updates.variant;
  }

  if (updates.variants !== undefined) {
    updatePayload.variants = updates.variants;
  }

  if (updates.storyId) {
    updatePayload.storyId = ensureObjectId(updates.storyId, "storyId");
  }

  const result = await collection.findOneAndUpdate(
    { _id: tagId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result?.value ?? null;
};

export const deleteTagById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getTagsCollection();
  const result = await collection.deleteOne({
    _id: ensureObjectId(id, "tagId"),
  });

  return result.deletedCount === 1;
};
