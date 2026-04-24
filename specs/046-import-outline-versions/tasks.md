# Tasks: Import Outline Versions

**Input**: Design documents from `/specs/046-import-outline-versions/`
**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce shared import-version contracts and parser module boundaries used by all stories.

- [x] T001 Create parser module split scaffolding and shared exports in `express/src/services/importOutlineParser.ts`, `express/src/services/importOutlineLegacyParser.ts`, and `express/src/services/importOutlineModernParser.ts`
- [x] T002 [P] Add import type domain types (`legacy`/`modern`) in `express/src/types/importOutline.ts` and `web/src/api/types.ts`

**Checkpoint**: Shared type/system boundaries exist for versioned parsing.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire import type through API boundaries before story-level behavior work.

**⚠️ CRITICAL**: No user story implementation should begin until this phase is complete.

- [x] T003 Update request validation and parsing of `importType` in `express/src/routers/importRouter.ts`
- [x] T004 Update import payload and parser dispatch in `express/src/services/importOutlineService.ts`
- [x] T005 [P] Send `importType` in multipart requests from `web/src/api/stories.ts`

**Checkpoint**: End-to-end request path supports selecting parser mode (`legacy` or `modern`).

---

## Phase 3: User Story 1 - Select Import Version Before Upload (Priority: P1) 🎯 MVP

**Goal**: User can choose import type at the top of the modal and see matching instructions/examples.

**Independent Test**: Open import modal, verify selector is above instructions, switch between legacy/modern, confirm guidance changes immediately, then preview submits with selected type.

### Implementation for User Story 1

- [x] T006 [US1] Add import type selector state and placement above instructions in `web/src/components/dashboard/ImportOutlineModal.tsx`
- [x] T007 [US1] Add dynamic legacy vs modern instruction/example content in `web/src/components/dashboard/ImportOutlineModal.tsx`
- [x] T008 [US1] Persist selected import type across preview/create actions in `web/src/components/dashboard/ImportOutlineModal.tsx`
- [x] T009 [US1] Ensure preview/create calls include selected type using updated input contract in `web/src/components/dashboard/ImportOutlineModal.tsx` and `web/src/api/types.ts`

**Checkpoint**: US1 is fully functional and independently verifiable.

---

## Phase 4: User Story 2 - Import Legacy Outline Format (Priority: P2)

**Goal**: Legacy mode preserves exact existing parser behavior.

**Independent Test**: Import a known-good legacy document under `legacy` mode and confirm parsed output (elements/tags/characters/snippets/issues) matches current baseline.

### Implementation for User Story 2

- [x] T010 [US2] Move current parser logic unchanged into `express/src/services/importOutlineLegacyParser.ts` as `parseImportOutlineLegacyDocx`
- [x] T011 [US2] Keep backward-compatible parser dispatch path for legacy mode in `express/src/services/importOutlineParser.ts`
- [ ] T012 [US2] Verify legacy parser output parity via fixture/manual comparison and document baseline check in `specs/046-import-outline-versions/quickstart.md`

**Checkpoint**: US2 is fully functional and legacy imports remain regression-free.

---

## Phase 5: User Story 3 - Import Modern Exported Outline Without Loss (Priority: P3)

**Goal**: Modern mode parses current exported doc structure and preserves supported content.

**Independent Test**: Export a story, import in `modern` mode, verify plot-scene-tag-snippet structure and supported content round-trip without loss.

### Implementation for User Story 3

- [x] T013 [US3] Implement modern parser entry point in `express/src/services/importOutlineModernParser.ts`
- [x] T014 [US3] Parse plot marker before scene (`|` line as H4 preceding scene heading) in `express/src/services/importOutlineModernParser.ts`
- [x] T015 [US3] Parse tags from the row after scene heading in `express/src/services/importOutlineModernParser.ts`
- [x] T016 [US3] Parse snippets from H5 title ending with `:` + subsequent indented block in `express/src/services/importOutlineModernParser.ts`
- [x] T017 [US3] Add malformed-modern warnings/fallback behavior for missing sequence anchors in `express/src/services/importOutlineModernParser.ts`
- [x] T018 [US3] Dispatch `modern` mode to new parser in `express/src/services/importOutlineParser.ts`
- [x] T019 [US3] Update export formatting markers (plot heading H4, snippet heading H5 with trailing `:`) in `express/src/services/storyExportService.ts`
- [ ] T020 [US3] Validate export->modern-import round trip manually and document procedure in `specs/046-import-outline-versions/quickstart.md`

**Checkpoint**: US3 is fully functional and modern round-trip behavior is validated.

---

## Phase 6: User Story 3 Addendum — Plot-as-Resource (Priority: P3)

**Goal**: Plots parsed by the modern importer are returned as a first-class `plots[]` resource (not folded into `tags[]`), scenes carry `plotIds`, the preview modal pre-seeds the Plots tab from parser output, and the Elements tab renders plot badges per scene.

**Independent Test**: Import a modern-format export. The preview response has a non-empty `plots` array; `tags` contains only bracket-tag entries; the Plots tab is pre-populated without any "Convert to plot" action; scene rows in the Elements tab show violet plot badges; the Characters tab has no `|`-prefixed entries; no spurious pipe-prefix warning appears.

**Depends on**: T010, T011, T013–T018 (modern parser and export changes must be in place)

### Phase 6A — Backend Types & Parser

