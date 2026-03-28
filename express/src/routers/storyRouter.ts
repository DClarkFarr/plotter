import express, { Request, Response } from "express";
import { AuthError, ValidationError } from "../services/authService";
import {
  createStoryForOwner,
  getStoryForUser,
  getStoryStats,
  listStoriesForUser,
  listStoryPlotsWithScenesForUser,
  listStoryTagsForUser,
  updateStoryById,
} from "../services/storyService";
import { createTag, deleteTagById } from "../services/tagService";
import {
  createPlot,
  getPlotForStory,
  getPlotWithScenes,
  updatePlotById,
} from "../services/plotService";
import {
  optionalNumber,
  optionalString,
  requireNumber,
  requireString,
  requireUserId,
  resolveOwnerId,
} from "../utils/validators";
import { assertparamIsString } from "../utils/routes";
import { UpdateStoryInput } from "../models/stories";

export const storyRouter = express.Router({ mergeParams: true });

type AsyncHandler = (req: Request, res: Response) => Promise<void>;

const handleAsync =
  (handler: AsyncHandler): AsyncHandler =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

const toTagResponse = (tag: {
  _id: { toHexString(): string };
  name: string;
  color: string;
  variant: boolean;
  variants: string[];
  storyId: { toHexString(): string };
}) => ({
  id: tag._id.toHexString(),
  name: tag.name,
  color: tag.color,
  variant: tag.variant,
  variants: tag.variants,
  storyId: tag.storyId.toHexString(),
});

const toSceneResponse = (scene: {
  _id: { toHexString(): string };
  title: string;
  description: string;
  plotId: { toHexString(): string };
  tags: Array<{ toHexString(): string }>;
  todo: Array<{ text: string; isDone: boolean }>;
  scene?: string;
  verticalIndex: number;
  pov?: { toHexString(): string } | null;
}) => ({
  id: scene._id.toHexString(),
  title: scene.title,
  description: scene.description,
  plotId: scene.plotId.toHexString(),
  tags: scene.tags.map((tagId) => tagId.toHexString()),
  todo: scene.todo,
  scene: scene.scene ?? null,
  verticalIndex: scene.verticalIndex,
  pov: scene.pov ? scene.pov.toHexString() : null,
});

const toPlotResponse = (plot: {
  _id: { toHexString(): string };
  title: string;
  description: string;
  color: string;
  storyId: { toHexString(): string };
  horizontalIndex: number;
  scenes: Array<{
    _id: { toHexString(): string };
    title: string;
    description: string;
    plotId: { toHexString(): string };
    tags: Array<{ toHexString(): string }>;
    todo: Array<{ text: string; isDone: boolean }>;
    scene?: string;
    verticalIndex: number;
  }>;
}) => ({
  id: plot._id.toHexString(),
  title: plot.title,
  description: plot.description,
  color: plot.color,
  storyId: plot.storyId.toHexString(),
  horizontalIndex: plot.horizontalIndex,
  scenes: plot.scenes.map((scene) => toSceneResponse(scene)),
});

const toStoryResponse = (
  story: {
    _id: { toHexString(): string };
    title: string;
    description: string;
    users: Array<{ userId: { toHexString(): string }; role: string }>;
    createdAt: Date;
    updatedAt?: Date;
  },
  stats: { plots: number; scenes: number },
) => ({
  id: story._id.toHexString(),
  title: story.title,
  description: story.description ?? null,
  ownerId: resolveOwnerId(story.users),
  stats,
  createdAt: story.createdAt.toISOString(),
  updatedAt: story.updatedAt ? story.updatedAt.toISOString() : null,
});

const handleError = (res: Response, error: unknown): void => {
  if (error instanceof AuthError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.status).json({ error: error.message, field: error.field });
    return;
  }

  if (error instanceof Error) {
    if (error.message === "Story not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    if (
      error.message.includes("required") ||
      error.message.startsWith("Invalid") ||
      error.message.includes("must") ||
      error.message.includes("unknown")
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
  }

  res.status(500).json({ error: "Unexpected error" });
};

