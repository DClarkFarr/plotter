import express from "express";

// The 'mergeParams: true' option is crucial here.
// It allows the child router to access parameters from the parent route's path (e.g., :albumId).
export const apiRouter = express.Router({ mergeParams: true });

apiRouter.use(express.json({ limit: "1mb" }));
apiRouter.use(express.urlencoded({ extended: true }));
