import { ObjectId } from "mongodb";
import {
  countPlotsByStoryId,
  createPlot as createPlotModel,
  deletePlotById,
  getPlotById,
  listPlots,
  PlotDocument,
  shiftPlotIndices,
  shiftPlotsLeftFromIndex,
  updatePlotById as updatePlotByIdModel,
} from "../models/plots";
import { listScenes, updateSceneById } from "../models/scenes";
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

  if (updates.storyId !== undefined) {
    const storyId = ensureObjectId(updates.storyId, "storyId");
    const story = await getStoryById(storyId);
    if (!story) {
      throw new Error("Story not found");
    }
  }

  if (updates.horizontalIndex !== undefined) {
    if (updates.horizontalIndex < 0) {
      throw new Error("horizontalIndex must be >= 0");
    }
    await shiftPlotIndices(current, updates.horizontalIndex);
  }

  return updatePlotByIdModel(id, {
    ...updates,
    ...(updates.storyId !== undefined && { storyId: current.storyId }),
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

export type DeletePlotForStoryResult =
  | {
      deleted: true;
      deletedPlotId: string;
      targetPlotId: string;
      movedSceneCount: number;
    }
  | {
      deleted: false;
      reason: "not-found" | "cannot-delete-last-plot";
    };

export const deletePlotForStory = async (
  storyId: string | ObjectId,
  plotId: string | ObjectId,
): Promise<DeletePlotForStoryResult> => {
  const storyObjectId = ensureObjectId(storyId, "storyId");
  const plot = await getPlotForStory(plotId, storyObjectId);

  if (!plot) {
    return { deleted: false, reason: "not-found" };
  }

  const activePlotCount = await countPlotsByStoryId(storyObjectId);
  if (activePlotCount <= 1) {
    return { deleted: false, reason: "cannot-delete-last-plot" };
  }

  const plots = await listPlots({ storyId: storyObjectId, limit: 2000 });
  const targetPlot =
    plots.find(
      (candidate) => candidate.horizontalIndex === plot.horizontalIndex - 1,
    ) ??
    plots.find(
      (candidate) => candidate.horizontalIndex === plot.horizontalIndex + 1,
    );

  if (!targetPlot || targetPlot._id.toHexString() === plot._id.toHexString()) {
    return { deleted: false, reason: "not-found" };
  }

  const targetScenes = await listScenes({
    plotId: targetPlot._id,
    limit: 5000,
  });
  const sourceScenes = await listScenes({ plotId: plot._id, limit: 5000 });

  let nextVerticalIndex =
    targetScenes.reduce(
      (max, scene) => Math.max(max, scene.verticalIndex),
      -1,
    ) + 1;

  const orderedSourceScenes = [...sourceScenes].sort(
    (a, b) => a.verticalIndex - b.verticalIndex,
  );

  for (const scene of orderedSourceScenes) {
    await updateSceneById(scene._id, {
      plotId: targetPlot._id,
      verticalIndex: nextVerticalIndex,
    });
    nextVerticalIndex += 1;
  }

  const deleted = await deletePlotById(plot._id);
  if (!deleted) {
    return { deleted: false, reason: "not-found" };
  }

  await shiftPlotsLeftFromIndex(storyObjectId, plot.horizontalIndex);

  return {
    deleted: true,
    deletedPlotId: plot._id.toHexString(),
    targetPlotId: targetPlot._id.toHexString(),
    movedSceneCount: orderedSourceScenes.length,
  };
};
