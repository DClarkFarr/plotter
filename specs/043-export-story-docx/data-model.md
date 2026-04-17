# Data Model: Export Story to .docx

**Feature**: 043-export-story-docx  
**Phase**: 1 — Design  
**Date**: 2026-04-16

---

## Overview

The export feature is **read-only** — no new collections or MongoDB documents are written. This document describes the data shapes flowing through the export pipeline: from the database query results, through an in-memory ordering step, to the docx assembly primitives.

---

## 1. Input Data (server-side, read from MongoDB)

All queries are scoped to a single `storyId` and run in parallel.

### StoryDocument (for title / ownership check)

```ts
interface StoryExportInput {
  _id: ObjectId;
  title: string;
  users: string[]; // checked for ownership
}
```

### PlotDocument (for ordering + label)

```ts
interface PlotExportInput {
  _id: ObjectId;
  storyId: string;
  title: string;
  color: string; // hex — used for scene border color hint in docx
  horizontalIndex: number; // sort key for tie-breaking within same verticalIndex
}
```

### SceneDocument (active scenes only)

```ts
interface SceneExportInput {
  _id: ObjectId;
  storyId: string;
  title: string;
  description: string; // Tiptap HTML
  plotId: string;
  tags: string[]; // Tag _id references
  tagVariants: Array<{ tagId: string; variant: string }>;
  snippets: Array<{ label: string; text: string }>; // text is Tiptap HTML
  todo: Array<{ text: string; isDone: boolean }>; // not exported (out of scope)
  verticalIndex: number; // primary sort key
  pov: string | null; // Character _id reference
  deletedAt: null; // active-only filter applied in model
}
```

### SectionDocument

```ts
interface SectionExportInput {
  _id: ObjectId;
  storyId: string;
  title: string;
  type: "act" | "chapter";
  description?: string | null; // Tiptap HTML
  verticalIndex: number; // sort key
}
```

### TagDocument (lookup map by id)

```ts
interface TagExportInput {
  _id: ObjectId;
  storyId: string;
  name: string;
  color: string; // hex color for shaded label in docx
}
```

### CharacterDocument (lookup map by id)

```ts
interface CharacterExportInput {
  _id: ObjectId;
  storyId: string;
  name: string;
}
```

---

## 2. Ordered Export Sequence

The same ordering logic as the list view is applied server-side in `listViewOrder.ts`:

```ts
type ListViewEntry =
  | { kind: "section"; item: SectionExportInput }
  | { kind: "scene"; item: SceneExportInput };

function orderForExport(
  plots: PlotExportInput[],
  scenes: SceneExportInput[],
  sections: SectionExportInput[],
): ListViewEntry[];
```

**Sort rules** (identical to `web/src/utils/listViewOrdering.ts`):

1. Merge sections and scenes into a single array using `verticalIndex` as the primary sort key.
2. When `verticalIndex` values are equal (scenes only), sort by plot `horizontalIndex` then by scene `title` ascending.
3. Sections always sort before scenes at the same `verticalIndex`.

---

## 3. Docx Assembly Shape

The `storyExportService.ts` transforms the ordered sequence into docx `Paragraph[]` via `buildDocxParagraphs()`:

```ts
type TagColorMap = Map<string, { name: string; color: string }>;
type CharacterMap = Map<string, { name: string }>;

interface ExportContext {
  plotMap: Map<string, PlotExportInput>;
  tagMap: TagColorMap;
  characterMap: CharacterMap;
}

function buildDocxParagraphs(
  storyTitle: string,
  entries: ListViewEntry[],
  context: ExportContext,
): Paragraph[];
```

### Paragraph mapping rules

