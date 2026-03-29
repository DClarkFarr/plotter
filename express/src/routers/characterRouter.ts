import express, { Request, Response } from "express";
import { AuthError, ValidationError } from "../services/authService";
import {
  createCharacterForStory,
  deleteCharacterForStory,
  listCharactersForStory,
  updateCharacterForStory,
} from "../services/characterService";
import { getStoryForUser } from "../services/storyService";
import type { CreateCharacterInput } from "../models/characters";
import {
  optionalString,
  requireString,
  requireUserId,
} from "../utils/validators";
import { assertparamIsString } from "../utils/routes";

export const characterRouter = express.Router({ mergeParams: true });

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

const toCharacterResponse = (character: {
  _id: { toHexString(): string };
  storyId: { toHexString(): string };
  title: string;
  description?: string;
  imageUrl?: string;
}) => ({
  id: character._id.toHexString(),
  storyId: character.storyId.toHexString(),
  title: character.title,
  description: character.description ?? null,
  imageUrl: character.imageUrl ?? null,
});

const parseOptionalStringField = (
  value: unknown,
  label: string,
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return optionalString(value, label);
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
    if (error.message === "Story not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message === "Character is assigned to scenes") {
      res.status(409).json({ error: error.message });
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

const applyCharacterRoutes = () => {
  characterRouter.get(
    "/:storyId/characters",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        throw new Error("Story not found");
      }

      const characters = await listCharactersForStory(storyId);
      res.status(200).json({
        characters: characters.map((character) =>
          toCharacterResponse(character),
        ),
      });
    }),
  );

  characterRouter.post(
    "/:storyId/characters",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        throw new Error("Story not found");
      }

      const title = requireString(req.body?.title, "title");
      const description = parseOptionalStringField(
        req.body?.description,
        "description",
      );
      const imageUrl = parseOptionalStringField(req.body?.imageUrl, "imageUrl");

      const toSet: CreateCharacterInput = { storyId, title };
      if (description !== undefined) {
        toSet.description = description;
      }
      if (imageUrl !== undefined) {
        toSet.imageUrl = imageUrl;
      }

      const created = await createCharacterForStory(toSet);

      res.status(201).json({ character: toCharacterResponse(created) });
    }),
  );

  characterRouter.patch(
    "/:storyId/characters/:characterId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const characterId = assertparamIsString(
        req.params.characterId,
        "characterId",
      );

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        throw new Error("Story not found");
      }

      const title = parseOptionalStringField(req.body?.title, "title");
      const description = parseOptionalStringField(
        req.body?.description,
        "description",
      );
      const imageUrl = parseOptionalStringField(req.body?.imageUrl, "imageUrl");

      if (
        title === undefined &&
        description === undefined &&
        imageUrl === undefined
      ) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const updated = await updateCharacterForStory(storyId, characterId, {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      });

      if (!updated) {
        res.status(404).json({ error: "Character not found" });
        return;
      }

      res.status(200).json({ character: toCharacterResponse(updated) });
    }),
  );

  characterRouter.delete(
    "/:storyId/characters/:characterId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = assertparamIsString(req.params.storyId, "storyId");
      const characterId = assertparamIsString(
        req.params.characterId,
        "characterId",
      );

      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        throw new Error("Story not found");
      }

      const deleted = await deleteCharacterForStory(storyId, characterId);
      if (!deleted) {
        res.status(404).json({ error: "Character not found" });
        return;
      }

      res.status(204).send();
    }),
  );
};

applyCharacterRoutes();
