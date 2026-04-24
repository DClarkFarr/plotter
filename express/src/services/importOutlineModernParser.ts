import type { ImportParseResult } from "../types/importOutline";
import { parseImportOutlineLegacyDocx } from "./importOutlineLegacyParser";

export const parseImportOutlineModernDocx = async (
  fileBuffer: Buffer,
): Promise<ImportParseResult> => {
  // Placeholder implementation for phased rollout. Modern parsing rules will
  // replace this behavior in the next phase.
  return parseImportOutlineLegacyDocx(fileBuffer);
};
