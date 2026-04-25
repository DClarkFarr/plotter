# Data Model: Modern Import Syntax Guide

**Branch**: `050-import-syntax-guide`

---

## Overview

This feature introduces no new backend entities, database collections, or API contract
changes. It is a purely frontend UI addition.

---

## Component Model

### `ModernImportInstructions` (new component)

Co-located in `web/src/components/dashboard/ImportOutlineModal.tsx`.

**Props**: none (static content component)

**Sections rendered**:

| Section             | Content                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Document Structure  | Acts (H1), Chapters (H2), Scenes (H3) with layout example                                  |
| Scene POV Character | `Character Name: Scene Title` syntax with example                                          |
| Plots               | H4 heading form and `\| PlotName` paragraph form, color note                               |
| Tags                | `[Tag]` and `[Tag:Variant]` bracket row after scene heading, multi-tag example, color note |
| Snippets            | Indented paragraphs (≥ ~1 cm), H5 / colon-suffix heading option, example                   |

---

## Replacement in `ImportOutlineModal`

The existing inline JSX fragment rendered when `importType === "modern"` (currently two
small `<div className="space-y-2">` sections listing bullet points) is **replaced** with:

```tsx
<ModernImportInstructions />
```

No state, no props, no mutations — the component is fully static.

---

## Parser Constants (reference — no change)

These constants in `importOutlineModernParser.ts` drive the documented behavior. They
are listed here for traceability; the component must match them exactly.

```ts
const snippetIndentThresholdTwips = 600; // ≈ 1 cm
const ACT_HEADING_SIZE = 1;
const CHAPTER_HEADING_SIZE = 2;
const SCENE_HEADING_SIZE = 3;
const PLOT_HEADING_SIZE = 4;
const SNIPPET_HEADING_SIZE = 5;
```