const applyStoryRoutes = () => {
  storyRouter.get(
    "/",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const stories = await listStoriesForUser(userId);
      const storiesWithStats = await Promise.all(
        stories.map(async (story) => {
          const stats = await getStoryStats(story._id);
          return toStoryResponse(story, stats);
        }),
      );

      res.status(200).json({ stories: storiesWithStats });
    }),
  );

  storyRouter.get(
    "/:storyId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);

      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const stats = await getStoryStats(story._id);
      res.status(200).json({ story: toStoryResponse(story, stats) });
    }),
  );

  storyRouter.get(
    "/:storyId/tags",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const tags = await listStoryTagsForUser(storyId, userId);

      res.status(200).json({ tags: tags.map((tag) => toTagResponse(tag)) });
    }),
  );

  storyRouter.post(
    "/:storyId/tags",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      await getStoryForUser(storyId, userId);

      const name = requireString(req.body?.name, "name");
      const color = requireString(req.body?.color, "color");

      const tag = await createTag({
        name,
        color,
        variant: false,
        variants: [],
        storyId,
      });

      res.status(201).json({ tag: toTagResponse(tag) });
    }),
  );

  storyRouter.delete(
    "/:storyId/tags/:tagId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const tagId = assertparamIsString(req.params.tagId, "tagId");

      await getStoryForUser(storyId, userId);

      const deleted = await deleteTagById(storyId, tagId);
      if (!deleted) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      res.status(204).send();
    }),
  );

  storyRouter.get(
    "/:storyId/plots",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const plots = await listStoryPlotsWithScenesForUser(storyId, userId);

      res
        .status(200)
        .json({ plots: plots.map((plot) => toPlotResponse(plot)) });
    }),
  );

  storyRouter.post(
    "/:storyId/plots",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      await getStoryForUser(storyId, userId);

      const title = requireString(req.body?.title, "title");
      const description = optionalString(req.body?.description, "description");
      const color = optionalString(req.body?.color, "color");
      const horizontalIndex = requireNumber(
        req.body?.horizontalIndex,
        "horizontalIndex",
      );

      const plot = await createPlot({
        title,
        description: description ?? "",
        color: color ?? "#94A3B8",
        storyId,
        horizontalIndex,
      });

      res.status(201).json({
        plot: toPlotResponse({
          ...plot,
          scenes: [],
        }),
      });
    }),
  );

  storyRouter.patch(
    "/:storyId/plots/:plotId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const plotId = assertparamIsString(req.params.plotId, "plotId");

      await getStoryForUser(storyId, userId);
      const existing = await getPlotForStory(plotId, storyId);

      if (!existing) {
        res.status(404).json({ error: "Plot not found" });
        return;
      }

      const title = optionalString(req.body?.title, "title");
      const description = optionalString(req.body?.description, "description");
      const color = optionalString(req.body?.color, "color");
      const horizontalIndex = optionalNumber(
        req.body?.horizontalIndex,
        "horizontalIndex",
      );

      if (
        title === undefined &&
        description === undefined &&
        color === undefined &&
        horizontalIndex === undefined
      ) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const updated = await updatePlotById(plotId, {
        title: title || existing.title,
        description: description || existing.description,
        color: color || existing.color,
        horizontalIndex:
          horizontalIndex !== undefined
            ? horizontalIndex
            : existing.horizontalIndex,
      });

      if (!updated) {
        res.status(404).json({ error: "Plot not found" });
        return;
      }

      const plotWithScenes = await getPlotWithScenes(plotId);
      if (!plotWithScenes) {
        res.status(404).json({ error: "Plot not found" });
        return;
      }

      res.status(200).json({ plot: toPlotResponse(plotWithScenes) });
    }),
  );

  storyRouter.patch(
    "/:storyId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const title = optionalString(req.body?.title, "title");
      const description = optionalString(req.body?.description, "description");

      if (title === undefined && description === undefined) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const existing = await getStoryForUser(storyId, userId);

      if (!existing) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const toSet: UpdateStoryInput = {};
      if (title !== undefined) {
        toSet.title = title;
      }
      if (description !== undefined) {
        toSet.description = description;
      }

      const updated = await updateStoryById(storyId, toSet);

      console.log("got updated", updated, "from", toSet);
      if (!updated) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const stats = await getStoryStats(updated._id);
      res.status(200).json({ story: toStoryResponse(updated, stats) });
    }),
  );

  storyRouter.post(
    "/",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const title = requireString(req.body?.title, "title");
      const story = await createStoryForOwner({ title, ownerId: userId });
      const stats = await getStoryStats(story._id);

      res.status(201).json({ story: toStoryResponse(story, stats) });
    }),
  );
};

applyStoryRoutes();
