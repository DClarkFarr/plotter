import type { Express } from "express";
import { createStoryForOwner } from "./storyService";

export type ImportOutlineMode = "preview" | "create";

export type ImportOutlineResult = {
  mode: ImportOutlineMode;
  summary: string;
  message?: string | null;
  storyId?: string | null;
};

export type ImportOutlinePayload = {
  userId: string;
  mode: ImportOutlineMode;
  file: Express.Multer.File;
};

export const importOutlineForStory = async (
  payload: ImportOutlinePayload,
): Promise<ImportOutlineResult> => {
  const summary = "TODO";

  if (payload.mode === "preview") {
    return { mode: payload.mode, summary };
  }

  const baseTitle = payload.file.originalname.replace(/\.docx$/i, "").trim();
  const title = baseTitle || "Imported outline";
  const story = await createStoryForOwner({ title, ownerId: payload.userId });

  return {
    mode: payload.mode,
    summary,
    message: "Import completed",
    storyId: story._id.toHexString(),
  };
};
