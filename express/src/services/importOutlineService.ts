import type { Express } from "express";
import { createStoryForOwner } from "./storyService";

export type ImportOutlineMode = "preview" | "create";

export type ImportOutlineResult = {
  mode: ImportOutlineMode;
  summary: string;
  message?: string | null;
  storyId?: string | null;
  storyName: string;
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
  const summary = "TODO";

  const storyName =
    (payload.storyName?.trim() || payload.file.originalname)
      .replace(/\.docx$/i, "")
      .trim() || "Imported outline";

  if (payload.mode === "preview") {
    return {
      mode: payload.mode,
      summary,
      storyName,
    };
  }

  const baseTitle = payload.file.originalname.replace(/\.docx$/i, "").trim();
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
