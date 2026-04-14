import { ObjectId } from "mongodb";
import {
  copyColorsFromUser,
  findColorsByResource,
  insertDefaultColors,
  updateColor,
  UpdateColorInput,
  ColorDocument,
} from "../models/colors";
import { getStoryForUser } from "./storyService";

const toColorResponse = (doc: ColorDocument) => ({
  id: doc._id.toHexString(),
  color: doc.color,
  sortOrder: doc.sortOrder,
  ignored: doc.ignored,
});

export const getStoryColors = async (
  storyId: string | ObjectId,
  userId: string | ObjectId,
) => {
  await getStoryForUser(storyId, userId);

  // Check if story already has colors
  let storyColors = await findColorsByResource("story", storyId);
  if (storyColors.length > 0) {
    return storyColors.map(toColorResponse);
  }

  // Story has no colors — ensure user has colors first
  let userColors = await findColorsByResource("user", userId);
  if (userColors.length === 0) {
    await insertDefaultColors("user", userId);
  }

  // Copy user colors to story
  storyColors = await copyColorsFromUser(userId, storyId);
  return storyColors.map(toColorResponse);
};

export const updateStoryColor = async (
  storyId: string | ObjectId,
  colorId: string | ObjectId,
  userId: string | ObjectId,
  patch: UpdateColorInput,
) => {
  await getStoryForUser(storyId, userId);

  const updated = await updateColor(colorId, storyId, patch);
  if (!updated) {
    return null;
  }

  return toColorResponse(updated);
};
