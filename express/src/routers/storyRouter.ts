import express, { Request, Response } from "express";
import { AuthError, ValidationError } from "../services/authService";
import {
  createStoryForOwner,
  getStoryForUser,
  getStoryStats,
  listStoriesForUser,
} from "../services/storyService";
import { requireString } from "../utils/validators";

export const storyRouter = express.Router({ mergeParams: true });

type AsyncHandler = (req: Request, res: Response) => Promise<void>;

const handleAsync =
  (handler: AsyncHandler): AsyncHandler =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(res, error);
    }
  };

type SessionWithUser = Request & {
  session?: {
    userId?: string;
  };
};

const requireUserId = (req: Request): string => {
  const session = (req as SessionWithUser).session;
  if (!session?.userId) {
    throw new AuthError("Unauthorized", 401);
  }

  return session.userId;
};

const resolveOwnerId = (
  users: Array<{ userId: { toHexString(): string }; role: string }>,
): string => {
  const owner = users.find((permission) => permission.role === "owner");
  if (!owner) {
    return users[0]?.userId.toHexString() ?? "";
  }

  return owner.userId.toHexString();
};

const toStoryResponse = (
  story: {
    _id: { toHexString(): string };
    title: string;
    description: string;
    users: Array<{ userId: { toHexString(): string }; role: string }>;
    createdAt: Date;
    updatedAt?: Date;
  },
  stats: { plots: number; scenes: number },
) => ({
  id: story._id.toHexString(),
  title: story.title,
  description: story.description ?? null,
  ownerId: resolveOwnerId(story.users),
  stats,
  createdAt: story.createdAt.toISOString(),
  updatedAt: story.updatedAt ? story.updatedAt.toISOString() : null,
});

const handleError = (res: Response, error: unknown): void => {
  if (error instanceof AuthError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.status).json({ error: error.message, field: error.field });
    return;
  }

  if (error instanceof Error) {
    if (error.message === "Story not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    if (
      error.message.includes("required") ||
      error.message.startsWith("Invalid") ||
      error.message.includes("must") ||
      error.message.includes("unknown")
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
  }

  res.status(500).json({ error: "Unexpected error" });
};

const applyStoryRoutes = () => {
  storyRouter.get(
    "/",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const stories = await listStoriesForUser(userId);
      const storiesWithStats = await Promise.all(
        stories.map(async (story) => {
          const stats = await getStoryStats(story._id);
          return toStoryResponse(story, stats);
        }),
      );

      res.status(200).json({ stories: storiesWithStats });
    }),
  );

  storyRouter.get(
    "/:storyId",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const storyId = req.params.storyId;
      const story = await getStoryForUser(storyId, userId);
      if (!story) {
        res.status(404).json({ error: "Story not found" });
        return;
      }

      const stats = await getStoryStats(story._id);
      res.status(200).json({ story: toStoryResponse(story, stats) });
    }),
  );

  storyRouter.post(
    "/",
    handleAsync(async (req, res) => {
      const userId = requireUserId(req);
      const title = requireString(req.body?.title, "title");
      const story = await createStoryForOwner({ title, ownerId: userId });
      const stats = await getStoryStats(story._id);

      res.status(201).json({ story: toStoryResponse(story, stats) });
    }),
  );
};

applyStoryRoutes();
