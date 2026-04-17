import {
  Document,
  HeadingLevel,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
} from "docx";
import { ObjectId } from "mongodb";
import { listPlots } from "../models/plots";
import { listScenesByPlotIds } from "../models/scenes";
import { listSectionsByStoryId } from "../models/sections";
import { listTags } from "../models/tags";
import { listCharacters } from "../models/characters";
import { getStoryById } from "../models/stories";
import {
  orderForExport,
  sanitizeFilename,
  type ListViewEntry,
  type PlotForOrder,
} from "../utils/listViewOrder";
import {
  contrastColor,
  htmlToDocxParagraphs,
  NUMBERING_CONFIG,
} from "../utils/htmlToDocx";

// ── Types ────────────────────────────────────────────────────────────────────

interface TagInfo {
  name: string;
  color: string;
}

interface CharacterInfo {
  name: string;
}

interface ExportContext {
  plotMap: Map<string, PlotForOrder>;
  tagMap: Map<string, TagInfo>;
  characterMap: Map<string, CharacterInfo>;
}

// ── Document paragraphs builder ───────────────────────────────────────────────

const buildDocxParagraphs = (
  storyTitle: string,
  entries: ListViewEntry[],
  context: ExportContext,
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // Story title
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: storyTitle })],
    }),
  );

  for (const entry of entries) {
    if (entry.kind === "section") {
      const { section } = entry;

      // Section heading
      paragraphs.push(
        new Paragraph({
          heading:
            section.type === "act"
              ? HeadingLevel.HEADING_1
              : HeadingLevel.HEADING_2,
          children: [new TextRun({ text: section.title })],
        }),
      );

      // Section description (optional rich text)
      if (section.description) {
        paragraphs.push(...htmlToDocxParagraphs(section.description));
      }
    } else {
      const { scene, plot } = entry;

      // Scene title — H3
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: scene.title })],
        }),
      );

      // Plot label — muted, all caps, small
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: plot.title.toUpperCase(),
              color: "888888",
              size: 18,
              allCaps: true,
            }),
          ],
        }),
      );

      // POV character
      if (scene.pov) {
        const charInfo = context.characterMap.get(
          scene.pov instanceof ObjectId
            ? scene.pov.toHexString()
            : String(scene.pov),
        );
        if (charInfo) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: "POV: ", color: "555555" }),
                new TextRun({ text: charInfo.name, color: "555555" }),
              ],
            }),
          );
        }
      }

      // Tags row
      if (scene.tags.length > 0) {
        const tagRuns: TextRun[] = [];
        for (const tagId of scene.tags) {
          const tagIdStr =
            tagId instanceof ObjectId ? tagId.toHexString() : String(tagId);
          const tagInfo = context.tagMap.get(tagIdStr);
          if (!tagInfo) continue;

          const bgHex = tagInfo.color.replace(/^#/, "");
          const textHex = contrastColor(tagInfo.color);

          if (tagRuns.length > 0) {
            tagRuns.push(new TextRun({ text: " " }));
          }
          tagRuns.push(
            new TextRun({
              text: ` ${tagInfo.name} `,
              color: textHex,
              shading: { fill: bgHex },
            }),
          );
        }
        if (tagRuns.length > 0) {
          paragraphs.push(new Paragraph({ children: tagRuns }));
        }
      }

      // Scene description
      if (scene.description) {
        paragraphs.push(...htmlToDocxParagraphs(scene.description));
      }

      // Snippets
      for (const snippet of scene.snippets) {
        // Snippet label
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: snippet.label.toUpperCase(),
                color: "888888",
                size: 18,
                allCaps: true,
              }),
            ],
          }),
        );
        // Snippet body in monospace
        if (snippet.text) {
          paragraphs.push(...htmlToDocxParagraphs(snippet.text, "Courier New"));
        }
      }

      // Spacer between scenes
      paragraphs.push(new Paragraph(""));
    }
  }

  return paragraphs;
};

// ── Main export function ──────────────────────────────────────────────────────

export interface StoryExportResult {
  buffer: Buffer;
  filename: string;
}

export const exportStoryToDocx = async (
  storyId: string,
): Promise<StoryExportResult> => {
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }

  try {
    // Fetch all required data in parallel
    const [plots, sections, tags, characters] = await Promise.all([
      listPlots({ storyId }),
      listSectionsByStoryId(storyId),
      listTags({ storyId }),
      listCharacters({ storyId }),
    ]);

    const plotIds = plots.map((p) => p._id);
    const scenes = await listScenesByPlotIds(plotIds);

    // Build lookup maps
    const plotMap = new Map(plots.map((p) => [p._id.toHexString(), p]));
    const tagMap = new Map<string, TagInfo>(
      tags.map((t) => [t._id.toHexString(), { name: t.name, color: t.color }]),
    );
    const characterMap = new Map<string, CharacterInfo>(
      characters.map((c) => [c._id.toHexString(), { name: c.title }]),
    );

    const context: ExportContext = { plotMap, tagMap, characterMap };

    // Order entries like the list view
    const entries = orderForExport(plots, scenes, sections);

    // Build docx paragraphs
    const bodyParagraphs = buildDocxParagraphs(story.title, entries, context);

    const doc = new Document({
      numbering: NUMBERING_CONFIG,
      sections: [
        {
          children: bodyParagraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${sanitizeFilename(story.title)}.docx`;

    return { buffer, filename };
  } catch (err) {
    console.error(
      "[storyExportService] Export failed for storyId=%s:",
      storyId,
      err,
    );
    throw new Error("Export failed");
  }
};
