import { ObjectId } from "mongodb";
import { ensureObjectId } from "../models/types";
import {
  hasSceneOnStoryIndex,
  hasSectionOnIndex,
  shiftGridDownwardFromIndex,
  shiftGridUpwardFromIndex,
  type ShiftedResources,
} from "../utils/plotGridUtils";

export type StoryGridShiftInput = {
  startIndex: number;
  shift: number;
};

const assertValidShift = (shift: number) => {
  if (shift !== 1 && shift !== -1) {
    throw new Error("shift must be 1 or -1");
  }
};

const assertRowEmpty = async (storyId: ObjectId, startIndex: number) => {
  const [hasScene, hasSection] = await Promise.all([
    hasSceneOnStoryIndex(storyId, startIndex),
    hasSectionOnIndex(storyId, startIndex),
  ]);

  if (hasScene || hasSection) {
    throw new Error("Row must be empty to shift down");
  }
};

export const shiftStoryGrid = async (
  storyId: string | ObjectId,
  input: StoryGridShiftInput,
): Promise<ShiftedResources> => {
  if (input.startIndex < 0) {
    throw new Error("startIndex must be >= 0");
  }

  assertValidShift(input.shift);

  const storyObjectId = ensureObjectId(storyId, "storyId");

  if (input.shift === -1) {
    await assertRowEmpty(storyObjectId, input.startIndex);
    return shiftGridDownwardFromIndex(storyObjectId, input.startIndex);
  }

  return shiftGridUpwardFromIndex(storyObjectId, input.startIndex);
};
