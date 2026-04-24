# Research: Import Versions — Plot Warning Fix & Plot-as-Resource

**Branch**: `046-import-outline-versions`  
**Phase**: Addendum (post-implementation clarification round)

---

## Decision 1 — Plot Heading Recognition (Change 1.1)

**Question**: Should a warning fire when a heading at `PLOT_HEADING_SIZE` does not start with `|`?

**Decision**: No warning when either condition is satisfied:

- heading level equals `PLOT_HEADING_SIZE` (H4), OR
- heading text starts with `|`

Both forms are valid plot headings. The `|` prefix is the visual convention exported by
`storyExportService.ts`, but plain H4 headings should also be silently accepted.

**Rationale**: The current warning breaks round-trips where the export produces `| Plot Title:`
as H4, but a human-authored document may use a bare H4 without the pipe prefix. Emitting a
warning causes confusion because the heading is still processed as a plot — the warning adds
noise without protecting any invariant.

**Implementation**: Inside the `headingLevel === PLOT_HEADING_SIZE` branch:

- Always accept the node as a plot heading.
- Strip the `|` prefix if present before extracting the title.
- Remove the "Modern plot heading should start with '|'" warning entirely.

**Alternatives considered**:

- Keep the warning but demote it to `info` level — rejected, unnecessary noise.
- Add a separate paragraph-fallback path for bare pipes — already exists from prior fix; no
  duplication needed.

---

## Decision 2 — Plots as a Separate Parsed Resource (Change 2.1–2.3)

**Question**: Should plots parsed by the modern importer be returned as `Tag` objects or as a
distinct `Plot` resource, and how does that affect the frontend preview UI?

**Decision**: Add a first-class `plots` array to `ImportParseResult` (and the API response).
Plot headings emit into `result.plots`, not `result.tags`. `SceneElement` gains a `plotIds`
field to reference these plots directly.

**Rationale**:

- The modern format has explicit structural markers for plots (H4 `| Title:`); treating them
  as tags and relying on the user to "Convert to plot" in the UI wastes a known signal.
- The preview tabs already have a dedicated Plots tab (`PlotsTab`) that renders
  `customizations.plots`. If we pre-seed that from parsed plots, the round-trip is seamless.
- The legacy flow still goes through the Tag → plot-conversion path (unchanged), so backward
  compatibility is preserved.

**Data shape**:

```
ImportPlot { id, name, color | null }
SceneElement { ..., plotIds: string[] }          // new field alongside tagIds
ImportParseResult { ..., plots: ImportPlot[] }   // new field alongside tags
```

**Frontend seeding**:
When the preview mutation returns `plots`, `ImportOutlineModal` builds
`ImportPlotCustomization[]` entries from them and inserts them after `main_plot_id` in
`customizations.plots`. The Plots tab renders immediately — no manual toggle required.

**"Tag to plot conversion" compatibility**:
The Tags tab "Convert to plot" toggle must continue to work for legacy imports (and for any
modern import that also has bracket-tag rows). Parser-supplied plots appear on the Plots tab;
tag-promoted plots also appear on the Plots tab via the existing toggle mechanism. They do not
conflict because they use different IDs (`tag_N` vs `plot_N`).

**Elements tab**:
`ImportOutlineParseSceneElement` gains an optional `plotIds?: string[]` field. The Elements
tab in `ImportOutlinePreviewTabs` will show plot badges alongside existing tag badges when
`plotIds` is non-empty. A new `plots` prop (the parser-returned plots array) is passed to
`ImportOutlinePreviewTabs` so the elements tab can resolve plot names by ID.

**Alternatives considered**:

- Merge plots and tags into a single discriminated union — adds type complexity with no benefit.
- Keep plots as tags and auto-toggle "Convert to plot" for `| ` prefixed tags — a hack that
  pollutes the Tags tab with items the user never needs to review.
- Separate the Plots tab source from `customizations` — rejected; existing PlotsTab already
  reads from `customizations.plots` and that is also what the submit payload uses. Pre-seeding
  is simpler than dual data paths.

---

## Summary of Resolved Unknowns

| Unknown                                | Resolution                                              |
| -------------------------------------- | ------------------------------------------------------- |
| Warning for pipe-less H4 plot heading  | Remove warning; H4 is always valid                      |
| How to expose parsed plots to frontend | New `plots` field on response + pre-seed customizations |
| Scene references to parsed plots       | New `plotIds` on `SceneElement` / API type              |
| Legacy "Convert to plot" toggle        | Unchanged; still works for tag-to-plot promotion        |
| Elements tab display of plots          | Add `plotIds` badge rendering alongside tag badges      |
