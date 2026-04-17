import { ClientSession, Collection, ObjectId } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";
import {
  BaseModelBlueprint,
  createTimestamps,
  ensureObjectId,
  ModelDocument,
  ModelInsertInput,
  touchTimestamps,
} from "./types";

export type ColorResourceType = "user" | "story";

export interface ColorDefinition extends BaseModelBlueprint {
  resourceType: ColorResourceType;
  resourceId: ObjectId;
  color: string;
  sortOrder: number;
  ignored: boolean;
}

export type ColorDocument = ModelDocument<ColorDefinition>;

const DEFAULT_COLORS: string[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#f59e0b",
];

export const getColorsCollection = (): Collection<ColorDocument> =>
  getCollection<ColorDocument>(COLLECTIONS.colors);

export const ensureColorIndexes = async (): Promise<void> => {
  const collection = getColorsCollection();
  await collection.createIndex({ resourceType: 1, resourceId: 1 });
  await collection.createIndex(
    { resourceType: 1, resourceId: 1, sortOrder: 1 },
    { unique: true },
  );
};

export const findColorsByResource = async (
  resourceType: ColorResourceType,
  resourceId: string | ObjectId,
): Promise<ColorDocument[]> => {
  const collection = getColorsCollection();
  return collection
    .find({
      resourceType,
      resourceId: ensureObjectId(resourceId, "resourceId"),
    })
    .sort({ sortOrder: 1 })
    .toArray();
};

export const insertDefaultColors = async (
  resourceType: ColorResourceType,
  resourceId: string | ObjectId,
): Promise<ColorDocument[]> => {
  const collection = getColorsCollection();
  const rid = ensureObjectId(resourceId, "resourceId");

  const docs: ModelInsertInput<ColorDefinition>[] = DEFAULT_COLORS.map(
    (color, index) => ({
      resourceType,
      resourceId: rid,
      color,
      sortOrder: index + 1,
      ignored: false,
      ...createTimestamps(),
    }),
  );

  await collection.insertMany(docs as unknown as ColorDocument[]);
  return findColorsByResource(resourceType, rid);
};

export const copyColorsFromUser = async (
  userId: string | ObjectId,
  storyId: string | ObjectId,
): Promise<ColorDocument[]> => {
  const collection = getColorsCollection();
  const userColors = await findColorsByResource("user", userId);
  const sid = ensureObjectId(storyId, "storyId");

  const docs: ModelInsertInput<ColorDefinition>[] = userColors.map((uc) => ({
    resourceType: "story" as ColorResourceType,
    resourceId: sid,
    color: uc.color,
    sortOrder: uc.sortOrder,
    ignored: uc.ignored,
    ...createTimestamps(),
  }));

  await collection.insertMany(docs as unknown as ColorDocument[]);
  return findColorsByResource("story", sid);
};

export interface UpdateColorInput {
  color?: string;
  ignored?: boolean;
  sortOrder?: number;
}

export const updateColor = async (
  colorId: string | ObjectId,
  storyId: string | ObjectId,
  patch: UpdateColorInput,
): Promise<ColorDocument | null> => {
  const collection = getColorsCollection();
  const cid = ensureObjectId(colorId, "colorId");
  const sid = ensureObjectId(storyId, "storyId");

  const update: Record<string, unknown> = { ...touchTimestamps() };
  if (patch.color !== undefined) update.color = patch.color;
  if (patch.ignored !== undefined) update.ignored = patch.ignored;
  if (patch.sortOrder !== undefined) update.sortOrder = patch.sortOrder;

  const result = await collection.findOneAndUpdate(
    { _id: cid, resourceType: "story", resourceId: sid },
    { $set: update },
    { returnDocument: "after" },
  );

  return result ?? null;
};

export const duplicateColorsByStory = async (
  sourceStoryId: string | ObjectId,
  targetStoryId: string | ObjectId,
  session?: ClientSession,
): Promise<void> => {
  const collection = getColorsCollection();
  const sid = ensureObjectId(sourceStoryId, "sourceStoryId");
  const tid = ensureObjectId(targetStoryId, "targetStoryId");

  const sourceColors = await collection
    .find({ resourceType: "story", resourceId: sid })
    .sort({ sortOrder: 1 })
    .toArray();

  if (sourceColors.length === 0) {
    return;
  }

  const docs: ModelInsertInput<ColorDefinition>[] = sourceColors.map((c) => ({
    resourceType: "story" as ColorResourceType,
    resourceId: tid,
    color: c.color,
    sortOrder: c.sortOrder,
    ignored: c.ignored,
    ...createTimestamps(),
  }));

  await collection.insertMany(
    docs as unknown as ColorDocument[],
    session ? { session } : {},
  );
};
