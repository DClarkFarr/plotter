import type { Express } from "express";
import type { ImportParseResult } from "../types/importOutline";
import { parseImportOutlineDocx } from "./importOutlineParser";
import { createStoryForOwner } from "./storyService";

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

  const story = await createStoryForOwner({
    title: storyName,
    ownerId: payload.userId,
  });

  return {
    mode: payload.mode,
    summary,
    message: "Import completed",
    storyId: story._id.toHexString(),
    storyName,
  };
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
