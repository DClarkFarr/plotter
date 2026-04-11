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

export type SectionType = "act" | "section";

export interface SectionDefinition extends BaseModelBlueprint {
  storyId: ObjectId;
  title: string;
  verticalIndex: number;
  type: SectionType;
}

export type SectionBlueprint = ModelBlueprint<SectionDefinition>;
export type SectionDocument = ModelDocument<SectionDefinition>;

export const getSectionsCollection = (): Collection<SectionDocument> =>
  getCollection<SectionDocument>(COLLECTIONS.sections);

export const ensureSectionIndexes = async (): Promise<void> => {
  const collection = getSectionsCollection();
  await collection.createIndex({ storyId: 1 });
  await collection.createIndex(
    { storyId: 1, verticalIndex: 1 },
    { unique: true },
  );
};

export const getSectionById = async (
  id: string | ObjectId,
): Promise<SectionDocument | null> => {
  const collection = getSectionsCollection();
  return collection.findOne({ _id: ensureObjectId(id, "sectionId") });
};

export const getSectionByVerticalIndex = async (
  storyId: string | ObjectId,
  verticalIndex: number,
): Promise<SectionDocument | null> => {
  const collection = getSectionsCollection();
  return collection.findOne({
    storyId: ensureObjectId(storyId, "storyId"),
    verticalIndex,
  });
};

export const listSectionsByStoryId = async (
  storyId: string | ObjectId,
): Promise<SectionDocument[]> => {
  const collection = getSectionsCollection();
  return collection
    .find({ storyId: ensureObjectId(storyId, "storyId") })
    .sort({ verticalIndex: 1 })
    .toArray();
};

export interface CreateSectionInput {
  storyId: string | ObjectId;
  title: string;
  verticalIndex: number;
  type: SectionType;
}

export const createSection = async (
  input: CreateSectionInput,
): Promise<SectionDocument> => {
  const collection = getSectionsCollection();
  const payload: ModelInsertInput<SectionDefinition> = {
    storyId: ensureObjectId(input.storyId, "storyId"),
    title: input.title,
    verticalIndex: input.verticalIndex,
    type: input.type,
    ...createTimestamps(),
  };

  const result = await collection.insertOne(
    payload as unknown as SectionDocument,
  );
  return { ...payload, _id: result.insertedId };
};

export interface UpdateSectionInput {
  title?: string;
  verticalIndex?: number;
  type?: SectionType;
}

export const updateSectionById = async (
  id: string | ObjectId,
  updates: UpdateSectionInput,
): Promise<SectionDocument | null> => {
  const collection = getSectionsCollection();
  const updatePayload: Partial<SectionDefinition> = {};

  if (updates.title !== undefined) {
    updatePayload.title = updates.title;
  }

  if (updates.verticalIndex !== undefined) {
    updatePayload.verticalIndex = updates.verticalIndex;
  }

  if (updates.type !== undefined) {
    updatePayload.type = updates.type;
  }

  const result = await collection.findOneAndUpdate(
    { _id: ensureObjectId(id, "sectionId") },
    { $set: { ...updatePayload, ...touchTimestamps() } },
    { returnDocument: "after" },
  );

  return result;
};

export const deleteSectionById = async (
  id: string | ObjectId,
): Promise<boolean> => {
  const collection = getSectionsCollection();
  const result = await collection.deleteOne({
    _id: ensureObjectId(id, "sectionId"),
  });

  return result.deletedCount > 0;
};

export const shiftSectionsUpwardFromIndex = async (
  storyId: ObjectId,
  fromIndex: number,
): Promise<SectionDocument[]> => {
  const collection = getSectionsCollection();

  await collection.updateMany(
    {
      storyId,
      verticalIndex: { $gte: fromIndex },
    },
    { $inc: { verticalIndex: 1 } },
  );

  return collection
    .find({
      storyId,
      verticalIndex: { $gte: fromIndex + 1 },
    })
    .toArray();
};

export const shiftSectionsDownwardFromIndex = async (
  storyId: ObjectId,
  fromIndex: number,
): Promise<SectionDocument[]> => {
  const collection = getSectionsCollection();

  await collection.updateMany(
    {
      storyId,
      verticalIndex: { $gt: fromIndex },
    },
    { $inc: { verticalIndex: -1 } },
  );

  return collection
    .find({
      storyId,
      verticalIndex: { $gt: fromIndex - 1 },
    })
    .toArray();
};

export const shiftSectionsInVerticalIndexRange = async (
  storyId: ObjectId,
  rangeStart: number | undefined,
  rangeEnd: number | undefined,
  shift: number,
): Promise<SectionDocument[]> => {
  if ((rangeStart && rangeEnd && rangeStart > rangeEnd) || shift === 0) {
    return [] as SectionDocument[];
  }

  const collection = getSectionsCollection();

  let verticalIndexFilter: Record<string, unknown> = {};
  let updatedIndexFilter: Record<string, unknown> = {};
  if (rangeStart !== undefined && rangeEnd !== undefined) {
    verticalIndexFilter = { $gte: rangeStart, $lte: rangeEnd };
    updatedIndexFilter = {
      $gte: rangeStart + shift,
      $lte: rangeEnd + shift,
    };
  } else if (rangeStart !== undefined) {
    verticalIndexFilter.$gte = rangeStart;
    updatedIndexFilter.$gte = rangeStart + shift;
  } else if (rangeEnd !== undefined) {
    verticalIndexFilter.$lte = rangeEnd;
    updatedIndexFilter.$lte = rangeEnd + shift;
  } else {
    throw new Error("Either rangeStart or rangeEnd must be defined");
  }

  await collection.updateMany(
    {
      storyId,
      verticalIndex: verticalIndexFilter,
    },
    { $inc: { verticalIndex: shift } },
  );

  return collection
    .find({
      storyId,
      verticalIndex: updatedIndexFilter,
    })
    .sort({ verticalIndex: 1 })
    .toArray();
};
