import express from "express";
import { ValidationError } from "../services/authService";
import {
  createSectionForStory,
  deleteSectionForStory,
  listSectionsForStory,
  updateSectionForStory,
} from "../services/sectionService";
import { getStoryForUser } from "../services/storyService";
import {
  optionalNumber,
  optionalString,
  requireNumber,
  requireString,
  requireUserId,
} from "../utils/validators";
import { assertparamIsString } from "../utils/routes";
import { handleAsync } from "../utils/asyncHandler";
import type { SceneSnippet, SceneTodoItem } from "../models/scenes";

export const sectionRouter = express.Router({ mergeParams: true });

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

const toShiftedResourcesResponse = (resources: {
  scenes: Array<Parameters<typeof toSceneResponse>[0]>;
  sections: Array<Parameters<typeof toSectionResponse>[0]>;
}) => ({
  scenes: resources.scenes.map((scene) => toSceneResponse(scene)),
  sections: resources.sections.map((section) => toSectionResponse(section)),
});

const parseSectionType = (value: unknown): "act" | "section" => {
  const type = requireString(value, "type");
  if (type !== "act" && type !== "section") {
    throw new ValidationError("type", "type must be act or section");
  }
  return type;
};

const applySectionRoutes = () => {
  sectionRouter.get(
    "/:storyId/sections",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      await getStoryForUser(storyId, userId);
      const sections = await listSectionsForStory(storyId);

      res.status(200).json({
        sections: sections.map((section) => toSectionResponse(section)),
      });
    }),
  );

  sectionRouter.post(
    "/:storyId/sections",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      await getStoryForUser(storyId, userId);

      const title = requireString(req.body?.title, "title");
      const verticalIndex = requireNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );
      const type = parseSectionType(req.body?.type);

      const created = await createSectionForStory(storyId, {
        storyId,
        title,
        verticalIndex,
        type,
      });

      const payload: {
        section: ReturnType<typeof toSectionResponse>;
        shiftedResources?: ReturnType<typeof toShiftedResourcesResponse>;
      } = {
        section: toSectionResponse(created.section),
      };

      if (created.shiftedResources) {
        payload.shiftedResources = toShiftedResourcesResponse(
          created.shiftedResources,
        );
      }

      res.status(201).json(payload);
    }),
  );

  sectionRouter.patch(
    "/:storyId/sections/:sectionId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const sectionId = assertparamIsString(req.params.sectionId, "sectionId");

      await getStoryForUser(storyId, userId);

      const title = optionalString(req.body?.title, "title");
      const verticalIndex = optionalNumber(
        req.body?.verticalIndex,
        "verticalIndex",
      );
      const rawType = req.body?.type;

      const updates = {
        ...(title !== undefined && { title }),
        ...(verticalIndex !== undefined && { verticalIndex }),
        ...(rawType !== undefined && { type: parseSectionType(rawType) }),
      };

      const updated = await updateSectionForStory(storyId, sectionId, updates);
      if (!updated.section) {
        res.status(404).json({ error: "Section not found" });
        return;
      }

      const payload: {
        section: ReturnType<typeof toSectionResponse>;
        shiftedResources?: ReturnType<typeof toShiftedResourcesResponse>;
      } = {
        section: toSectionResponse(updated.section),
      };

      if (updated.shiftedResources) {
        payload.shiftedResources = toShiftedResourcesResponse(
          updated.shiftedResources,
        );
      }

      res.status(200).json(payload);
    }),
  );

  sectionRouter.delete(
    "/:storyId/sections/:sectionId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const sectionId = assertparamIsString(req.params.sectionId, "sectionId");

      await getStoryForUser(storyId, userId);

      const deleted = await deleteSectionForStory(storyId, sectionId);
      if (!deleted.deleted) {
        res.status(404).json({ error: "Section not found" });
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

applySectionRoutes();
