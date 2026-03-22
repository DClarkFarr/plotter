import express, { Request, Response } from "express";
import {
  AuthSession,
  AuthError,
  confirmPasswordReset,
  getCurrentUser,
  login,
  requestPasswordReset,
  signup,
  ValidationError,
} from "../services/authService";

export const authRouter = express.Router({ mergeParams: true });

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

const getSession = (req: Request): AuthSession =>
  (req as Request & { session: AuthSession }).session;

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
    if (error.message === "Email already in use") {
      res.status(409).json({ error: error.message });
      return;
    }

    if (error.message.startsWith("Too many attempts")) {
      res.status(429).json({ error: error.message });
      return;
    }

    if (
      error.message.includes("required") ||
      error.message.startsWith("Invalid")
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
  }

  res.status(500).json({ error: "Unexpected error" });
};

const applyAuthRoutes = () => {
  authRouter.post(
    "/signup",
    handleAsync(async (req, res) => {
      const ipAddress = req.ip ?? "unknown";
      const sessionData = getSession(req);
      const user = await signup(
        {
          firstName: req.body?.firstName,
          lastName: req.body?.lastName,
          email: req.body?.email,
          password: req.body?.password,
          ipAddress,
        },
        sessionData,
      );

      res.status(201).json({ user });
    }),
  );

  authRouter.post(
    "/login",
    handleAsync(async (req, res) => {
      const ipAddress = req.ip ?? "unknown";
      const sessionData = getSession(req);
      const user = await login(
        {
          email: req.body?.email,
          password: req.body?.password,
          ipAddress,
        },
        sessionData,
      );

      res.status(200).json({ user });
    }),
  );

  authRouter.post(
    "/logout",
    handleAsync(async (req, res) => {
      const sessionData = getSession(req);
      await sessionData.destroy((err) => {
        if (err instanceof Error) {
          console.error("Error destroying session:", err);
        } else {
        }
      });

      res
        .clearCookie("plotter.sid")
        .status(200)
        .json({ message: "Logged out" });
    }),
  );

  authRouter.post(
    "/reset-password/request",
    handleAsync(async (req, res) => {
      const ipAddress = req.ip ?? "unknown";
      await requestPasswordReset({
        email: req.body?.email,
        ipAddress,
      });

      res.status(200).json({
        message: "If the account exists, instructions have been sent.",
      });
    }),
  );

  authRouter.post(
    "/reset-password/confirm",
    handleAsync(async (req, res) => {
      const ipAddress = req.ip ?? "unknown";
      await confirmPasswordReset({
        token: req.body?.token,
        password: req.body?.password,
        ipAddress,
      });

      res.status(200).json({ message: "Password updated" });
    }),
  );

  authRouter.get(
    "/me",
    handleAsync(async (req, res) => {
      const sessionData = getSession(req);
      const user = await getCurrentUser(sessionData);
      res.status(200).json({ user });
    }),
  );
};

applyAuthRoutes();
