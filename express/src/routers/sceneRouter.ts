import express, { Request, Response } from "express";
import { AuthError, ValidationError } from "../services/authService";
import {
  createSceneForStory,
  updateSceneForStory,
} from "../services/sceneService";
import { getStoryForUser } from "../services/storyService";
import {
  optionalNumber,
  optionalString,
  requireNumber,
  requireString,
  requireUserId,
} from "../utils/validators";
import { assertparamIsString } from "../utils/routes";
import type { SceneTodoItem, UpdateSceneInput } from "../models/scenes";

export const sceneRouter = express.Router({ mergeParams: true });

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

const toSceneResponse = (scene: {
  _id: { toHexString(): string };
  title: string;
  description: string;
  plotId: { toHexString(): string };
  tags: Array<{ toHexString(): string }>;
  todo: SceneTodoItem[];
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

const parseOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError("scene", "scene must be a string");
  }

  return value;
};

const parseTagIds = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("tags", "tags must be an array");
  }

  const tagIds = value.map((tag) => {
    if (typeof tag !== "string") {
      throw new ValidationError("tags", "tags must be an array of strings");
    }
    return tag;
  });

  return tagIds;
};

const parseTodoItems = (value: unknown): SceneTodoItem[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("todo", "todo must be an array");
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new ValidationError("todo", "todo items must be objects");
    }

    const text = (item as { text?: unknown }).text;
    const isDone = (item as { isDone?: unknown }).isDone;

    if (typeof text !== "string") {
      throw new ValidationError("todo", "todo item text must be a string");
    }

    if (typeof isDone !== "boolean") {
      throw new ValidationError("todo", "todo item isDone must be a boolean");
    }

    return { text, isDone };
  });
};

const parseOptionalPov = (value: unknown): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError("pov", "pov must be a string or null");
  }

  return value;
};

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
    if (error.message === "Scene not found") {
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

const applySceneRoutes = () => {
  sceneRouter.post(
    "/:storyId/plots/:plotId/scenes",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const plotId = assertparamIsString(req.params.plotId, "plotId");

      await getStoryForUser(storyId, userId);

      const title = requireString(req.body?.title, "title");
      const description = req.body?.description
        ? optionalString(req.body?.description, "description")
        : undefined;
      const scene = parseOptionalString(req.body?.scene);
      const tags = parseTagIds(req.body?.tags);
      const todo = parseTodoItems(req.body?.todo);
      const pov = parseOptionalPov(req.body?.pov);
      const verticalIndex = requireNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );

      const created = await createSceneForStory(storyId, {
        title,
        description: description ?? "",
        scene: scene ?? "",
        tags: tags ?? [],
        todo: todo ?? [],
        pov: pov ?? null,
        plotId,
        verticalIndex,
      });

      res.status(201).json({ scene: toSceneResponse(created) });
    }),
  );

  sceneRouter.patch(
    "/:storyId/scenes/:sceneId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const sceneId = assertparamIsString(req.params.sceneId, "sceneId");

      await getStoryForUser(storyId, userId);

      const title = optionalString(req.body?.title, "title");
      const description = optionalString(req.body?.description, "description");
      const scene = parseOptionalString(req.body?.scene);
      const tags = parseTagIds(req.body?.tags);
      const todo = parseTodoItems(req.body?.todo);
      const pov = parseOptionalPov(req.body?.pov);
      const verticalIndex = optionalNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );

      if (
        title === undefined &&
        description === undefined &&
        scene === undefined &&
        tags === undefined &&
        todo === undefined &&
        verticalIndex === undefined &&
        pov === undefined
      ) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const toSet: Partial<UpdateSceneInput> = {};

      if (title !== undefined) {
        toSet.title = title;
      }
      if (description !== undefined) {
        toSet.description = description;
      }
      if (scene !== undefined) {
        toSet.scene = scene;
      }
      if (tags !== undefined) {
        toSet.tags = tags;
      }
      if (todo !== undefined) {
        toSet.todo = todo;
      }
      if (verticalIndex !== undefined) {
        toSet.verticalIndex = verticalIndex;
      }
      if (pov !== undefined) {
        toSet.pov = pov;
      }
      const updated = await updateSceneForStory(storyId, sceneId, toSet);

      if (!updated) {
        res.status(404).json({ error: "Scene not found" });
        return;
      }

      res.status(200).json({ scene: toSceneResponse(updated) });
    }),
  );
};

applySceneRoutes();
