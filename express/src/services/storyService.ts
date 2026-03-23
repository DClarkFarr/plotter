import { ObjectId } from "mongodb";
import {
  assertHasOwner,
  createStory as createStoryModel,
  CreateStoryInput,
  getStoryById,
  listStories,
  normalizeStoryPermissions,
  StoryDocument,
  StoryPermission,
  updateStoryById as updateStoryByIdModel,
  UpdateStoryInput,
} from "../models/stories";
import { listUsersByIds } from "../models/users";
import {
  countPlotsByStoryId,
  listPlotIdsByStoryId,
  listPlots,
} from "../models/plots";
import { countScenesByPlotIds, listScenesByPlotIds } from "../models/scenes";
import { listTags } from "../models/tags";
import { AuthError } from "./authService";

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

export interface CreateStoryForOwnerInput {
  title: string;
  ownerId: string | ObjectId;
  description?: string;
}

export const createStoryForOwner = async (
  input: CreateStoryForOwnerInput,
): Promise<StoryDocument> =>
  createStory({
    title: input.title,
    description: input.description ?? "",
    users: [{ userId: input.ownerId, role: "owner" }],
  });

export const listStoriesForUser = async (
  userId: string | ObjectId,
): Promise<StoryDocument[]> => listStories({ userId });

export const getStoryForUser = async (
  storyId: string | ObjectId,
  userId: string | ObjectId,
): Promise<StoryDocument | null> => {
  const story = await getStoryById(storyId);
  if (!story) {
    return null;
  }

  const userHex =
    userId instanceof ObjectId ? userId.toHexString() : userId.toString();
  const hasAccess = story.users.some(
    (permission) => permission.userId.toHexString() === userHex,
  );

  if (!hasAccess) {
    throw new AuthError("Forbidden", 403);
  }

  return story;
};

export interface StoryStats {
  plots: number;
  scenes: number;
}

export const getStoryStats = async (
  storyId: string | ObjectId,
): Promise<StoryStats> => {
  const [plots, plotIds] = await Promise.all([
    countPlotsByStoryId(storyId),
    listPlotIdsByStoryId(storyId),
  ]);

  const scenes = await countScenesByPlotIds(plotIds);

  return { plots, scenes };
};

export const listStoryTagsForUser = async (
  storyId: string | ObjectId,
  userId: string | ObjectId,
) => {
  await getStoryForUser(storyId, userId);
  return listTags({ storyId });
};

export const listStoryPlotsWithScenesForUser = async (
  storyId: string | ObjectId,
  userId: string | ObjectId,
) => {
  await getStoryForUser(storyId, userId);
  const plots = await listPlots({ storyId });
  const scenes = await listScenesByPlotIds(plots.map((plot) => plot._id));
  const scenesByPlot = new Map<string, typeof scenes>();

  for (const scene of scenes) {
    const plotKey = scene.plotId.toHexString();
    const existing = scenesByPlot.get(plotKey) ?? [];
    existing.push(scene);
    scenesByPlot.set(plotKey, existing);
  }

  return plots.map((plot) => ({
    ...plot,
    scenes: scenesByPlot.get(plot._id.toHexString()) ?? [],
  }));
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
