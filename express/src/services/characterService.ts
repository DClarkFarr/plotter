import { ObjectId } from "mongodb";
import {
  createCharacter as createCharacterModel,
  CreateCharacterInput,
  deleteCharacterById as deleteCharacterByIdModel,
  getCharacterById,
  listCharacters,
  updateCharacterById as updateCharacterByIdModel,
  UpdateCharacterInput,
  CharacterDocument,
} from "../models/characters";
import { countScenesByPovCharacter } from "../models/scenes";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";

const assertStoryExists = async (storyId: string | ObjectId): Promise<void> => {
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
};

export const listCharactersForStory = async (
  storyId: string | ObjectId,
): Promise<CharacterDocument[]> => {
  await assertStoryExists(storyId);
  return listCharacters({ storyId });
};

export const createCharacterForStory = async (
  input: CreateCharacterInput,
): Promise<CharacterDocument> => {
  await assertStoryExists(input.storyId);

  return createCharacterModel({
    ...input,
    storyId: ensureObjectId(input.storyId, "storyId"),
  });
};

export const getCharacterForStory = async (
  storyId: string | ObjectId,
  characterId: string | ObjectId,
): Promise<CharacterDocument | null> => {
  await assertStoryExists(storyId);
  const character = await getCharacterById(characterId);
  if (!character) {
    return null;
  }

  const storyHex = ensureObjectId(storyId, "storyId").toHexString();
  return character.storyId.toHexString() === storyHex ? character : null;
};

export const updateCharacterForStory = async (
  storyId: string | ObjectId,
  characterId: string | ObjectId,
  updates: UpdateCharacterInput,
): Promise<CharacterDocument | null> => {
  await assertStoryExists(storyId);
  const existing = await getCharacterById(characterId);
  if (!existing) {
    return null;
  }

  const storyHex = ensureObjectId(storyId, "storyId").toHexString();
  if (existing.storyId.toHexString() !== storyHex) {
    return null;
  }

  return updateCharacterByIdModel(existing._id, updates);
};

export const deleteCharacterForStory = async (
  storyId: string | ObjectId,
  characterId: string | ObjectId,
): Promise<boolean> => {
  await assertStoryExists(storyId);
  const existing = await getCharacterById(characterId);
  if (!existing) {
    return false;
  }

  const storyHex = ensureObjectId(storyId, "storyId").toHexString();
  if (existing.storyId.toHexString() !== storyHex) {
    return false;
  }

  const usageCount = await countScenesByPovCharacter(existing._id);
  if (usageCount > 0) {
    throw new Error("Character is assigned to scenes");
  }

  return deleteCharacterByIdModel(existing._id);
};
