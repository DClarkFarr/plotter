import { Router } from "express";

export const applyNestedRouter = (
  router: Router,
  path: string,
  nestedRouter: Router,
) => {
  router.use(path, nestedRouter);
};
