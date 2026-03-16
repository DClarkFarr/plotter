import { Db } from "mongodb";
import { getPlotsCollection, PlotDocument } from "../models/collections";

export interface ListPlotsOptions {
  limit?: number;
}

export const listPlots = async (
  db: Db,
  options: ListPlotsOptions = {},
): Promise<PlotDocument[]> => {
  const collection = getPlotsCollection(db);
  const limit = options.limit ?? 50;

  return collection.find({}).limit(limit).toArray();
};
