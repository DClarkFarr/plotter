import { Collection, Document } from "mongodb";
import { db } from "../utils/db";

export const getCollection = <T extends Document>(
  name: string,
): Collection<T> => db!.collection<T>(name);

export const COLLECTIONS = {
  plots: "plots",
  sessions: "sessions",
} as const;
