import { Collection } from "mongodb";
import { COLLECTIONS, getCollection } from "./collections";
import { BaseModelBlueprint, ModelBlueprint, ModelDocument } from "./types";

export interface PlotDefinition extends BaseModelBlueprint {
  title: string;
}

export type PlotBlueprint = ModelBlueprint<PlotDefinition>;
export type PlotDocument = ModelDocument<PlotDefinition>;

export const getPlotsCollection = (): Collection<PlotDocument> =>
  getCollection<PlotDocument>(COLLECTIONS.plots);
