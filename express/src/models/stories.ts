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
import { getUsersCollection } from "./users";

export type StoryRole = "owner" | "editor";

export interface StoryPermission {
  userId: ObjectId;
  role: StoryRole;
}

export interface StoryDefinition extends BaseModelBlueprint {
  title: string;
  description: string;
  users: StoryPermission[];
  deletedAt?: Date;
}

export type StoryBlueprint = ModelBlueprint<StoryDefinition>;
export type StoryDocument = ModelDocument<StoryDefinition>;

export const getStoriesCollection = (): Collection<StoryDocument> =>
  getCollection<StoryDocument>(COLLECTIONS.stories);

export const ensureStoryIndexes = async (): Promise<void> => {
  const collection = getStoriesCollection();
  await collection.createIndex({ "users.userId": 1 });
};

const normalizePermissions = (
  permissions: Array<{ userId: string | ObjectId; role: StoryRole }>,
): StoryPermission[] =>
  permissions.map((permission) => ({
    userId: ensureObjectId(permission.userId, "userId"),
    role: permission.role,
  }));

const assertHasOwner = (permissions: StoryPermission[]): void => {
  const hasOwner = permissions.some(
    (permission) => permission.role === "owner",
  );
  if (!hasOwner) {
    throw new Error("Story must include an owner permission");
  }
};

export const validateStoryPermissionsUsers = async (
  permissions: StoryPermission[],
): Promise<void> => {
  const collection = getUsersCollection();
  const ids = Array.from(
    new Set(permissions.map((permission) => permission.userId.toHexString())),
  ).map((value) => new ObjectId(value));

  if (ids.length === 0) {
    throw new Error("Story must include at least one user permission");
  }

  const count = await collection.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new Error("Story permissions include unknown users");
  }
};

const buildStoryFilter = (includeDeleted: boolean) =>
  includeDeleted ? {} : { deletedAt: { $exists: false } };

export interface ListStoriesOptions {
  includeDeleted?: boolean;
  limit?: number;
  userId?: string | ObjectId;
}

export const listStories = async (
  options: ListStoriesOptions = {},
): Promise<StoryDocument[]> => {
  const collection = getStoriesCollection();
  const limit = options.limit ?? 50;
  const filter: Record<string, unknown> = buildStoryFilter(
    options.includeDeleted ?? false,
  );

  if (options.userId) {
    filter["users.userId"] = ensureObjectId(options.userId, "userId");
  }

  return collection.find(filter).limit(limit).toArray();
};

export const getStoryById = async (
  id: string | ObjectId,
  options: { includeDeleted?: boolean } = {},
): Promise<StoryDocument | null> => {
  const collection = getStoriesCollection();
  const filter = {
    _id: ensureObjectId(id, "storyId"),
    ...buildStoryFilter(options.includeDeleted ?? false),
  };

  return collection.findOne(filter);
};

export interface CreateStoryInput {
  title: string;
  description: string;
  users: Array<{ userId: string | ObjectId; role: StoryRole }>;
}

export const createStory = async (
  input: CreateStoryInput,
): Promise<StoryDocument> => {
  const collection = getStoriesCollection();
  const permissions = normalizePermissions(input.users);

  assertHasOwner(permissions);
  await validateStoryPermissionsUsers(permissions);

  const payload: ModelInsertInput<StoryDefinition> = {
    title: input.title,
    description: input.description,
    users: permissions,
    ...createTimestamps(),
  };

  const result = await collection.insertOne(
    payload as unknown as StoryDocument,
  );
  return { ...payload, _id: result.insertedId };
};

export interface UpdateStoryInput {
  title?: string;
  description?: string;
  users?: Array<{ userId: string | ObjectId; role: StoryRole }>;
}

export const updateStoryById = async (
  id: string | ObjectId,
  updates: UpdateStoryInput,
): Promise<StoryDocument | null> => {
  const collection = getStoriesCollection();
  const storyId = ensureObjectId(id, "storyId");
  const updatePayload: Partial<StoryDefinition> = {};

  if (updates.title !== undefined) {
    updatePayload.title = updates.title;
  }

  if (updates.description !== undefined) {
    updatePayload.description = updates.description;
  }

  if (updates.users) {
    const permissions = normalizePermissions(updates.users);
    assertHasOwner(permissions);
    await validateStoryPermissionsUsers(permissions);
    updatePayload.users = permissions;
  }

  const result = await collection.findOneAndUpdate(
    { _id: storyId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result?.value ?? null;
};

export const softDeleteStoryById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getStoriesCollection();
  const result = await collection.updateOne(
    { _id: ensureObjectId(id, "storyId") },
    { $set: { deletedAt: new Date(), ...touchTimestamps() } },
  );

  return result.matchedCount === 1;
};

export const restoreStoryById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getStoriesCollection();
  const result = await collection.updateOne(
    { _id: ensureObjectId(id, "storyId") },
    { $unset: { deletedAt: "" }, $set: { ...touchTimestamps() } },
  );

  return result.matchedCount === 1;
};
