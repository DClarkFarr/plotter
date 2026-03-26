import { ObjectId } from "mongodb";
import {
  createPlot as createPlotModel,
  getPlotById,
  PlotDocument,
  shiftPlotIndices,
  updatePlotById as updatePlotByIdModel,
} from "../models/plots";
import { listScenesByPlotIds } from "../models/scenes";
import { getStoryById } from "../models/stories";
import { ensureObjectId } from "../models/types";

export interface CreatePlotInput {
  title: string;
  description: string;
  color: string;
  storyId: string | ObjectId;
  horizontalIndex: number;
}

export const createPlot = async (
  input: CreatePlotInput,
): Promise<PlotDocument> => {
  if (input.horizontalIndex < 0) {
    throw new Error("horizontalIndex must be >= 0");
  }

  const storyId = ensureObjectId(input.storyId, "storyId");
  const story = await getStoryById(storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  await shiftPlotIndices(story._id, input.horizontalIndex);

  return createPlotModel({
    ...input,
    storyId: story._id,
  });
};

export interface UpdatePlotInput {
  title?: string;
  description?: string;
  color?: string;
  storyId?: string | ObjectId;
  horizontalIndex?: number;
}

export const updatePlotById = async (
  id: string | ObjectId,
  updates: UpdatePlotInput,
): Promise<PlotDocument | null> => {
  const current = await getPlotById(id);
  if (!current) {
    return null;
  }

  let targetStoryId = current.storyId;
  if (updates.storyId !== undefined) {
    const storyId = ensureObjectId(updates.storyId, "storyId");
    const story = await getStoryById(storyId);
    if (!story) {
      throw new Error("Story not found");
    }
    targetStoryId = story._id;
  }

  if (updates.horizontalIndex !== undefined) {
    if (updates.horizontalIndex < 0) {
      throw new Error("horizontalIndex must be >= 0");
    }
    await shiftPlotIndices(targetStoryId, updates.horizontalIndex, current._id);
  }

  return updatePlotByIdModel(id, {
    ...updates,
    ...(updates.storyId !== undefined && { storyId: targetStoryId }),
  });
};

export const getPlotForStory = async (
  plotId: string | ObjectId,
  storyId: string | ObjectId,
): Promise<PlotDocument | null> => {
  const plot = await getPlotById(plotId);
  if (!plot) {
    return null;
  }

  const storyObjectId = ensureObjectId(storyId, "storyId");
  if (plot.storyId.toHexString() !== storyObjectId.toHexString()) {
    return null;
  }

  return plot;
};

export const getPlotWithScenes = async (
  plotId: string | ObjectId,
): Promise<
  | (PlotDocument & { scenes: Awaited<ReturnType<typeof listScenesByPlotIds>> })
  | null
> => {
  const plot = await getPlotById(plotId);
  if (!plot) {
    return null;
  }

  const scenes = await listScenesByPlotIds([plot._id]);
  return { ...plot, scenes };
};
