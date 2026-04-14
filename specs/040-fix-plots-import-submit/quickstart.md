# Quickstart: Fix Plot Customizations Submission on Import

## What Changed

The `ImportCustomizations` type's `plotTagIds: string[]` field is replaced by
`plots: ImportPlotCustomization[]`. Each plot entry carries its `id`, `name`,
`color`, `isDefaultPlot`, and `ignored` flags. The `PlotsTab` in the preview
modal now drives all plot state through `customizations` (via `onCustomizationChange`)
instead of mutating `previewData.tags`.

---

## Files to Touch

### Shared types

| File                                 | Change                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| `web/src/api/types.ts`               | Add `ImportPlotCustomization`; update `ImportCustomizations` |
| `express/src/types/importOutline.ts` | Add `ImportPlotCustomization`; update `ImportCustomizations` |

### Server

| File                                           | Change                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `express/src/routers/importRouter.ts`          | Update customizations validation                                                                        |
| `express/src/services/importOutlineService.ts` | Replace `plotTagIds` logic with `plots` array; use custom colours; honour `ignored` and `isDefaultPlot` |

### Client

| File                                                        | Change                                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web/src/components/dashboard/ImportOutlineModal.tsx`       | Update initial customizations; remove `onChangeTags` / `defaultPlotTag`; remove tag injection into `previewData`                                            |
| `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx` | Remove `onChangeTags` prop; update `TagsTab` to write to `customizations.plots`; rewrite `PlotsTab` to read/write `customizations.plots` with ignore toggle |

---

## Key Invariants

1. `customizations.plots` is always initialised with the Main entry (`id: "main_plot_id"`, `isDefaultPlot: true`).
2. Exactly one plot should have `isDefaultPlot: true` at any time. Toggling a plot's default unchecks all others.
3. Unchecking "Convert to plot" in the Tags tab removes the entry from `customizations.plots` and, if that entry was the default, restores `isDefaultPlot: true` on the Main plot.
4. The server iterates `customizations.plots`, skips entries with `ignored: true`, assigns `horizontalIndex: 0` to the default entry, and falls back to a hardcoded Main plot if every entry is ignored.
5. `previewData` (parse output) is never mutated — it is read-only display data throughout the preview step.

---

## Local Test Walkthrough

1. Start the Express server and Vite dev server.
2. Open the dashboard and click **Import outline**.
3. Upload a `.docx` that contains scene tags (e.g. `Tags: #plot-a`).
4. In the **Tags** tab, check **Convert to plot** on "plot-a".
5. Switch to the **Plots** tab — you should see "Main" (default checked) and "plot-a".
6. Change "plot-a"'s color. Check **Make Default Plot** on it — "Main"'s checkbox should clear.
7. Check **Ignore** on "Main".
8. Click **Approve import**.
9. Open the created story — "plot-a" should be the first (primary) plot with the chosen color. "Main" should not exist.
