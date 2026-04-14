# Research: Fix Plot Customizations Submission on Import

## Q1: Where does plot UI state currently live, and why doesn't it reach the server?

**Decision**: Plot UI state (color, default selection) is stored in `previewData.tags` via `onChangeTags`, but `handleApprove` only submits `customizations` — which has no place for plot metadata. Tags are display-only; they never reach the server's `ImportCustomizations` shape.

**Rationale**: The tags array was re-used as a convenient holder for the `isDefaultPlot`/`color` fields, but `customizations` is the only thing serialized into the POST body via `JSON.stringify(input.customizations)`. The fix is to move plot state entirely into `customizations`.

**Alternatives considered**: Adding a separate `plotCustomizations` top-level field to `ImportOutlineInput` — rejected as it creates a parallel data flow when `customizations` is already the right home.

---

## Q2: What shape should plot customizations take in `ImportCustomizations`?

**Decision**: Replace `plotTagIds: string[]` with `plots: ImportPlotCustomization[]`, where each entry carries:

```ts
{
  id: string; // tag ID ("main_plot_id" for synthetic Main)
  name: string; // display name used to title the DB plot
  color: string; // hex color
  isDefaultPlot: boolean;
  ignored: boolean;
}
```

**Rationale**: An array of objects is richer than a parallel array of IDs + a separate color map. It keeps all per-plot settings co-located, is easy to validate on the server, and maps directly onto the DB `createPlot` call. The `ignored` flag replaces a separate "ignoredPlotIds" concept.

**Alternatives considered**:

- Keep `plotTagIds` + add `plotColors: Record<string,string>` + `defaultPlotId: string` — rejected as three separate fields for one concept.
- Keep `plotTagIds` for backwards compat + add `plotMeta` — rejected as unnecessary complexity.

---

## Q3: How does the server determine `horizontalIndex` (plot order / default)?

**Decision**: The plot with `isDefaultPlot: true` (and not `ignored`) receives `horizontalIndex: 0`. All remaining non-ignored plots get consecutive indices starting from 1, preserving their order in the `customizations.plots` array. If no plot has `isDefaultPlot: true`, the first non-ignored plot defaults to index 0.

**Rationale**: The existing code already uses `horizontalIndex: 0` to designate the "Main" plot as primary. This convention is preserved — we simply allow any plot to occupy that slot.

**Alternatives considered**: Adding a dedicated `isDefault` DB field to the `Plot` model — rejected as out of scope; the existing horizontal index convention is sufficient.

---

## Q4: What happens to the synthetic "Main" plot entry?

**Decision**: The "Main" plot (`id: "main_plot_id"`) is always seeded in `customizations.plots` on the client as the first entry with `isDefaultPlot: true`. Its color defaults to `#729cfd` (already used as `defaultPlotTag.color` in the modal). On the server, it is treated identically to other plot entries — its title is always "Main", its color and ignored/default flags come from the customization object. It is no longer hardcoded in the service.

**Rationale**: Centralizing all plot creation through `customizations.plots` removes the hardcoded `#6B7280` colour and makes the "Main" plot fully controllable.

**Alternatives considered**: Keeping the hardcoded Main plot creation and only adding colour/default to tag-converted plots — rejected because that leaves the Main plot's colour non-configurable and creates two code paths.

---

## Q5: What happens if the ignored Main plot is the only plot?

**Decision**: If all plots in `customizations.plots` are ignored, the server falls back to creating a synthetic "Main" plot with `color: "#729cfd"` and `horizontalIndex: 0` so the story always has at least one plot.

**Rationale**: Stories require at least one plot for scenes to be assigned. A hard guard ensures import never produces an orphaned-scene state.

---

## Q6: How does the Tags tab interact with the new structure?

**Decision**: When a tag is checked "Convert to plot", a new `ImportPlotCustomization` entry is appended to `customizations.plots` (with `ignored: false`, `isDefaultPlot: false`, default colour from the `colors` palette at that index). When unchecked, the entry is removed — and if it had `isDefaultPlot: true`, the "Main" plot's `isDefaultPlot` is restored to `true` so there is always exactly one default.

**Rationale**: Keeps a single source of truth in `customizations`. The Plots tab reads and writes only from `customizations.plots`.

---

## Q7: Does removing `onChangeTags` / `previewData.tags` mutation break anything?

**Decision**: No. The `previewData.tags` array is used only as display input: the Elements tab shows tag names on scenes, and the Tags tab lists available tags. Neither requires `isDefaultPlot` or custom colors — those are plot-only fields. Removing the tags mutation path simplifies the modal significantly.

**Rationale**: `previewData` is parse output; it should be read-only. All user-driven state belongs in `customizations`.
