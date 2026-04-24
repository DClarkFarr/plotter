import type { ImportOutlineType, ImportParseResult } from "../types/importOutline";
import { parseImportOutlineLegacyDocx } from "./importOutlineLegacyParser";
import { parseImportOutlineModernDocx } from "./importOutlineModernParser";

export const parseImportOutlineDocx = async (
  fileBuffer: Buffer,
  importType: ImportOutlineType = "legacy",
): Promise<ImportParseResult> => {
  if (importType === "modern") {
    return parseImportOutlineModernDocx(fileBuffer);
  }

  return parseImportOutlineLegacyDocx(fileBuffer);
};
