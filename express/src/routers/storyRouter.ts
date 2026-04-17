import express from "express";
import { ValidationError } from "../services/authService";
import {
  createStoryForOwner,
  getStoryForUser,
  getStoryStats,
  listStoriesForUser,
  listStoryPlotsForUser,
  listStoryScenesForUser,
  listStoryTagsForUser,
  softDeleteStoryForUser,
  updateStoryById,
} from "../services/storyService";
import {
  addVariantToTag,
  createTag,
  deleteTagById,
  deleteVariantFromTag,
  importTagsBetweenStories,
  updateTagForStory,
} from "../services/tagService";
import {
  createPlot,
  getPlotForStory,
  updatePlotById,
} from "../services/plotService";
import { shiftStoryGrid } from "../services/storyGridService";
import { duplicateStoryForOwner } from "../services/storyDuplicateService";
import { exportStoryToDocx } from "../services/storyExportService";
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
import { handleAsync } from "../utils/asyncHandler";

export const storyRouter = express.Router({ mergeParams: true });

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
  tagVariants?: Array<{ tagId: { toHexString(): string }; variant: string }>;
  todo: Array<{ text: string; isDone: boolean }>;
  snippets?: Array<{ label: string; text: string }>;
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

const toPlotResponse = (plot: {
  _id: { toHexString(): string };
  title: string;
  description: string;
  color: string;
  storyId: { toHexString(): string };
  horizontalIndex: number;
}) => ({
  id: plot._id.toHexString(),
  title: plot.title,
  description: plot.description,
  color: plot.color,
  storyId: plot.storyId.toHexString(),
  horizontalIndex: plot.horizontalIndex,
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
  stats: { plots: number; scenes: number; characters: number; tags: number },
) => ({
  id: story._id.toHexString(),
  title: story.title,
  description: story.description ?? null,
  ownerId: resolveOwnerId(story.users),
  stats,
  createdAt: story.createdAt.toISOString(),
  updatedAt: story.updatedAt ? story.updatedAt.toISOString() : null,
});

const parseOptionalBoolean = (
  value: unknown,
  label: string,
): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new ValidationError(label, `${label} must be a boolean`);
  }

  return value;
};

const parseOptionalStringArray = (
  value: unknown,
  label: string,
): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(label, `${label} must be an array`);
  }

  return value.map((entry) => {
    if (typeof entry !== "string") {
      throw new ValidationError(label, `${label} must be an array of strings`);
    }

    const trimmed = entry.trim();
    if (!trimmed) {
      throw new ValidationError(label, `${label} entries must be non-empty`);
    }

    return trimmed;
  });
};

const parseRequiredStringArray = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) {
    throw new ValidationError(label, `${label} must be an array`);
  }

  return value.map((entry) => {
    if (typeof entry !== "string") {
      throw new ValidationError(label, `${label} must be an array of strings`);
    }

    const trimmed = entry.trim();
    if (!trimmed) {
      throw new ValidationError(label, `${label} entries must be non-empty`);
    }

    return trimmed;
  });
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

  storyRouter.post(
    "/:storyId/duplicate",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const newStory = await duplicateStoryForOwner(storyId, userId);
      const stats = await getStoryStats(newStory._id);
      res.status(201).json({ story: toStoryResponse(newStory, stats) });
    }),
  );

  storyRouter.post(
    "/:storyId/export/docx",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const { buffer, filename } = await exportStoryToDocx(storyId);

      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length,
      });
      res.send(buffer);
    }),
  );

  storyRouter.delete(
    "/:storyId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const deleted = await softDeleteStoryForUser(storyId, userId);
      if (!deleted) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      res.status(204).send();
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

  storyRouter.patch(
    "/:storyId/tags/:tagId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const tagId = assertparamIsString(req.params.tagId, "tagId");

      await getStoryForUser(storyId, userId);

      const name = optionalString(req.body?.name, "name");
      const color = optionalString(req.body?.color, "color");
      const variant = parseOptionalBoolean(req.body?.variant, "variant");
      const variants = parseOptionalStringArray(req.body?.variants, "variants");

      if (
        name === undefined &&
        color === undefined &&
        variant === undefined &&
        variants === undefined
      ) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const updated = await updateTagForStory(storyId, tagId, {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(variant !== undefined && { variant }),
        ...(variants !== undefined && { variants }),
      });

      if (!updated) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      res.status(200).json({ tag: toTagResponse(updated) });
    }),
  );

  storyRouter.post(
    "/:storyId/tags/:tagId/variants",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const tagId = assertparamIsString(req.params.tagId, "tagId");

      await getStoryForUser(storyId, userId);

      const name = requireString(req.body?.name, "name");
      const updated = await addVariantToTag(storyId, tagId, name);

      if (!updated) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      res.status(200).json({ tag: toTagResponse(updated) });
    }),
  );

  storyRouter.delete(
    "/:storyId/tags/:tagId/variants/:variantName",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const tagId = assertparamIsString(req.params.tagId, "tagId");
      const rawVariant = assertparamIsString(
        req.params.variantName,
        "variantName",
      );

      await getStoryForUser(storyId, userId);

      const variantName = decodeURIComponent(rawVariant);
      const updated = await deleteVariantFromTag(storyId, tagId, variantName);

      if (!updated) {
        res.status(404).json({ error: "Tag not found" });
        return;
      }

      res.status(200).json({ tag: toTagResponse(updated) });
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

  storyRouter.post(
    "/:storyId/tags/import",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const toStoryId = assertparamIsString(req.params.storyId, "storyId");
      const fromStoryId = requireString(req.body?.fromStoryId, "fromStoryId");
      const tagIds = parseRequiredStringArray(req.body?.tagIds, "tagIds");

      await getStoryForUser(fromStoryId, userId);
      await getStoryForUser(toStoryId, userId);

      const result = await importTagsBetweenStories({
        fromStoryId,
        toStoryId,
        tagIds,
      });

      res.status(201).json({
        createdTags: result.createdTags.map((tag) => toTagResponse(tag)),
        skippedTagIds: result.skippedTagIds,
      });
    }),
  );

  storyRouter.get(
    "/:storyId/plots",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const plots = await listStoryPlotsForUser(storyId, userId);

      res
        .status(200)
        .json({ plots: plots.map((plot) => toPlotResponse(plot)) });
    }),
  );

  storyRouter.get(
    "/:storyId/scenes",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const scenes = await listStoryScenesForUser(storyId, userId);

      res
        .status(200)
        .json({ scenes: scenes.map((scene) => toSceneResponse(scene)) });
    }),
  );

  storyRouter.post(
    "/:storyId/grid-shift",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      await getStoryForUser(storyId, userId);

      const startIndex = requireNumber(req.body?.startIndex, "startIndex");
      const shift = requireNumber(req.body?.shift, "shift");

      const shiftedResources = await shiftStoryGrid(storyId, {
        startIndex,
        shift,
      });

      res.status(200).json({
        shiftedResources: toShiftedResourcesResponse(shiftedResources),
      });
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
        plot: toPlotResponse(plot),
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

      res.status(200).json({ plot: toPlotResponse(updated) });
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
