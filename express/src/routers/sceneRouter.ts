import express from "express";
import { ValidationError } from "../services/authService";
import {
  createSceneForStory,
  deleteSceneForStory,
  moveSingleCardWithinPlot,
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
import type {
  SceneSnippet,
  SceneTodoItem,
  UpdateSceneInput,
} from "../models/scenes";
import { handleAsync } from "../utils/asyncHandler";

export const sceneRouter = express.Router({ mergeParams: true });

const toSceneResponse = (scene: {
  _id: { toHexString(): string };
  title: string;
  description: string;
  plotId: { toHexString(): string };
  tags: Array<{ toHexString(): string }>;
  tagVariants?: Array<{ tagId: { toHexString(): string }; variant: string }>;
  todo: SceneTodoItem[];
  snippets?: SceneSnippet[];
  scene?: string;
  verticalIndex: number;
  pov?: { toHexString(): string } | null;
}) => ({
  id: scene._id.toHexString(),
  title: scene.title,
  description: scene.description,
  plotId: scene.plotId.toHexString(),
  tags: scene.tags.map((tagId) => tagId.toHexString()),
  tagVariants:
    scene.tagVariants?.map((entry) => ({
      tagId: entry.tagId.toHexString(),
      variant: entry.variant,
    })) ?? [],
  todo: scene.todo,
  snippets: scene.snippets ?? [],
  verticalIndex: scene.verticalIndex,
  pov: scene.pov ? scene.pov.toHexString() : null,
});

const toSectionResponse = (section: {
  _id: { toHexString(): string };
  storyId: { toHexString(): string };
  title: string;
  verticalIndex: number;
  type: string;
}) => ({
  id: section._id.toHexString(),
  storyId: section.storyId.toHexString(),
  title: section.title,
  verticalIndex: section.verticalIndex,
  type: section.type,
});

const toShiftedResourcesResponse = (resources: {
  scenes: Array<Parameters<typeof toSceneResponse>[0]>;
  sections: Array<Parameters<typeof toSectionResponse>[0]>;
}) => ({
  scenes: resources.scenes.map((scene) => toSceneResponse(scene)),
  sections: resources.sections.map((section) => toSectionResponse(section)),
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

const parseTagVariants = (
  value: unknown,
): Array<{ tagId: string; variant: string }> | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("tagVariants", "tagVariants must be an array");
  }

  return value.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new ValidationError(
        "tagVariants",
        "tagVariants entries must be objects",
      );
    }

    const tagId = (entry as { tagId?: unknown }).tagId;
    const variant = (entry as { variant?: unknown }).variant;

    if (typeof tagId !== "string") {
      throw new ValidationError("tagVariants", "tagId must be a string");
    }

    if (typeof variant !== "string") {
      throw new ValidationError("tagVariants", "variant must be a string");
    }

    return { tagId, variant };
  });
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

const parseSnippets = (value: unknown): SceneSnippet[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("snippets", "snippets must be an array");
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new ValidationError("snippets", "snippets must be objects");
    }

    const label = (item as { label?: unknown }).label;
    const text = (item as { text?: unknown }).text;

    if (typeof label !== "string") {
      throw new ValidationError("snippets", "snippet label must be a string");
    }

    if (typeof text !== "string") {
      throw new ValidationError("snippets", "snippet text must be a string");
    }

    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      throw new ValidationError("snippets", "snippet label must not be empty");
    }

    return { label: trimmedLabel, text };
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
      const tags = parseTagIds(req.body?.tags);
      const tagVariants = parseTagVariants(req.body?.tagVariants);
      const todo = parseTodoItems(req.body?.todo);
      const snippets = parseSnippets(req.body?.snippets);
      const pov = parseOptionalPov(req.body?.pov);
      const verticalIndex = requireNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );

      const created = await createSceneForStory(storyId, {
        title,
        description: description ?? "",
        tags: tags ?? [],
        ...(tagVariants !== undefined && { tagVariants }),
        todo: todo ?? [],
        snippets: snippets ?? [],
        pov: pov ?? null,
        plotId,
        verticalIndex,
      });

      const payload: {
        scene: ReturnType<typeof toSceneResponse>;
        shiftedResources?: ReturnType<typeof toShiftedResourcesResponse>;
      } = {
        scene: toSceneResponse(created.scene),
      };

      if (created.shiftedResources) {
        payload.shiftedResources = toShiftedResourcesResponse(
          created.shiftedResources,
        );
      }

      res.status(201).json(payload);
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
      const tags = parseTagIds(req.body?.tags);
      const tagVariants = parseTagVariants(req.body?.tagVariants);
      const todo = parseTodoItems(req.body?.todo);
      const snippets = parseSnippets(req.body?.snippets);
      const pov = parseOptionalPov(req.body?.pov);
      const verticalIndex = optionalNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );

      if (
        title === undefined &&
        description === undefined &&
        tags === undefined &&
        tagVariants === undefined &&
        todo === undefined &&
        snippets === undefined &&
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
      if (tags !== undefined) {
        toSet.tags = tags;
      }
      if (tagVariants !== undefined) {
        toSet.tagVariants = tagVariants;
      }
      if (todo !== undefined) {
        toSet.todo = todo;
      }
      if (snippets !== undefined) {
        toSet.snippets = snippets;
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

  sceneRouter.post(
    "/:storyId/scenes/:sceneId/move-within-plot",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const sceneId = assertparamIsString(req.params.sceneId, "sceneId");

      await getStoryForUser(storyId, userId);

      const shiftData = {
        fromPlotId: requireString(req.body?.fromPlotId, "fromPlotId"),
        toPlotId: requireString(req.body?.toPlotId, "toPlotId"),
        sceneId,
        fromIndex: requireNumber(req.body?.fromIndex, "fromIndex"),
        toIndex: requireNumber(req.body?.toIndex, "toIndex"),
      };

      const changedResources = await moveSingleCardWithinPlot(shiftData);

      const payload: {
        scene?: ReturnType<typeof toSceneResponse> | null;
        shiftedResources?: ReturnType<typeof toShiftedResourcesResponse>;
      } = {};

      if (changedResources.scene) {
        payload.scene = toSceneResponse(changedResources.scene);
      }

      if (changedResources.shiftedResources) {
        payload.shiftedResources = toShiftedResourcesResponse(
          changedResources.shiftedResources,
        );
      }

      res.status(200).json(payload);
    }),
  );

  sceneRouter.delete(
    "/:storyId/scenes/:sceneId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const sceneId = assertparamIsString(req.params.sceneId, "sceneId");

      await getStoryForUser(storyId, userId);

      const deleted = await deleteSceneForStory(storyId, sceneId);
      if (!deleted.deleted) {
        res.status(404).json({ error: "Scene not found" });
        return;
      }

      const payload: {
        deleted: true;
        shiftedResources?: ReturnType<typeof toShiftedResourcesResponse>;
      } = {
        deleted: true,
      };

      if (deleted.shiftedResources) {
        payload.shiftedResources = toShiftedResourcesResponse(
          deleted.shiftedResources,
        );
      }

      res.status(200).json(payload);
    }),
  );
};

applySceneRoutes();
