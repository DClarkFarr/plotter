# Data Model: Import Versions — Plot-as-Resource Addendum

**Branch**: `046-import-outline-versions`

---

## Backend Types — `express/src/types/importOutline.ts`

### New type: `ImportPlot`

```ts
export type ImportPlot = {
  id: string; // e.g. "plot_1", "plot_2"
  name: string; // display name, stripped of "|" prefix and trailing ":"
  color: string | null; // resolved from formatting run colour in the docx
};
```

### Modified: `SceneElement`

Add `plotIds: string[]` alongside the existing `tagIds` field.

```ts
export interface SceneElement extends BaseElementType<"scene"> {
  id: string;
  title: string;
  povCharacterId: string | null;
  tagIds: string[]; // unchanged — bracket-tag rows
  plotIds: string[]; // NEW — parser-resolved plot IDs
  characterIds: string[];
  snippets: Snippet[];
  content: string[];
}
```

### Modified: `ImportParseResult`

Add `plots: ImportPlot[]` alongside the existing `tags` field.

```ts
export type ImportParseResult = {
  elements: Element[];
  tags: Tag[];
  plots: ImportPlot[]; // NEW
  characters: Character[];
  issues: ImportIssue[];
};
```

---

## Frontend Types — `web/src/api/types.ts`

### New interface: `ImportOutlineParsePlot`

```ts
export interface ImportOutlineParsePlot {
  id: string;
  name: string;
  color: string | null;
}
```

### Modified: `ImportOutlineParseSceneElement`

Add optional `plotIds` field:

```ts
export interface ImportOutlineParseSceneElement {
  id: string;
  type: "scene";
  title: string;
  povCharacterId: string | null;
  tagIds: string[];
  plotIds?: string[]; // NEW
  characterIds: string[];
  content: string[];
}
```

### Modified: `ImportOutlineResponse`

Add optional `plots` field:

```ts
export interface ImportOutlineResponse {
  mode: ImportOutlineMode;
  storyName: string;
  summary: string;
  message?: string | null;
  storyId?: string | null;
  elements?: ImportOutlineParseElement[];
  tags?: ImportOutlineParseTag[];
  plots?: ImportOutlineParsePlot[]; // NEW
  characters?: ImportOutlineParseCharacter[];
  issues?: ImportOutlineParseIssue[];
}
```

---

## Parser State Changes — `importOutlineModernParser.ts`

### Removed state variable

- `pendingPlotTagId: string | null` → replaced by `pendingPlotId: string | null`
  (same role, but now references `ImportPlot.id` instead of a `Tag.id`)

### New helper: `ensurePlot`

```ts
const ensurePlot = (
  result: ImportParseResult,
  plotMap: Map<string, ImportPlot>,
  name: string,
  color: string | null,
): ImportPlot => { ... };
```

Maps `buildTagKey(name, null)` → de-duplication key; auto-increments `plot_N` IDs.

### Plot heading branch

Old:

```
if (headingLevel === PLOT_HEADING_SIZE) {
  if (!headingText.startsWith("|")) { warn + skip }
  ...ensureTag(result, tagMap, ...)
  pendingPlotTagId = plotTag.id;
}
```

New:

```
if (headingLevel === PLOT_HEADING_SIZE) {
  // Accept with or without "|" prefix — no warning
  const plotTitle = headingText.replace(/^\|+\s*/, "").replace(/:\s*$/, "").trim();
  if (!plotTitle) { warn + skip }
  const plot = ensurePlot(result, plotMap, plotTitle, plotColor);
  pendingPlotId = plot.id;
}
```

### Paragraph fallback (already present)

The existing `rawNodeText.startsWith("|")` paragraph fallback should also call `ensurePlot`
instead of `ensureTag`.

### Scene branch

```ts
const scenePlotIds: string[] = [];
if (pendingPlotId) {
  scenePlotIds.push(pendingPlotId);
  pendingPlotId = null;
}
// scene.plotIds = scenePlotIds  (instead of scene.tagIds receiving the plot)
```

`scene.tagIds` is populated only from bracket-tag rows (unchanged).

---

## Frontend: `ImportOutlinePreviewTabs.tsx`

### New prop on `ImportOutlinePreviewTabsProps`

```ts
plots: ImportOutlineParsePlot[];
```

### `ElementsTab` changes

Receives `plots` prop. For each `scene` element, render `plotIds` badges in addition to `tagIds`
badges (using a distinct visual style, e.g. tinted).

### `PlotsTab` — no structural change

`PlotsTab` continues to render `customizations.plots`. Pre-seeded parser plots appear here
automatically once the customizations are seeded (handled in modal, not the tab component).

---

## Frontend: `ImportOutlineModal.tsx`

### Customization seeding on preview success

After `mutateAsync` returns in `handlePreview`, if `result.plots` is non-empty:

```ts
const parserPlots: ImportPlotCustomization[] = (result.plots ?? []).map(
  (p, idx) => ({
    id: p.id,
    name: p.name,
    color:
      p.color ??
      DEFAULT_PALETTE_COLORS[idx % DEFAULT_PALETTE_COLORS.length] ??
      "#729cfd",
    isDefaultPlot: false,
    ignored: false,
  }),
);
setCustomizations({
  ignoredCharacterIds: [],
  characterMerges: {},
  plots: [{ ...DEFAULT_MAIN_PLOT }, ...parserPlots],
});
```

When `result.plots` is empty or absent (legacy import), `plots` stays as `[DEFAULT_MAIN_PLOT]`
(unchanged legacy behaviour).

---

## State Transition Diagram

```
Modern import preview response
          │
          ├─ result.plots non-empty?
          │         │
          │         YES → seed customizations.plots with DEFAULT_MAIN_PLOT + parserPlots
          │         NO  → customizations.plots = [DEFAULT_MAIN_PLOT]  (legacy path, unchanged)
          │
          ▼
     Preview tab renders
          │
          ├─ Plots tab: shows customizations.plots (pre-seeded from parser or manually set)
          ├─ Tags tab:  shows result.tags (bracket-tag rows); "Convert to plot" toggle still works
          └─ Elements tab: scene rows show both tagIds badges and plotIds badges
```
