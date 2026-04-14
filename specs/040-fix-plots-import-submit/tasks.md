# Tasks: Fix Plot Customizations Submission on Import

**Input**: Design documents from `/specs/040-fix-plots-import-submit/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story. No tests required per constitution.

---

## Phase 1: Foundational — Shared Type Changes

**Purpose**: Update the `ImportCustomizations` shape on both client and server. These tasks BLOCK all story work because every downstream file depends on the new types.

**⚠️ CRITICAL**: Complete both tasks before moving to Phase 2 or Phase 3.

- [x] T001 [P] Add `ImportPlotCustomization` type and replace `plotTagIds: string[]` with `plots: ImportPlotCustomization[]` in `express/src/types/importOutline.ts`
- [x] T002 [P] Add `ImportPlotCustomization` interface and replace `plotTagIds: string[]` with `plots: ImportPlotCustomization[]` in `web/src/api/types.ts`

**Checkpoint**: Both type files compile. All downstream files will have type errors until Phase 2 & 3 fix them — that is expected.

---

## Phase 2: User Story 1 — Plot Colors Are Preserved on Import (Priority: P1) 🎯 MVP

**Goal**: End-to-end flow where color selected in the Plots tab reaches the DB `createPlot` call.

**Independent Test**: Upload a `.docx`, change a plot color in the Plots tab, approve — the created story's plot has the chosen color.

### Server (depends on T001)

- [x] T003 [US1] Update `customizations` validation in `express/src/routers/importRouter.ts`: replace `plotTagIds` array check with `plots` array + per-entry field validation (`id`, `name`, `color`, `isDefaultPlot`, `ignored`)
- [x] T004 [US1] Rewrite plot creation block in `express/src/services/importOutlineService.ts`: iterate `customizations.plots`, skip `ignored` entries, use `entry.color` in each `createPlot` call, remove the old `plotTagIds` Set and `eligiblePlotTagNames` Map logic

### Client — Modal (depends on T002)

- [x] T005 [US1] In `web/src/components/dashboard/ImportOutlineModal.tsx`: remove `defaultPlotTag` constant and the tag injection into `previewData` inside `handlePreview`; update initial `customizations` state to use `plots: [{ id: "main_plot_id", name: "Main", color: "#729cfd", isDefaultPlot: true, ignored: false }]`; remove `onChangeTags` handler and prop

### Client — Tabs (depends on T002, T005)

- [x] T006 [US1] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`: remove `onChangeTags` from `ImportOutlinePreviewTabsProps` and from the `<PlotsTab>` call; rewrite `PlotsTab` to read plots from `customizations.plots` (filtered by `customizations.plots.map(p=>p.id)`) and write color changes via `onCustomizationChange`

**Checkpoint**: Import with a single plot (Main) produces a story where Main's color matches `#729cfd` and the plot renders correctly in the story dashboard.

---

## Phase 3: User Story 2 — Default Plot & Ignore (Priority: P2)

**Goal**: User can designate any plot as default and ignore others; server respects both flags.

**Independent Test**: Tag a plot "Make Default Plot", ignore another, approve — the designated default is at `horizontalIndex: 0` and the ignored plot is absent from the story.

### Server (depends on T004)

- [x] T007 [US2] In `express/src/services/importOutlineService.ts`: extend the new plot creation block to order plots by `isDefaultPlot` (default entry gets `horizontalIndex: 0`) and add fallback when all entries are `ignored` (create hardcoded `{ title: "Main", color: "#729cfd", horizontalIndex: 0 }`)

### Client — Tabs (depends on T006)

- [x] T008 [US2] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`: add **Ignore** toggle to `PlotsTab` rows — toggling updates `ignored` on the matching entry via `onCustomizationChange`; if the ignored entry had `isDefaultPlot: true`, restore `isDefaultPlot: true` to the Main entry
- [x] T009 [US2] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`: rewrite **Make Default Plot** checkbox in `PlotsTab` to set `isDefaultPlot: true` on the selected entry and `false` on all others via `onCustomizationChange` (radio-style, single source of truth)
- [x] T010 [US2] In `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`: update `TagsTab` toggle logic — when "Convert to plot" is checked, push a new `ImportPlotCustomization` entry into `customizations.plots` (default color from palette at current index, `isDefaultPlot: false`, `ignored: false`); when unchecked, remove the entry from `customizations.plots` and, if it had `isDefaultPlot: true`, restore `isDefaultPlot: true` on the Main entry

**Checkpoint**: Run the full quickstart.md walkthrough — "plot-a" becomes `horizontalIndex: 0` with custom color; Main is absent when ignored.

---

## Phase 4: Polish

- [x] T011 [P] Remove unused `colors` array from `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx` if it is no longer needed, or wire it to the new plot color defaults in T010
- [x] T012 Run the quickstart.md manual test walkthrough end-to-end to confirm all acceptance scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately; T001 and T002 are parallel
- **Phase 2 (US1)**: Requires Phase 1 complete — T003/T004 need T001; T005/T006 need T002
- **Phase 3 (US2)**: Requires Phase 2 complete — all tasks build on Phase 2 implementations
- **Phase 4 (Polish)**: Requires Phase 3 complete

### Within Each Phase

- T001 and T002 are fully parallel (different codebases, no shared state)
- T003 and T005 are parallel (server vs. client, both depend only on Phase 1)
- T004 depends on T003 (service logic after router validation is settled)
- T006 depends on T005 (tabs component after modal prop changes are done)
- T007 depends on T004 (extends the plot creation block written in T004)
- T008, T009, T010 depend on T006 (all rewrite PlotsTab/TagsTab built in T006)

### Parallel Example: Phase 2 (US1)

```
Phase 1 done
     │
     ├─ T003 (server router)     ─► T004 (server service)
     └─ T005 (modal cleanup)     ─► T006 (tabs rewrite)
```

### Implementation Strategy

- **MVP scope**: Phase 1 + Phase 2 (US1). This alone fixes the primary bug — colors reach the server.
- **Full scope**: All four phases. Phase 3 adds default designation and ignore, completing both user stories.
