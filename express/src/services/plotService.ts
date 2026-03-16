import { getPlotsCollection, PlotDocument } from "../models/plots";

export interface ListPlotsOptions {
  limit?: number;
}

export const listPlots = async (
  options: ListPlotsOptions = {},
): Promise<PlotDocument[]> => {
  const collection = getPlotsCollection();
  const limit = options.limit ?? 50;

  return collection.find({}).limit(limit).toArray();
};
