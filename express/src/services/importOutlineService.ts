import type { Express } from "express";
import type {
  ImportCustomizations,
  ImportNormalizationReport,
  ImportOutlineType,
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
import {
  buildCharacterKey,
  buildTagKey,
  canonicalizeDisplayName,
  canonicalizeTag,
} from "../utils/importNormalization";
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
  plots?: ImportParseResult["plots"];
  characters?: ImportParseResult["characters"];
  issues?: ImportParseResult["issues"];
  normalization?: ImportNormalizationReport;
};

export type ImportOutlinePayload = {
  userId: string;
  mode: ImportOutlineMode;
  importType?: ImportOutlineType;
  file: Express.Multer.File;
  storyName?: string;
  customizations?: ImportCustomizations | null;
};

const toSortedArray = (values: Set<string>): string[] =>
  Array.from(values).sort((a, b) => a.localeCompare(b));

const buildNormalizationReport = (
  parsed: ImportParseResult,
): ImportNormalizationReport => {
  const tags = parsed.tags
    .map((tag) => {
      const rawVariants =
        tag.rawVariants && tag.rawVariants.length > 0
          ? Array.from(new Set(tag.rawVariants))
          : [tag.variant ? `${tag.name}:${tag.variant}` : tag.name];
      return {
        canonicalName: tag.variant ? `${tag.name}: ${tag.variant}` : tag.name,
        rawVariants,
        consolidatedCount: rawVariants.length,
        reusedExisting: false,
      };
    })
    .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

  const characters = parsed.characters
    .map((character) => {
      const rawVariants =
        character.rawVariants && character.rawVariants.length > 0
          ? Array.from(new Set(character.rawVariants))
          : [character.name];
      return {
        canonicalName: character.name,
        rawVariants,
        consolidatedCount: rawVariants.length,
        reusedExisting: false,
      };
    })
    .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

  return {
    tags,
    characters,
    counts: {
      tagVariantsConsolidated: tags.reduce(
        (sum, entry) => sum + Math.max(entry.consolidatedCount - 1, 0),
        0,
      ),
      characterVariantsConsolidated: characters.reduce(
        (sum, entry) => sum + Math.max(entry.consolidatedCount - 1, 0),
        0,
      ),
      newNamesCreated: 0,
      existingNamesReused: 0,
    },
  };
};