| Source element              | Docx representation                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Story title                 | `Paragraph` with `heading: HeadingLevel.TITLE`                                                                                                    |
| Section — type `"act"`      | `Paragraph` with `heading: HeadingLevel.HEADING_1`, text = section title                                                                          |
| Section description         | `Paragraph[]` from `htmlToDocxRuns(description)`                                                                                                  |
| Section — type `"chapter"`  | `Paragraph` with `heading: HeadingLevel.HEADING_2`, text = section title                                                                          |
| Scene title                 | `Paragraph` with `heading: HeadingLevel.HEADING_3`, text = scene title                                                                            |
| Plot label                  | `Paragraph` with small-caps `TextRun`, text = plot title (uppercase), muted color `#888888`                                                       |
| POV character               | `Paragraph` with `TextRun`, prefix "POV: ", character name, color `#555555`                                                                       |
| Tag row                     | `Paragraph` containing one shaded `TextRun` per tag; each run: background = tag hex color, text color = computed contrast, text = `" {tagName} "` |
| Scene description           | `Paragraph[]` from `htmlToDocxRuns(description)`                                                                                                  |
| Snippet label               | `Paragraph` with `TextRun` in small-caps, text = snippet label uppercase, color `#888888`                                                         |
| Snippet body                | `Paragraph[]` from `htmlToDocxRuns(text)` with `font: "Courier New"` override                                                                     |
| Blank spacer between scenes | Empty `Paragraph`                                                                                                                                 |

---

## 4. HTML → Docx Primitive Mapping (`htmlToDocx.ts`)

Input: Tiptap HTML string  
Output: `Paragraph[]` (from `docx` library)

### Supported HTML → docx mappings

| HTML element / attribute            | Docx equivalent                                                    |
| ----------------------------------- | ------------------------------------------------------------------ |
| `<p>`                               | `Paragraph` containing inline `TextRun[]`                          |
| `<strong>` / `<b>`                  | `TextRun({ bold: true })`                                          |
| `<em>` / `<i>`                      | `TextRun({ italics: true })`                                       |
| `<u>`                               | `TextRun({ underline: {} })`                                       |
| `<s>` / `<del>`                     | `TextRun({ strike: true })`                                        |
| `<br>`                              | `TextRun({ break: 1 })`                                            |
| `<span style="font-weight: bold">`  | `TextRun({ bold: true })`                                          |
| `<span style="font-style: italic">` | `TextRun({ italics: true })`                                       |
| `<span style="color: #rrggbb">`     | `TextRun({ color: "rrggbb" })`                                     |
| `<span style="font-size: Npx">`     | `TextRun({ size: N * 1.5 })` (px → half-points approx)             |
| `<ul>`                              | `Paragraph({ numbering: { reference: "bullet", level: depth } })`  |
| `<ol>`                              | `Paragraph({ numbering: { reference: "ordered", level: depth } })` |
| `<li>`                              | Paragraph within the list context                                  |
| `<h1>`–`<h4>`                       | `Paragraph({ heading: HeadingLevel.HEADING_1..4 })`                |
| Unknown element                     | Fall back to its text content as a plain `TextRun`                 |
| Empty/null HTML                     | Returns `[ new Paragraph("") ]` (no crash)                         |

---

## 5. Tag Contrast Color Computation

```ts
function contrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "000000" : "FFFFFF";
}
```

---

## 6. Toast Duration Formula (frontend)

```ts
const EXPORT_BASE_MS = 5_000;
const EXPORT_PER_SCENE_MS = 300;
const EXPORT_MAX_MS = 60_000;

export function computeExportToastDuration(sceneCount: number): number {
  return Math.min(
    EXPORT_BASE_MS + sceneCount * EXPORT_PER_SCENE_MS,
    EXPORT_MAX_MS,
  );
}
```

`sceneCount` is derived from the `StoryStats` already available in the dashboard query result (no extra fetch needed).

---

## 7. filename Sanitisation

```ts
function sanitizeFilename(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // strip invalid chars
      .replace(/\s+/g, "_") // spaces → underscores
      .replace(/^\.+/, "") // no leading dots
      .slice(0, 200) || // max length
    "story"
  ); // fallback if empty
}
// Result used in: Content-Disposition: attachment; filename="<sanitized>.docx"
```
