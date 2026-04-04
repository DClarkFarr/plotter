import express from "express";
import { ValidationError } from "../services/authService";
import {
  createCharacterForStory,
  deleteCharacterForStory,
  listCharactersForStory,
  updateCharacterForStory,
} from "../services/characterService";
import { getStoryForUser } from "../services/storyService";
import type {
  CharacteristicFields,
  CharacterList,
  CreateCharacterInput,
  CustomCharacteristic,
} from "../models/characters";
import {
  optionalString,
  optionalStringArray,
  requireString,
  requireUserId,
} from "../utils/validators";
import { assertparamIsString } from "../utils/routes";
import { handleAsync } from "../utils/asyncHandler";

export const characterRouter = express.Router({ mergeParams: true });

const toCharacterResponse = (character: {
  _id: { toHexString(): string };
  storyId: { toHexString(): string };
  title: string;
  description?: string;
  imageUrl?: string;
  characteristics?: CharacteristicFields;
  customCharacteristics?: CustomCharacteristic[];
  lists?: CharacterList[];
}) => ({
  id: character._id.toHexString(),
  storyId: character.storyId.toHexString(),
  title: character.title,
  description: character.description ?? null,
  imageUrl: character.imageUrl ?? null,
  characteristics: character.characteristics ?? null,
  customCharacteristics: character.customCharacteristics ?? [],
  lists: character.lists ?? [],
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

const parseCharacteristics = (
  value: unknown,
): CharacteristicFields | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("characteristics", "characteristics is invalid");
  }

  const raw = value as Record<string, unknown>;
  const payload: CharacteristicFields = {};

  const description = parseOptionalStringField(raw.description, "description");
  if (description !== undefined) payload.description = description;

  const history = parseOptionalStringField(raw.history, "history");
  if (history !== undefined) payload.history = history;

  const height = parseOptionalStringField(raw.height, "height");
  if (height !== undefined) payload.height = height;

  const weight = parseOptionalStringField(raw.weight, "weight");
  if (weight !== undefined) payload.weight = weight;

  const age = parseOptionalStringField(raw.age, "age");
  if (age !== undefined) payload.age = age;

  const hair = parseOptionalStringField(raw.hair, "hair");
  if (hair !== undefined) payload.hair = hair;

  const eyeColor = parseOptionalStringField(raw.eyeColor, "eyeColor");
  if (eyeColor !== undefined) payload.eyeColor = eyeColor;

  const mantra = parseOptionalStringField(raw.mantra, "mantra");
  if (mantra !== undefined) payload.mantra = mantra;

  const skinColor = parseOptionalStringField(raw.skinColor, "skinColor");
  if (skinColor !== undefined) payload.skinColor = skinColor;

  const build = parseOptionalStringField(raw.build, "build");
  if (build !== undefined) payload.build = build;

  return payload;
};

const parseCustomCharacteristics = (
  value: unknown,
): CustomCharacteristic[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(
      "customCharacteristics",
      "customCharacteristics must be an array",
    );
  }

  return value.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new ValidationError(
        `customCharacteristics[${index}]`,
        "customCharacteristics entry is invalid",
      );
    }

    const record = entry as Record<string, unknown>;
    return {
      label: requireString(
        record.label,
        `customCharacteristics[${index}].label`,
      ),
      value: requireString(
        record.value,
        `customCharacteristics[${index}].value`,
      ),
    };
  });
};

const parseCharacterLists = (value: unknown): CharacterList[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("lists", "lists must be an array");
  }

  return value.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new ValidationError(`lists[${index}]`, "lists entry is invalid");
    }

    const record = entry as Record<string, unknown>;
    const label = requireString(record.label, `lists[${index}].label`);
    const items = optionalStringArray(record.items, `lists[${index}].items`);

    return {
      label,
      items: items ?? [],
    };
  });
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
      const characteristics = parseCharacteristics(req.body?.characteristics);
      const customCharacteristics = parseCustomCharacteristics(
        req.body?.customCharacteristics,
      );
      const lists = parseCharacterLists(req.body?.lists);

      const toSet: CreateCharacterInput = { storyId, title };
      if (description !== undefined) {
        toSet.description = description;
      }
      if (imageUrl !== undefined) {
        toSet.imageUrl = imageUrl;
      }
      if (characteristics !== undefined) {
        toSet.characteristics = characteristics;
      }
      if (customCharacteristics !== undefined) {
        toSet.customCharacteristics = customCharacteristics;
      }
      if (lists !== undefined) {
        toSet.lists = lists;
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
      const characteristics = parseCharacteristics(req.body?.characteristics);
      const customCharacteristics = parseCustomCharacteristics(
        req.body?.customCharacteristics,
      );
      const lists = parseCharacterLists(req.body?.lists);

      if (
        title === undefined &&
        description === undefined &&
        imageUrl === undefined &&
        characteristics === undefined &&
        customCharacteristics === undefined &&
        lists === undefined
      ) {
        throw new ValidationError("body", "Update payload is empty");
      }

      const updated = await updateCharacterForStory(storyId, characterId, {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(characteristics !== undefined && { characteristics }),
        ...(customCharacteristics !== undefined && { customCharacteristics }),
        ...(lists !== undefined && { lists }),
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
