import { ObjectId } from "mongodb";

export interface PlotForOrder {
  _id: ObjectId;
  title: string;
  color: string;
  horizontalIndex: number;
}

export interface SceneForOrder {
  _id: ObjectId;
  title: string;
  description: string;
  plotId: ObjectId;
  tags: ObjectId[];
  tagVariants?: Array<{ tagId: ObjectId; variant: string }>;
  todo: Array<{ text: string; isDone: boolean }>;
  snippets: Array<{ label: string; text: string }>;
  verticalIndex: number;
  pov?: ObjectId | null;
}

export interface SectionForOrder {
  _id: ObjectId;
  title: string;
  type: "act" | "chapter";
  description?: string;
  verticalIndex: number;
}

export type ListViewEntry =
  | { kind: "scene"; scene: SceneForOrder; plot: PlotForOrder }
  | { kind: "section"; section: SectionForOrder };

const getVerticalIndex = (entry: ListViewEntry): number =>
  entry.kind === "scene"
    ? entry.scene.verticalIndex
    : entry.section.verticalIndex;

const getTitle = (entry: ListViewEntry): string =>
  entry.kind === "scene" ? entry.scene.title : entry.section.title;

const getHorizontalIndex = (entry: ListViewEntry): number | undefined =>
  entry.kind === "scene" ? entry.plot.horizontalIndex : undefined;

const compareEntries = (a: ListViewEntry, b: ListViewEntry): number => {
  const vertDiff = getVerticalIndex(a) - getVerticalIndex(b);
  if (vertDiff !== 0) return vertDiff;

  const aH = getHorizontalIndex(a);
  const bH = getHorizontalIndex(b);
  if (aH !== undefined && bH !== undefined) {
    const horizDiff = aH - bH;
    if (horizDiff !== 0) return horizDiff;
  }

  return getTitle(a).localeCompare(getTitle(b));
};

export const orderForExport = (
  plots: PlotForOrder[],
  scenes: SceneForOrder[],
  sections: SectionForOrder[],
): ListViewEntry[] => {
  const plotById = new Map(plots.map((p) => [p._id.toHexString(), p]));

  const entries: ListViewEntry[] = [];

  for (const scene of scenes) {
    const plot = plotById.get(scene.plotId.toHexString());
    if (plot) {
      entries.push({ kind: "scene", scene, plot });
    }
  }

  for (const section of sections) {
    entries.push({ kind: "section", section });
  }

  return entries.sort(compareEntries);
};

export const sanitizeFilename = (title: string): string => {
  return (
    title
      // eslint-disable-next-line no-control-regex
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "_")
      .replace(/^\.+/, "")
      .slice(0, 200) || "story"
  );
};
