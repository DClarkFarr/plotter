import { ObjectId } from "mongodb";
import {
  createCharacter as createCharacterModel,
  CreateCharacterInput,
  deleteCharacterById as deleteCharacterByIdModel,
  getCharacterById,
  listCharacters,
  listCharactersByStoryAndIds,
  updateCharacterById as updateCharacterByIdModel,
  UpdateCharacterInput,
  CharacterDocument,
} from "../models/characters";
import { countScenesByPovCharacter } from "../models/scenes";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";
import { ValidationError } from "./authService";

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

export interface ImportCharactersInput {
  fromStoryId: string | ObjectId;
  toStoryId: string | ObjectId;
  characterIds: Array<string | ObjectId>;
}

export interface ImportCharactersResult {
  createdCharacters: CharacterDocument[];
  skippedCharacterIds: string[];
}

export const importCharactersBetweenStories = async (
  input: ImportCharactersInput,
): Promise<ImportCharactersResult> => {
  await assertStoryExists(input.fromStoryId);
  await assertStoryExists(input.toStoryId);

  const uniqueCharacterIds = Array.from(
    new Set(
      input.characterIds.map((id) =>
        ensureObjectId(id, "characterId").toHexString(),
      ),
    ),
  ).map((value) => new ObjectId(value));

  if (uniqueCharacterIds.length === 0) {
    return { createdCharacters: [], skippedCharacterIds: [] };
  }

  const sourceCharacters = await listCharactersByStoryAndIds(
    input.fromStoryId,
    uniqueCharacterIds,
  );

  if (sourceCharacters.length !== uniqueCharacterIds.length) {
    throw new ValidationError(
      "characterIds",
      "One or more characters were not found in the source story",
    );
  }

  const destinationCharacters = await listCharacters({
    storyId: input.toStoryId,
  });
  const existingTitles = new Set(
    destinationCharacters.map((character) => character.title),
  );
  const skippedCharacterIds: string[] = [];
  const createdCharacters: CharacterDocument[] = [];

  for (const character of sourceCharacters) {
    if (existingTitles.has(character.title)) {
      skippedCharacterIds.push(character._id.toHexString());
      continue;
    }

    const created = await createCharacterModel({
      title: character.title,
      description: character.description,
      imageUrl: character.imageUrl,
      characteristics: character.characteristics,
      customCharacteristics: character.customCharacteristics,
      lists: character.lists,
      storyId: input.toStoryId,
    } as CreateCharacterInput);
    existingTitles.add(character.title);
    createdCharacters.push(created);
  }

  return { createdCharacters, skippedCharacterIds };
};
