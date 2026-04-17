import { ObjectId } from "mongodb";
import { getStoryById } from "../models/stories";
import { duplicateStory } from "../models/stories";
import { duplicateTagsByStory } from "../models/tags";
import { duplicateCharactersByStory } from "../models/characters";
import { duplicateColorsByStory } from "../models/colors";
import { duplicatePlotsByStory, listPlotIdsByStoryId } from "../models/plots";
import { duplicateScenesByPlots } from "../models/scenes";
import { duplicateSectionsByStory } from "../models/sections";
import { getClient } from "../utils/mongo";
import type { ClientSession } from "mongodb";
import type { StoryDocument } from "../models/stories";

const runDuplication = async (
  sourceStoryId: string | ObjectId,
  ownerId: string | ObjectId,
  session?: ClientSession,
): Promise<StoryDocument> => {
  // 1. Duplicate the story record
  const newStory = await duplicateStory(sourceStoryId, ownerId, session);
  const newStoryId = newStory._id;

  // 2. Duplicate tags → tagMap (needed by scenes)
  const tagMap = await duplicateTagsByStory(sourceStoryId, newStoryId, session);

  // 3. Duplicate characters → charMap (needed by scene pov)
  const charMap = await duplicateCharactersByStory(
    sourceStoryId,
    newStoryId,
    session,
  );

  // 4. Duplicate colors (no downstream consumers)
  await duplicateColorsByStory(sourceStoryId, newStoryId, session);

  // 5. Duplicate plots → plotMap (needed by scenes)
  const plotMap = await duplicatePlotsByStory(
    sourceStoryId,
    newStoryId,
    session,
  );

  // 6. Duplicate scenes with remapped IDs
  const sourcePlotIds = await listPlotIdsByStoryId(sourceStoryId);
  await duplicateScenesByPlots(
    sourcePlotIds,
    plotMap,
    tagMap,
    charMap,
    session,
  );

  // 7. Duplicate sections (standalone, no remapping needed)
  await duplicateSectionsByStory(sourceStoryId, newStoryId, session);

  return newStory;
};

export const duplicateStoryForOwner = async (
  sourceStoryId: string | ObjectId,
  ownerId: string | ObjectId,
): Promise<StoryDocument> => {
  const source = await getStoryById(sourceStoryId);
  if (!source) {
    throw new Error("Story not found");
  }

  const client = getClient();
  const session = client.startSession();

  try {
    let newStory: StoryDocument | null = null;

    try {
      await session.withTransaction(async () => {
        newStory = await runDuplication(sourceStoryId, ownerId, session);
      });
    } catch (err: unknown) {
      // Standalone MongoDB instances don't support transactions.
      // Fall back to running without a session (no atomicity guarantee).
      const isTransactionUnsupported =
        err instanceof Error &&
        err.message.includes("Transaction numbers are only allowed");

      if (!isTransactionUnsupported) {
        throw err;
      }

      newStory = await runDuplication(sourceStoryId, ownerId);
    }

    if (!newStory) {
      throw new Error("Duplication failed");
    }

    return newStory;
  } finally {
    await session.endSession();
  }
};
