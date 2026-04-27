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
import { listScenes, SceneDocument, updateSceneById } from "../models/scenes";
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
      reason: "not-found" | "cannot-delete-last-plot" | "plot-has-scenes";
    };

export const PLOT_HAS_SCENES_DELETE_MESSAGE =
  "Cannot delete a plot that still has scenes. Move or remove its scenes first.";

const getSecondaryPlot = (
  plot: PlotDocument,
  plots: PlotDocument[],
): PlotDocument | null => {
  const others = plots.filter(
    (p) => p._id.toHexString() !== plot._id.toHexString(),
  );

  // Closest with lower horizontalIndex (highest index below)
  const lower = others
    .filter((p) => p.horizontalIndex < plot.horizontalIndex)
    .sort((a, b) => b.horizontalIndex - a.horizontalIndex)[0];

  if (lower) return lower;

  // Closest with higher horizontalIndex (lowest index above)
  return (
    others
      .filter((p) => p.horizontalIndex > plot.horizontalIndex)
      .sort((a, b) => a.horizontalIndex - b.horizontalIndex)[0] ?? null
  );
};

const combineScenes = async (
  targetPlotId: ObjectId,
  incomingScenes: SceneDocument[],
): Promise<void> => {
  const targetScenes = await listScenes({ plotId: targetPlotId, limit: 5000 });

  // Track occupied vertical indexes: verticalIndex -> sceneId
  const occupied = new Map<number, ObjectId>();
  for (const scene of targetScenes) {
    occupied.set(scene.verticalIndex, scene._id);
  }

  const ordered = [...incomingScenes].sort(
    (a, b) => a.verticalIndex - b.verticalIndex,
  );

  for (const scene of ordered) {
    const desiredIndex = scene.verticalIndex;

    if (occupied.has(desiredIndex)) {
      // Shift all occupied scenes with verticalIndex >= desiredIndex up by 1,
      // processing from highest to lowest to avoid cascading conflicts.
      const toShift = [...occupied.entries()]
        .filter(([idx]) => idx >= desiredIndex)
        .sort(([a], [b]) => b - a);

      for (const [idx, sceneId] of toShift) {
        await updateSceneById(sceneId, { verticalIndex: idx + 1 });
        occupied.delete(idx);
        occupied.set(idx + 1, sceneId);
      }
    }

    await updateSceneById(scene._id, {
      plotId: targetPlotId,
      verticalIndex: desiredIndex,
    });
    occupied.set(desiredIndex, scene._id);
  }
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

  // Guard before merge/delete path: in-use plots cannot be deleted.
  const existingScenes = await listScenes({ plotId: plot._id, limit: 1 });
  if (existingScenes.length > 0) {
    return { deleted: false, reason: "plot-has-scenes" };
  }

  const plots = await listPlots({ storyId: storyObjectId, limit: 2000 });
  const targetPlot = getSecondaryPlot(plot, plots);

  if (!targetPlot) {
    return { deleted: false, reason: "not-found" };
  }

  const sourceScenes = await listScenes({ plotId: plot._id, limit: 5000 });
  await combineScenes(targetPlot._id, sourceScenes);

  const deleted = await deletePlotById(plot._id);
  if (!deleted) {
    return { deleted: false, reason: "not-found" };
  }

  await shiftPlotsLeftFromIndex(storyObjectId, plot.horizontalIndex);

  return {
    deleted: true,
    deletedPlotId: plot._id.toHexString(),
    targetPlotId: targetPlot._id.toHexString(),
    movedSceneCount: sourceScenes.length,
  };
};
