import { Collection, Db, Document } from "mongodb";

export const getCollection = <T extends Document>(
  db: Db,
  name: string,
): Collection<T> => db.collection<T>(name);

export interface PlotDocument extends Document {
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getPlotsCollection = (db: Db): Collection<PlotDocument> =>
  getCollection<PlotDocument>(db, "plots");
