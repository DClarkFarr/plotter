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

export interface CharacterDefinition extends BaseModelBlueprint {
  storyId: ObjectId;
  title: string;
  description?: string;
  imageUrl?: string;
}

export type CharacterBlueprint = ModelBlueprint<CharacterDefinition>;
export type CharacterDocument = ModelDocument<CharacterDefinition>;

export const getCharactersCollection = (): Collection<CharacterDocument> =>
  getCollection<CharacterDocument>(COLLECTIONS.characters);

export const ensureCharacterIndexes = async (): Promise<void> => {
  const collection = getCharactersCollection();
  await collection.createIndex({ storyId: 1 });
  await collection.createIndex({ storyId: 1, title: 1 });
};

export interface CreateCharacterInput {
  storyId: string | ObjectId;
  title: string;
  description?: string;
  imageUrl?: string;
}

export const createCharacter = async (
  input: CreateCharacterInput,
): Promise<CharacterDocument> => {
  const collection = getCharactersCollection();
  const storyId = ensureObjectId(input.storyId, "storyId");

  const payload: ModelInsertInput<CharacterDefinition> = {
    storyId,
    title: input.title,
    ...createTimestamps(),
  };

  if (input.description !== undefined) {
    payload.description = input.description;
  }

  if (input.imageUrl !== undefined) {
    payload.imageUrl = input.imageUrl;
  }

  const result = await collection.insertOne(
    payload as unknown as CharacterDocument,
  );
  return { ...payload, _id: result.insertedId };
};

export interface ListCharactersOptions {
  limit?: number;
  storyId?: string | ObjectId;
}

export const listCharacters = async (
  options: ListCharactersOptions = {},
): Promise<CharacterDocument[]> => {
  const collection = getCharactersCollection();
  const limit = options.limit ?? 200;
  const filter = options.storyId
    ? { storyId: ensureObjectId(options.storyId, "storyId") }
    : {};

  return collection.find(filter).limit(limit).sort({ title: 1 }).toArray();
};

export const listCharactersByIds = async (
  ids: Array<string | ObjectId>,
): Promise<CharacterDocument[]> => {
  const collection = getCharactersCollection();
  const uniqueIds = Array.from(
    new Set(ids.map((id) => ensureObjectId(id, "characterId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return [];
  }

  return collection.find({ _id: { $in: uniqueIds } }).toArray();
};

export const getCharacterById = async (
  id: string | ObjectId,
): Promise<CharacterDocument | null> => {
  const collection = getCharactersCollection();
  return collection.findOne({ _id: ensureObjectId(id, "characterId") });
};

export interface UpdateCharacterInput {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export const updateCharacterById = async (
  id: string | ObjectId,
  updates: UpdateCharacterInput,
): Promise<CharacterDocument | null> => {
  const collection = getCharactersCollection();
  const characterId = ensureObjectId(id, "characterId");
  const updatePayload: Partial<CharacterDefinition> = {};

  if (updates.title !== undefined) {
    updatePayload.title = updates.title;
  }

  if (updates.description !== undefined) {
    updatePayload.description = updates.description;
  }

  if (updates.imageUrl !== undefined) {
    updatePayload.imageUrl = updates.imageUrl;
  }

  const result = await collection.findOneAndUpdate(
    { _id: characterId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};
