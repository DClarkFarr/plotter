import type { Express } from "express";
import type { ImportParseResult } from "../types/importOutline";
import { parseImportOutlineDocx } from "./importOutlineParser";
import { createStory } from "../models/stories";
import { createPlot } from "../models/plots";
import { createSection } from "../models/sections";
import { createScene } from "../models/scenes";
import { createTag } from "../models/tags";
import { createCharacter } from "../models/characters";
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

  // T006: Run all DB writes; on failure, hard-delete the story to avoid orphaned data
  let createdStoryId: ObjectId | null = null;
  try {
    const ownerId = ensureObjectId(payload.userId, "userId");

    // T007: Create story and default plot
    const story = await createStory({
      title: storyName,
      description: "",
      users: [{ userId: ownerId, role: "owner" }],
    });
    createdStoryId = story._id;

    const plot = await createPlot({
      title: "Main",
      description: "",
      color: "#6B7280",
      storyId: story._id,
      horizontalIndex: 0,
    });

    // T010: Create tags — group parsed tags by name so variants are merged into one DB tag
    const tagIdMap = new Map<string, ObjectId>();
    const tagGroupMap = new Map<
      string,
      { color: string; variants: string[]; ids: string[] }
    >();
    for (const tag of parsed.tags) {
      const existing = tagGroupMap.get(tag.name);
      if (existing) {
        if (tag.variant && !existing.variants.includes(tag.variant)) {
          existing.variants.push(tag.variant);
        }
        existing.ids.push(tag.id);
      } else {
        tagGroupMap.set(tag.name, {
          color: tag.color ?? "#000000",
          variants: tag.variant ? [tag.variant] : [],
          ids: [tag.id],
        });
      }
    }
    for (const [name, group] of tagGroupMap) {
      const created = await createTag({
        storyId: story._id,
        name,
        color: group.color,
        variant: group.variants.length > 0,
        variants: group.variants,
      });
      for (const id of group.ids) {
        tagIdMap.set(id, created._id);
      }
    }

    // T011: Create characters — story is new, insert each parsed character directly
    const charIdMap = new Map<string, ObjectId>();
    for (const character of parsed.characters) {
      const created = await createCharacter({
        storyId: story._id,
        title: character.name,
      });
      charIdMap.set(character.id, created._id);
    }

    // T008: Iterate elements in document order with shared verticalIndex counter
    let verticalIndex = 0;
    for (const element of parsed.elements) {
      if (element.type === "act") {
        await createSection({
          storyId: story._id,
          title: element.title,
          type: "act",
          verticalIndex: verticalIndex++,
        });
      } else if (element.type === "chapter") {
        await createSection({
          storyId: story._id,
          title: element.title,
          type: "chapter",
          verticalIndex: verticalIndex++,
        });
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

        await createScene({
          plotId: plot._id,
          title: element.title,
          description: "",
          tags,
          tagVariants,
          pov,
          todo: [],
          snippets: [],
          verticalIndex: verticalIndex++,
        });
      }
    }

    return {
      mode: payload.mode,
      summary,
      message: "Import completed",
      storyId: story._id.toHexString(),
      storyName,
    };
  } catch (err) {
    // T009: Write failed — attempt to remove partially-created story
    console.error("Caught error importing story", err);
    if (createdStoryId !== null) {
      await getClient()
        .db()
        .collection("stories")
        .deleteOne({ _id: createdStoryId })
        .catch((cleanupErr) =>
          console.error("Failed to clean up partial story", cleanupErr),
        );
    }
    return {
      mode: payload.mode,
      summary,
      storyName,
      message: "Import failed. No data was saved.",
    };
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
