import express from "express";
import multer from "multer";
import { ValidationError } from "../services/authService";
import { importOutlineForStory } from "../services/importOutlineService";
import { handleAsync } from "../utils/asyncHandler";
import { handleError } from "../utils/errorHandler";
import {
  optionalString,
  requireString,
  requireUserId,
} from "../utils/validators";

export const importRouter = express.Router({ mergeParams: true });

const docxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isDocxMime =
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDocxName = file.originalname.toLowerCase().endsWith(".docx");

    if (!isDocxMime && !isDocxName) {
      callback(new ValidationError("file", "File must be a .docx document"));
      return;
    }

    callback(null, true);
  },
});

const handleDocxUpload = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  docxUpload.single("file")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ message: "File too large" });
        return;
      }
    }

    handleError(req, res, error);
  });
};

importRouter.post(
  "/outline",
  handleDocxUpload,
  handleAsync(async (req, res) => {
    const userId = requireUserId(req);
    const modeRaw = requireString(req.body?.mode, "mode");

    if (modeRaw !== "preview" && modeRaw !== "create") {
      throw new ValidationError("mode", "mode must be preview or create");
    }

    if (!req.file) {
      throw new ValidationError("file", "file is required");
    }

    const storyName =
      optionalString(req.body?.storyName, "storyName") ?? req.file.originalname;

    const result = await importOutlineForStory({
      userId,
      mode: modeRaw,
      file: req.file,
      storyName,
    });

    if (
      result.mode === "create" &&
      result.issues?.some((issue) => issue.level === "error")
    ) {
      res.status(422).json(result);
      return;
    }

    const status = result.mode === "preview" ? 200 : 201;
    res.status(status).json(result);
  }),
);
