import express from "express";
import { ValidationError } from "../services/authService";
import { getStoryColors, updateStoryColor } from "../services/colorService";
import { handleAsync } from "../utils/asyncHandler";
import { assertparamIsString } from "../utils/routes";
import { requireUserId } from "../utils/validators";

export const colorRouter = express.Router({ mergeParams: true });

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

colorRouter.get(
  "/:storyId/colors",
  handleAsync(async (req, res) => {
    const userId = requireUserId(req);
    const storyId = assertparamIsString(req.params.storyId, "storyId");

    const colors = await getStoryColors(storyId, userId);
    res.json(colors);
  }),
);

colorRouter.patch(
  "/:storyId/colors/:colorId",
  handleAsync(async (req, res) => {
    const userId = requireUserId(req);
    const storyId = assertparamIsString(req.params.storyId, "storyId");
    const colorId = assertparamIsString(req.params.colorId, "colorId");

    const body = req.body as Record<string, unknown>;
    const patch: { color?: string; ignored?: boolean; sortOrder?: number } = {};

    if (body.color !== undefined) {
      if (typeof body.color !== "string" || !HEX_COLOR_RE.test(body.color)) {
        throw new ValidationError(
          "color",
          "color must be a valid 6-digit hex string (e.g. #3b82f6)",
        );
      }
      patch.color = body.color.toLowerCase();
    }

    if (body.ignored !== undefined) {
      if (typeof body.ignored !== "boolean") {
        throw new ValidationError("ignored", "ignored must be a boolean");
      }
      patch.ignored = body.ignored;
    }

    if (body.sortOrder !== undefined) {
      const so = Number(body.sortOrder);
      if (!Number.isInteger(so) || so < 1 || so > 10) {
        throw new ValidationError(
          "sortOrder",
          "sortOrder must be an integer between 1 and 10",
        );
      }
      patch.sortOrder = so;
    }

    if (Object.keys(patch).length === 0) {
      throw new ValidationError("body", "at least one field must be provided");
    }

    const updated = await updateStoryColor(storyId, colorId, userId, patch);
    if (!updated) {
      res.status(404).json({ message: "Color not found" });
      return;
    }

    res.json(updated);
  }),
);