- [x] T025 Add `ImportPlot` type (`id`, `name`, `color | null`) to `express/src/types/importOutline.ts`
- [x] T026 Add `plotIds: string[]` to `SceneElement` interface in `express/src/types/importOutline.ts`
- [x] T027 Add `plots: ImportPlot[]` to `ImportParseResult` type in `express/src/types/importOutline.ts`
- [x] T028 [US3] Add `ensurePlot` helper and `plotMap: Map<string, ImportPlot>` to `express/src/services/importOutlineModernParser.ts`
- [x] T029 [US3] Remove the `if (!headingText.startsWith("|")) { warn + skip }` guard from the `PLOT_HEADING_SIZE` branch in `express/src/services/importOutlineModernParser.ts` — warn only when `plotTitle` is empty after stripping
- [x] T030 [US3] Replace `ensureTag` with `ensurePlot` in the plot-heading branch in `express/src/services/importOutlineModernParser.ts`
- [x] T031 [US3] Replace `ensureTag` with `ensurePlot` in the paragraph `|`-prefix fallback branch in `express/src/services/importOutlineModernParser.ts`
- [x] T032 [US3] Rename `pendingPlotTagId` → `pendingPlotId` and push into `scene.plotIds` (not `scene.tagIds`) in `express/src/services/importOutlineModernParser.ts`
- [x] T033 [US3] Add `plots: []` to `createEmptyResult()` in `express/src/services/importOutlineModernParser.ts`
- [x] T034 Run backend build: `cd express && npm run build`

### Phase 6B — Frontend Types (parallel-eligible with 6A after T025–T027)

- [x] T035 [P] [US3] Add `ImportOutlineParsePlot` interface to `web/src/api/types.ts`
- [x] T036 [P] [US3] Add `plotIds?: string[]` to `ImportOutlineParseSceneElement` in `web/src/api/types.ts`
- [x] T037 [P] [US3] Add `plots?: ImportOutlineParsePlot[]` to `ImportOutlineResponse` in `web/src/api/types.ts`

### Phase 6C — Modal Seeding

- [x] T038 [US3] In `handlePreview` in `web/src/components/dashboard/ImportOutlineModal.tsx`, map `result.plots ?? []` to `ImportPlotCustomization[]` entries and prepend `DEFAULT_MAIN_PLOT`; use `DEFAULT_PALETTE_COLORS` indexed by position for missing colours; fall back to `[DEFAULT_MAIN_PLOT]` when plots is empty (preserves legacy path)

### Phase 6D — Preview Tabs Plot Display

- [x] T039 [US3] Add `plots: ImportOutlineParsePlot[]` prop to `ImportOutlinePreviewTabsProps` in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T040 [US3] Pass `previewData?.plots ?? []` from `ImportOutlineModal` to `<ImportOutlinePreviewTabs>` in `web/src/components/dashboard/ImportOutlineModal.tsx`
- [x] T041 [US3] In `ElementsTab` in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`, resolve `element.plotIds` against the `plots` prop and render violet (`bg-violet-100 text-violet-700`) rounded badges after tag badges
- [x] T042 [US3] Update `PlotsTab` empty-state message in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx` to mention auto-detected plots
- [x] T043 Run frontend build: `cd web && npm run build`

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T044 [P] Add or update integration notes for import type mismatch errors and user messaging in `specs/046-import-outline-versions/quickstart.md`
- [x] T045 Run backend build in `express/` and fix any type errors affecting this feature
- [ ] T046 Run frontend lint/build in `web/` and fix any issues affecting this feature
- [ ] T047 Execute full manual QA sweep for US1/US2/US3 (including plot-as-resource addendum) per `specs/046-import-outline-versions/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1: no dependencies
- Phase 2: depends on Phase 1 — blocks all user stories
- Phase 3 (US1): depends on Phase 2
- Phase 4 (US2): depends on Phase 2
- Phase 5 (US3 parser/export): depends on Phase 2; should include T010/T011
- Phase 6A (backend types + parser addendum): depends on Phase 5 being complete
- Phase 6B (frontend types): depends on T025–T027 (Phase 6A types); can run in parallel with the rest of 6A
- Phase 6C (modal seeding): depends on Phase 6B
- Phase 6D (preview tabs): depends on Phase 6B and Phase 6C
- Phase 7: depends on Phases 5 and 6 being complete

### User Story Dependencies

- US1 (P1): no dependency on US2/US3; ships once Phase 2 is complete
- US2 (P2): independent from US1 UI changes; requires parser split setup
- US3 (P3): Phases 5 + 6 together; plot-as-resource addendum (Phase 6) builds on the parser foundation from Phase 5

### Parallel Opportunities

- T002 and T005 can run in parallel after scaffolding starts
- T006 and T007 can run in parallel in UI workstream (same file, coordinate merges)
- T013–T017 can be split across parser subroutines and merged behind T018
- Phase 6A (parser) and Phase 6B (frontend types) can run in parallel after T025–T027 land
- T035, T036, T037 within Phase 6B are fully parallel
- T045 and T046 in Phase 7 can run in parallel

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate import type selector and request wiring end to end

### Incremental Delivery

1. Deliver US1 (type selector + dynamic instructions)
2. Deliver US2 (legacy parser parity)
3. Deliver US3 (modern parser + export alignment + round trip)
4. Finish with build/lint/manual QA gates
