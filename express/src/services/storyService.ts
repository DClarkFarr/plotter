import { ObjectId } from "mongodb";
import {
  assertHasOwner,
  createStory as createStoryModel,
  CreateStoryInput,
  normalizeStoryPermissions,
  StoryDocument,
  StoryPermission,
  updateStoryById as updateStoryByIdModel,
  UpdateStoryInput,
} from "../models/stories";
import { listUsersByIds } from "../models/users";

const validateStoryPermissionsUsers = async (
  permissions: StoryPermission[],
): Promise<void> => {
  if (permissions.length === 0) {
    throw new Error("Story must include at least one user permission");
  }

  const ids = Array.from(
    new Set(permissions.map((permission) => permission.userId.toHexString())),
  );
  const users = await listUsersByIds(ids);

  if (users.length !== ids.length) {
    throw new Error("Story permissions include unknown users");
  }
};

export const createStory = async (
  input: CreateStoryInput,
): Promise<StoryDocument> => {
  const permissions = normalizeStoryPermissions(input.users);

  assertHasOwner(permissions);
  await validateStoryPermissionsUsers(permissions);

  return createStoryModel({
    ...input,
    users: permissions,
  });
};

export const updateStoryById = async (
  id: string | ObjectId,
  { users: rawUsers, ...updates }: UpdateStoryInput,
): Promise<StoryDocument | null> => {
  let normalizedUsers: StoryPermission[] | undefined;

  const toSet: Partial<StoryDocument> = { ...updates };
  if (rawUsers) {
    normalizedUsers = normalizeStoryPermissions(rawUsers);
    assertHasOwner(normalizedUsers);
    await validateStoryPermissionsUsers(normalizedUsers);

    toSet.users = normalizedUsers;
  }

  return updateStoryByIdModel(id, toSet);
};
