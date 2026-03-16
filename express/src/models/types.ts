import { Document, WithId } from "mongodb";

export type BaseModelBlueprint = Record<string, unknown>;

export type ModelBlueprint<TBlueprint extends BaseModelBlueprint> = Document &
  TBlueprint;

export type ModelDocument<TBlueprint extends BaseModelBlueprint> = WithId<
  ModelBlueprint<
    TBlueprint & {
      createdAt: Date;
      updatedAt?: Date;
    }
  >
>;
