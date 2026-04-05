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
  characteristics?: CharacteristicFields;
  customCharacteristics?: CustomCharacteristic[];
  lists?: CharacterList[];
}

export interface CharacteristicFields {
  description?: string;
  history?: string;
  height?: string;
  weight?: string;
  age?: string;
  hair?: string;
  eyeColor?: string;
  mantra?: string;
  skinColor?: string;
  build?: string;
}

export interface CustomCharacteristic {
  label: string;
  value: string;
}

export interface CharacterList {
  label: string;
  items: string[];
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
  characteristics?: CharacteristicFields;
  customCharacteristics?: CustomCharacteristic[];
  lists?: CharacterList[];
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

  if (input.characteristics !== undefined) {
    payload.characteristics = input.characteristics;
  }

  if (input.customCharacteristics !== undefined) {
    payload.customCharacteristics = input.customCharacteristics;
  }

  if (input.lists !== undefined) {
    payload.lists = input.lists;
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

export const countCharactersByStoryId = async (
  storyId: string | ObjectId,
): Promise<number> => {
  const collection = getCharactersCollection();
  return collection.countDocuments({
    storyId: ensureObjectId(storyId, "storyId"),
  });
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

export const listCharactersByStoryAndIds = async (
  storyId: string | ObjectId,
  ids: Array<string | ObjectId>,
): Promise<CharacterDocument[]> => {
  const collection = getCharactersCollection();
  const uniqueIds = Array.from(
    new Set(ids.map((id) => ensureObjectId(id, "characterId").toHexString())),
  ).map((value) => new ObjectId(value));

  if (uniqueIds.length === 0) {
    return [];
  }

  return collection
    .find({
      storyId: ensureObjectId(storyId, "storyId"),
      _id: { $in: uniqueIds },
    })
    .toArray();
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
  characteristics?: CharacteristicFields;
  customCharacteristics?: CustomCharacteristic[];
  lists?: CharacterList[];
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

  if (updates.characteristics !== undefined) {
    updatePayload.characteristics = updates.characteristics;
  }

  if (updates.customCharacteristics !== undefined) {
    updatePayload.customCharacteristics = updates.customCharacteristics;
  }

  if (updates.lists !== undefined) {
    updatePayload.lists = updates.lists;
  }

  const result = await collection.findOneAndUpdate(
    { _id: characterId },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};

export const deleteCharacterById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getCharactersCollection();
  const result = await collection.deleteOne({
    _id: ensureObjectId(id, "characterId"),
  });

  return result.deletedCount === 1;
};
