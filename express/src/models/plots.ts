import { Collection, Document } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";

export interface PlotDocument extends Document {
  title: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getPlotsCollection = (): Collection<PlotDocument> =>
  getCollection<PlotDocument>(COLLECTIONS.plots);
