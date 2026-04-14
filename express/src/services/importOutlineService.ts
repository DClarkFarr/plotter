import type { Express } from "express";
import type {
  ImportCustomizations,
  ImportParseResult,
} from "../types/importOutline";
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
  customizations?: ImportCustomizations | null;
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

    // Resolve customizations (default to empty if not supplied)
    const ignoredCharacterIds = new Set(
      payload.customizations?.ignoredCharacterIds ?? [],
    );
    const characterMerges = payload.customizations?.characterMerges ?? {};
    const plotCustomizations = payload.customizations?.plots ?? [];

    // Build ordered, non-ignored plot list.
    // The entry with isDefaultPlot:true (and not ignored) gets horizontalIndex 0.
    // If none is marked as default, the first non-ignored entry gets index 0.
    // If all are ignored, fall back to a hardcoded Main plot.
    const activePlots = plotCustomizations.filter((p) => !p.ignored);
    const defaultPlotEntry =
      activePlots.find((p) => p.isDefaultPlot) ?? activePlots[0] ?? null;
    const orderedPlots =
      defaultPlotEntry !== null
        ? [
            defaultPlotEntry,
            ...activePlots.filter((p) => p !== defaultPlotEntry),
          ]
        : [];

    if (orderedPlots.length === 0) {
      // Fallback: ensure every story has at least one plot
      orderedPlots.push({
        id: "main_plot_id",
        name: "Main",
        color: "#729cfd",
        isDefaultPlot: true,
        ignored: false,
      });
    }

    // Build plotMap: parsed tag ID → DB Plot ObjectId
    // "main_plot_id" maps to the first created plot (horizontalIndex 0).
    const plotMap = new Map<string, ObjectId>();
    let defaultPlotDbId: ObjectId | null = null;
    for (let i = 0; i < orderedPlots.length; i++) {
      const entry = orderedPlots[i]!;
      const createdPlot = await createPlot({
        title: entry.name,
        description: "",
        color: entry.color,
        storyId: story._id,
        horizontalIndex: i,
      });
      plotMap.set(entry.id, createdPlot._id);
      if (i === 0) {
        defaultPlotDbId = createdPlot._id;
      }
      // For tag-converted plots, also map the tag ID from parsed.tags by name match
      // so scene assignment (plotTagRefs) still resolves correctly.
      for (const parsedTag of parsed.tags) {
        if (
          parsedTag.id !== "main_plot_id" &&
          parsedTag.name === entry.name &&
          parsedTag.variant === null &&
          !plotMap.has(parsedTag.id)
        ) {
          plotMap.set(parsedTag.id, createdPlot._id);
        }
      }
    }

    // The "main" DB plot reference used for scenes without a plot tag
    const plot = { _id: defaultPlotDbId! };

    // Build set of character IDs that should not be created as DB documents:
    // ignored IDs and merge-source IDs (aliases). Aliases get remapped after creation.
    const characterSkipIds = new Set([
      ...ignoredCharacterIds,
      ...Object.keys(characterMerges),
    ]);

    // T026: Create tags — skip IDs that are in plotMap (already became plots)
    const tagIdMap = new Map<string, ObjectId>();
    const tagGroupMap = new Map<
      string,
      { color: string; variants: string[]; ids: string[] }
    >();
    for (const tag of parsed.tags) {
      if (plotMap.has(tag.id)) {
        // This tag is a plot — skip tag document creation
        continue;
      }
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

    // T011+T016: Create characters — skip ignored IDs and merge-source IDs
    const charIdMap = new Map<string, ObjectId>();
    for (const character of parsed.characters) {
      if (characterSkipIds.has(character.id)) {
        continue;
      }
      const created = await createCharacter({
        storyId: story._id,
        title: character.name,
      });
      charIdMap.set(character.id, created._id);
    }
    // Apply merge remappings: scenes referencing a merge-source ID resolve to the target
    for (const [fromId, toId] of Object.entries(characterMerges)) {
      const target = charIdMap.get(toId);
      if (target) {
        charIdMap.set(fromId, target);
      }
    }

    // T008: Iterate elements in document order with shared verticalIndex counter
    let verticalIndex = 0;
    for (const element of parsed.elements) {
      if (element.type === "act") {
        await createSection({
          storyId: story._id,
          title: element.title,
          type: "act",
          description: element.content.join("") || "",
          verticalIndex: verticalIndex++,
        });
      } else if (element.type === "chapter") {
        await createSection({
          storyId: story._id,
          title: element.title,
          type: "chapter",
          description: element.content.join("") || "",
          verticalIndex: verticalIndex++,
        });
      } else if (element.type === "scene") {
        // T027: Separate tagIds into plot refs and normal tag refs
        const plotTagRefs = element.tagIds.filter((id) => plotMap.has(id));
        const normalTagRefs = element.tagIds.filter((id) => !plotMap.has(id));

        // Determine which plot this scene belongs to
        let assignedPlotId = plot._id;
        if (plotTagRefs.length === 1) {
          const firstRef = plotTagRefs[0];
          if (firstRef) assignedPlotId = plotMap.get(firstRef)!;
        } else if (plotTagRefs.length > 1) {
          const firstRef = plotTagRefs[0];
          if (firstRef) assignedPlotId = plotMap.get(firstRef)!;
          parsed.issues.push({
            level: "warning",
            message: `Scene "${element.title}" references multiple plot tags; assigned to the first matching plot.`,
            location: element.id,
          });
        }

        // T012: Map normal tag IDs and build tagVariants
        const tags = normalTagRefs
          .map((id) => tagIdMap.get(id))
          .filter((id): id is ObjectId => id !== undefined);

        const tagVariants = normalTagRefs
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
          plotId: assignedPlotId,
          title: element.title,
          description: element.content.join(""),
          tags,
          tagVariants,
          pov,
          todo: [],
          snippets: element.snippets.map((s, i) => ({
            label: `Unamed snippet ${i + 1}`,
            text: s.content.join(""),
          })),
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
