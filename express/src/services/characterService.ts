import { ObjectId } from "mongodb";
import {
  createCharacter as createCharacterModel,
  CreateCharacterInput,
  getCharacterById,
  listCharacters,
  CharacterDocument,
} from "../models/characters";
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