export const importOutlineForStory = async (
  payload: ImportOutlinePayload,
): Promise<ImportOutlineResult> => {
  const parsed = await parseImportOutlineDocx(
    payload.file.buffer,
    payload.importType ?? "legacy",
  );
  const summary = buildImportSummary(parsed);
  const hasErrorIssues = parsed.issues.some((issue) => issue.level === "error");
  const normalization = buildNormalizationReport(parsed);

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
      plots: parsed.plots,
      characters: parsed.characters,
      issues: parsed.issues,
      normalization,
    };
  }

  if (hasErrorIssues) {
    return {
      mode: payload.mode,
      summary,
      storyName,
      elements: parsed.elements,
      tags: parsed.tags,
      plots: parsed.plots,
      characters: parsed.characters,
      issues: parsed.issues,
      normalization,
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
      normalization,
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

    const normalizationTagsByKey = new Map<
      string,
      ImportNormalizationReport["tags"][number]
    >();
    parsed.tags.forEach((tag, index) => {
      const entry = normalization.tags[index];
      if (!entry) {
        return;
      }
      normalizationTagsByKey.set(buildTagKey(tag.name, tag.variant), entry);
    });

    const normalizationCharactersByKey = new Map<
      string,
      ImportNormalizationReport["characters"][number]
    >();
    parsed.characters.forEach((character, index) => {
      const entry = normalization.characters[index];
      if (!entry) {
        return;
      }
      normalizationCharactersByKey.set(
        buildCharacterKey(character.name),
        entry,
      );
    });

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
    const canonicalVariantByTagId = new Map<string, string | null>();
    const tagGroupMap = new Map<
      string,
      {
        canonicalName: string;
        canonicalVariant: string | null;
        color: string;
        variants: Set<string>;
        ids: string[];
        rawVariants: Set<string>;
      }
    >();
    for (const tag of parsed.tags) {
      if (plotMap.has(tag.id)) {
        // This tag is a plot — skip tag document creation
        continue;
      }
      const key = buildTagKey(tag.name, tag.variant);
      const canonical = canonicalizeTag(tag.name, tag.variant);
      const canonicalName = canonical.name || tag.name.trim();
      const canonicalVariant = canonical.variant;
      canonicalVariantByTagId.set(tag.id, canonicalVariant);
      const existing = tagGroupMap.get(key);
      const rawVariants =
        tag.rawVariants && tag.rawVariants.length > 0
          ? tag.rawVariants
          : [tag.variant ? `${tag.name}:${tag.variant}` : tag.name];

      if (existing) {
        if (canonicalVariant) {
          existing.variants.add(canonicalVariant);
        }
        existing.ids.push(tag.id);
        for (const raw of rawVariants) {
          existing.rawVariants.add(raw);
        }
      } else {
        tagGroupMap.set(key, {
          canonicalName,
          canonicalVariant,
          color: tag.color ?? "#000000",
          variants: canonicalVariant ? new Set([canonicalVariant]) : new Set(),
          ids: [tag.id],
          rawVariants: new Set(rawVariants),
        });
      }
    }

    for (const [key, group] of tagGroupMap) {
      const created = await createTag({
        storyId: story._id,
        name: group.canonicalName,
        color: group.color,
        variant: group.variants.size > 0,
        variants: toSortedArray(group.variants),
      });
      normalization.counts.newNamesCreated += 1;
      const tagEntry = normalizationTagsByKey.get(key);
      if (tagEntry) {
        tagEntry.canonicalName = group.canonicalVariant
          ? `${group.canonicalName}: ${group.canonicalVariant}`
          : group.canonicalName;
        tagEntry.rawVariants = toSortedArray(group.rawVariants);
        tagEntry.consolidatedCount = tagEntry.rawVariants.length;
      }
      for (const id of group.ids) {
        tagIdMap.set(id, created._id);
      }
    }

    // T011+T016: Create characters — skip ignored IDs and merge-source IDs
    const charIdMap = new Map<string, ObjectId>();
    const characterGroupMap = new Map<
      string,
      { canonicalName: string; ids: string[]; rawVariants: Set<string> }
    >();
    for (const character of parsed.characters) {
      const key = buildCharacterKey(character.name);
      const canonicalName = canonicalizeDisplayName(character.name);
      const existing = characterGroupMap.get(key);
      const rawVariants =
        character.rawVariants && character.rawVariants.length > 0
          ? character.rawVariants
          : [character.name];

      if (existing) {
        existing.ids.push(character.id);
        for (const raw of rawVariants) {
          existing.rawVariants.add(raw);
        }
      } else {
        characterGroupMap.set(key, {
          canonicalName: canonicalName || character.name.trim(),
          ids: [character.id],
          rawVariants: new Set(rawVariants),
        });
      }
    }

    for (const [key, group] of characterGroupMap) {
      const activeIds = group.ids.filter((id) => !characterSkipIds.has(id));
      if (activeIds.length === 0) {
        continue;
      }

      const created = await createCharacter({
        storyId: story._id,
        title: group.canonicalName,
      });
      normalization.counts.newNamesCreated += 1;
      const characterEntry = normalizationCharactersByKey.get(key);
      if (characterEntry) {
        characterEntry.canonicalName = group.canonicalName;
        characterEntry.rawVariants = toSortedArray(group.rawVariants);
        characterEntry.consolidatedCount = characterEntry.rawVariants.length;
      }

      for (const id of activeIds) {
        charIdMap.set(id, created._id);
      }
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
        // T027: Prefer explicit scene.plotIds, while keeping legacy tag->plot conversion fallback.
        const plotRefsFromScene = element.plotIds.filter((id) =>
          plotMap.has(id),
        );
        const plotTagRefs =
          plotRefsFromScene.length > 0
            ? plotRefsFromScene
            : element.tagIds.filter((id) => plotMap.has(id));
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
            const canonicalVariant = canonicalVariantByTagId.get(id);
            if (!tagDbId || !canonicalVariant) {
              return null;
            }
            return { tagId: tagDbId, variant: canonicalVariant };
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
            label: s.label,
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
      normalization,
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
      normalization,
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
