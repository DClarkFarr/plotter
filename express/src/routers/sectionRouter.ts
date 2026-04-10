import express from "express";
import { ValidationError } from "../services/authService";
import {
  createSectionForStory,
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
      } = {
        section: toSectionResponse(created.section),
      };

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
      } = {
        section: toSectionResponse(updated.section),
      };

      res.status(200).json(payload);
    }),
  );
};

applySectionRoutes();
