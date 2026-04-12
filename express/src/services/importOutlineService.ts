import type { Express } from "express";
import type { ImportParseResult, Tag } from "../types/importOutline";
import { parseImportOutlineDocx } from "./importOutlineParser";
import { createStory } from "../models/stories";
import { createPlot } from "../models/plots";
import { createSection } from "../models/sections";
import { createScene } from "../models/scenes";
import { createTag, findTagByName, appendTagVariant } from "../models/tags";
import { createCharacter, findCharacterByTitle } from "../models/characters";
import { ensureObjectId } from "../models/types";
import { getClient } from "../utils/mongo";
import type { ObjectId } from "mongodb";

export type ImportOutlineMode = "preview" | "create";

export type ImportOutlineResult = {
  mode: ImportOutlineMode;
  summary: string;
  message?: string | null;
  storyId?: string | null;
  storyName: string;
  elements?: ImportParseResult["elements"];
  tags?: ImportParseResult["tags"];
  characters?: ImportParseResult["characters"];
  issues?: ImportParseResult["issues"];
};

export type ImportOutlinePayload = {
  userId: string;
  mode: ImportOutlineMode;
  file: Express.Multer.File;
  storyName?: string;
};

export const importOutlineForStory = async (
  payload: ImportOutlinePayload,
): Promise<ImportOutlineResult> => {
  const parsed = await parseImportOutlineDocx(payload.file.buffer);
  const summary = buildImportSummary(parsed);
  const hasErrorIssues = parsed.issues.some((issue) => issue.level === "error");

  const storyName =
    (payload.storyName?.trim() || payload.file.originalname)
      .replace(/\.docx$/i, "")
      .trim() || "Imported outline";

  if (payload.mode === "preview") {
    return {
      mode: payload.mode,
      summary,
      storyName,
      elements: parsed.elements,
      tags: parsed.tags,
      characters: parsed.characters,
      issues: parsed.issues,
    };
  }

  if (hasErrorIssues) {
    return {
      mode: payload.mode,
      summary,
      storyName,
      elements: parsed.elements,
      tags: parsed.tags,
      characters: parsed.characters,
      issues: parsed.issues,
    };
  }

  // T005: Guard — reject if no scene elements
  const hasScenes = parsed.elements.some((el) => el.type === "scene");
  if (!hasScenes) {
    return {
      mode: payload.mode,
      summary,
      storyName,
      message: "The document contains no scenes and cannot be imported",
      issues: [
        {
          level: "error",
          message: "No scenes found in document",
          location: null,
        },
      ],
    };
  }

  // T006: Open transaction session and run all DB writes atomically
  const session = getClient().startSession();
  try {
    let storyId: string;

    await session.withTransaction(async () => {
      const ownerId = ensureObjectId(payload.userId, "userId");

      // T007: Create story and default plot
      const story = await createStory(
        {
          title: storyName,
          description: "",
          users: [{ userId: ownerId, role: "owner" }],
        },
        session,
      );

      const plot = await createPlot(
        {
          title: "Main",
          description: "",
          color: "#6B7280",
          storyId: story._id,
          horizontalIndex: 0,
        },
        session,
      );

      // T010: Resolve/create tags — build tagIdMap before element loop
      const tagIdMap = new Map<string, ObjectId>();
      for (const tag of parsed.tags) {
        const existing = await findTagByName(story._id, tag.name, session);
        if (existing) {
          if (tag.variant && !existing.variants.includes(tag.variant)) {
            await appendTagVariant(existing._id, tag.variant, session);
          }
          tagIdMap.set(tag.id, existing._id);
        } else {
          const created = await createTag(
            {
              storyId: story._id,
              name: tag.name,
              color: tag.color ?? "#000000",
              variant: tag.variant !== null,
              variants: tag.variant ? [tag.variant] : [],
            },
            session,
          );
          tagIdMap.set(tag.id, created._id);
        }
      }

      // T011: Resolve/create characters — build charIdMap before element loop
      const charIdMap = new Map<string, ObjectId>();
      for (const character of parsed.characters) {
        const existing = await findCharacterByTitle(
          story._id,
          character.name,
          session,
        );
        if (existing) {
          charIdMap.set(character.id, existing._id);
        } else {
          const created = await createCharacter(
            { storyId: story._id, title: character.name },
            session,
          );
          charIdMap.set(character.id, created._id);
        }
      }

      // T008: Iterate elements in document order with shared verticalIndex counter
      let verticalIndex = 0;
      for (const element of parsed.elements) {
        if (element.type === "act") {
          await createSection(
            {
              storyId: story._id,
              title: element.title,
              type: "act",
              verticalIndex: verticalIndex++,
            },
            session,
          );
        } else if (element.type === "chapter") {
          await createSection(
            {
              storyId: story._id,
              title: element.title,
              type: "chapter",
              verticalIndex: verticalIndex++,
            },
            session,
          );
        } else if (element.type === "scene") {
          // T012: Map tag IDs and build tagVariants
          const tags = element.tagIds
            .map((id) => tagIdMap.get(id))
            .filter((id): id is ObjectId => id !== undefined);

          const tagVariants = element.tagIds
            .map((id) => {
              const tagDbId = tagIdMap.get(id);
              const parsedTag = parsed.tags.find((t) => t.id === id);
              if (!tagDbId || !parsedTag?.variant) {
                return null;
              }
              return { tagId: tagDbId, variant: parsedTag.variant };
            })
            .filter(
              (entry): entry is { tagId: ObjectId; variant: string } =>
                entry !== null,
            );

          // T013: Resolve POV character
          const pov = element.povCharacterId
            ? (charIdMap.get(element.povCharacterId) ?? null)
            : null;

          await createScene(
            {
              plotId: plot._id,
              title: element.title,
              description: "",
              tags,
              tagVariants,
              pov,
              todo: [],
              snippets: [],
              verticalIndex: verticalIndex++,
            },
            session,
          );
        }
      }

      storyId = story._id.toHexString();
    });

    return {
      mode: payload.mode,
      summary,
      message: "Import completed",
      storyId: storyId!,
      storyName,
    };
  } catch {
    // T009: Transaction failed — no partial data persisted
    return {
      mode: payload.mode,
      summary,
      storyName,
      message: "Import failed. No data was saved.",
    };
  } finally {
    await session.endSession();
  }
};

const buildImportSummary = (parsed: ImportParseResult): string => {
  const counts = parsed.elements.reduce(
    (acc, element) => {
      if (element.type === "act") {
        acc.acts += 1;
      } else if (element.type === "chapter") {
        acc.chapters += 1;
      } else if (element.type === "scene") {
        acc.scenes += 1;
      }
      return acc;
    },
    { acts: 0, chapters: 0, scenes: 0 },
  );

  return `Parsed ${counts.acts} acts, ${counts.chapters} chapters, ${counts.scenes} scenes.`;
};
