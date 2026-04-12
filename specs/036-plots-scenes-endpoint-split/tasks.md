# Tasks: Plots & Scenes Endpoint Split

**Input**: Design documents from `/specs/036-plots-scenes-endpoint-split/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup

**Purpose**: No project initialization needed — this is a refactor of an existing codebase. Setup phase covers only the foundational server-side changes that must exist before any client work can begin.

_(No setup tasks — project structure already exists)_

---

## Phase 2: Foundational — Server Endpoint & Type System

**Purpose**: Backend changes that define the new contract, plus client-side type system updates that unblock all query/component work. Must be complete before any user story work begins.

**⚠️ CRITICAL**: All subsequent phases depend on these tasks.

- [x] T001 Add `listStoryPlotsForUser` and `listStoryScenesForUser` to `express/src/services/storyService.ts`; remove `listStoryPlotsWithScenesForUser`
- [x] T002 Remove `getPlotWithScenes` from `express/src/services/plotService.ts`
- [x] T003 Refactor `toPlotResponse` helper in `express/src/routers/storyRouter.ts` to strip `scenes` field; update imports of `listStoryPlotsForUser` / `listStoryScenesForUser`
- [x] T004 Update `GET /:storyId/plots` handler in `express/src/routers/storyRouter.ts` to call `listStoryPlotsForUser` and return metadata-only plots (depends on T001, T003)
- [x] T005 Update `POST /:storyId/plots` handler in `express/src/routers/storyRouter.ts` to return `toPlotResponse(plot)` without scenes (depends on T003)
- [x] T006 Update `PATCH /:storyId/plots/:plotId` handler in `express/src/routers/storyRouter.ts` to return updated plot directly without calling `getPlotWithScenes` (depends on T002, T003)
- [x] T007 Add `GET /:storyId/scenes` route handler in `express/src/routers/storyRouter.ts` returning `{ scenes: scenes.map(toSceneResponse) }` (depends on T001, T003)
- [x] T008 [P] Remove `scenes: Scene[]` from `Plot` interface and add `ScenesResponse` interface in `web/src/api/types.ts`
- [x] T009 [P] Add `listStoryScenes(storyId)` API function in `web/src/api/stories.ts` calling `GET /stories/:storyId/scenes`; import `ScenesResponse`

**Checkpoint**: Server returns plots without scenes; new `/scenes` endpoint live; `Plot` type has no `scenes` field — TypeScript will now fail at all call sites that reference `plot.scenes`, guiding remaining work

---

## Phase 3: User Story 1 — Load Story Plot Grid (Priority: P1) 🎯 MVP

**Goal**: `PlotGrid` and `ListView` load plots and scenes via separate queries; scene mutations update only the scenes cache; plot column headers never re-render on scene changes.

**Independent Test**: Navigate to a story. Confirm two separate network requests (`/plots` and `/scenes`). Edit a scene — confirm no `/plots` request fires. Grid renders and filters correctly.

### Implementation for User Story 1

- [x] T010 Add `useStoryScenesQuery` hook in `web/src/queries/story/story-queries.ts` with cache key `["story", storyId, "scenes"]` (depends on T009)
- [x] T011 Refactor `shift-logic.ts` in `web/src/queries/story/shift-logic.ts`: replace `plots: Plot[]` with `scenes: Scene[]` in `hasSceneOnPlotIndex`, `hasSceneOnStoryIndex`, `shouldShiftForSceneInsert`, `shouldShiftAfterSceneRemoval`, `MoveRangeShiftProps`, and `getMoveRangeShift` (depends on T008)
- [x] T012 Refactor `shifted-resources.ts` in `web/src/queries/story/shifted-resources.ts`: replace `applyShiftRangeToPlots` with `applyShiftRangeToScenes` operating on `Scene[]`; update `applyOptimisticShiftToState` to take `(scenes, sections, shift)` and return `{ scenes, sections }`; update `applyShiftedResources` and `applyOptimisticShift` to write to `useStoryScenesQuery.queryKey` (depends on T010, T011)
- [x] T013 Refactor `useCreateSceneMutation` in `web/src/queries/scene/scene-mutations.ts`: cancel/read/write `useStoryScenesQuery.queryKey`; pass flat `scenes` to `shouldShiftForSceneInsert` and `applyOptimisticShiftToState`; replace temp scene on `onSuccess` (depends on T010, T011, T012)
- [x] T014 [P] Refactor `useUpdateSceneMutation` in `web/src/queries/scene/scene-mutations.ts`: cancel/read/write scenes cache; operate on flat `Scene[]` (depends on T010, T012)
- [x] T015 [P] Refactor `useDeleteSceneMutation` in `web/src/queries/scene/scene-mutations.ts`: cancel/read/write scenes cache; pass flat `scenes` to `shouldShiftAfterSceneRemoval` (depends on T010, T011, T012)
- [x] T016 Refactor `useMoveSingleWithinPlot` in `web/src/queries/scene/scene-mutations.ts`: cancel/read/write scenes cache; pass `scenes` to `getMoveRangeShift`; update moved scene's `verticalIndex` and `plotId` in flat array (depends on T010, T011, T012)
- [x] T017 Remove `scenes: []` from optimistic `Plot` object in `useCreatePlotMutation` in `web/src/queries/plot/plot-mutations.ts` (depends on T008)
- [x] T018 Verify `useUpdatePlotMutation` in `web/src/queries/plot/plot-mutations.ts` has no scene-related code in optimistic update (depends on T008)
- [x] T019 Refactor `applyFiltersToPlots` in `web/src/utils/applyFiltersToPlots.ts`: add `scenes: Scene[]` second parameter; replace `plot.scenes` iteration with `scenes.forEach(scene => ...)` using a `plotById` map; update scene type references from `Plot["scenes"][number]` to `Scene` (depends on T008)
- [x] T020 Refactor `orderScenesForListView` in `web/src/utils/listViewOrdering.ts`: add `scenes: Scene[]` second parameter; build scene entries from flat array using `plotById` map instead of iterating `plot.scenes` (depends on T008)
- [x] T021 Refactor `PlotGrid` and `PlotGridBody` in `web/src/components/plot/PlotGrid.tsx`: remove `plots` from `PlotGridProps`; call `useStoryPlotsQuery` and `useStoryScenesQuery` internally; update `getGridRows` to derive max vertical index from flat scenes; rebuild `scenesByColIndex` from flat scenes array; update `grid` construction to use scene map instead of `plot.scenes.findIndex` (depends on T010, T019)
- [x] T022 Refactor `ListView` in `web/src/components/story/ListView.tsx`: remove `plots` from `ListViewProps`; call `useStoryPlotsQuery` and `useStoryScenesQuery` internally; update `applyFiltersToPlots` and `orderScenesForListView` call sites to pass `scenes` (depends on T010, T019, T020)
- [x] T023 Update `web/src/pages/story.tsx`: remove `plots` prop from `<PlotGrid>` and `<ListView>`; retain `plotsQuery.data` for `StoryFiltersMenu` (depends on T021, T022)

**Checkpoint**: Story page fully functional with split queries. Scene mutations do not touch the plots cache. TypeScript compiles with zero errors. Run `quickstart.md` validation steps.

---

## Phase 4: User Story 2 — Update Plot Returns Metadata Only (Priority: P2)

**Goal**: `PATCH /stories/:storyId/plots/:plotId` response contains updated plot metadata with no `scenes` field; client plot mutations handle the slimmer shape correctly.

**Independent Test**: Send a PATCH to rename a plot. Response contains `{ plot: { id, title, ... } }` with no `scenes` key. The grid updates the column header correctly.

_(These tasks are already covered by Foundational T006 and US1 task T018. Verify during T018 that `onSuccess` in `useUpdatePlotMutation` correctly handles the new plot shape with no scenes.)_

- [ ] T024 [US2] Smoke-test `PATCH /:storyId/plots/:plotId` via the UI: rename a plot, confirm the column header updates and no `scenes` field appears in the response payload (depends on T006, T018, T023)

**Checkpoint**: Plot update works end-to-end with metadata-only response.

---

## Phase 5: User Story 3 — Create Plot Returns Metadata Only (Priority: P3)

**Goal**: `POST /stories/:storyId/plots` response contains new plot metadata with no `scenes` field; optimistic plot creation in the client uses the slimmer shape.

**Independent Test**: Create a new plot. Response contains `{ plot: { id, title, ... } }` with no `scenes` key. New column appears in the grid.

_(These tasks are already covered by Foundational T005 and US1 task T017. Verify during T017 that the optimistic `Plot` object has no `scenes` field.)_

- [ ] T025 [US3] Smoke-test `POST /:storyId/plots` via the UI: create a plot, confirm the new column appears and no `scenes` field appears in the response payload (depends on T005, T017, T023)

**Checkpoint**: Plot creation works end-to-end with metadata-only response.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T026 [P] Run `cd express && npx tsc --noEmit` — fix any remaining TypeScript errors
- [x] T027 [P] Run `cd web && npx tsc --noEmit` — fix any remaining TypeScript errors
- [ ] T028 Run full `quickstart.md` validation checklist: verify `/plots` response has no `scenes`, `/scenes` returns flat array, scene edits fire no `/plots` request, filters work, drag-and-drop works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Start immediately — unblocks everything
- **US1 (Phase 3)**: Depends on all of Phase 2 (T001–T009); tasks T013–T016 are sequential within the mutations file; T014 and T015 can run in parallel with each other
- **US2 (Phase 4)**: Covered by Phase 2 + T018; T024 is a final verification
- **US3 (Phase 5)**: Covered by Phase 2 + T017; T025 is a final verification
- **Polish (Phase 6)**: Depends on all prior phases

### Within Phase 3

- T010 → unblocks T013, T014, T015, T016 (all need the new query key)
- T011 → unblocks T013, T015, T016 (shift logic changes cascade to mutations)
- T012 → unblocks T013 (optimistic shift state used in create)
- T013, T014, T015, T016 — can be done in any order but all write to the same file; do sequentially
- T017, T018 — independent of scenes work, can run in parallel with T011
- T019, T020 — depend on T008 only; can run in parallel with T010–T012
- T021 — depends on T010, T019 (needs query + filter util)
- T022 — depends on T010, T019, T020
- T023 — depends on T021, T022

### Parallel Opportunities per Phase

**Phase 2**: T008 and T009 (client type + api function) can run in parallel with T001–T007 (server work) since they only depend on T008.

**Phase 3**:

```
T010 + T011 + T017 + T019 + T020  ← can all start after Phase 2 completes
T012                               ← after T010, T011
T013                               ← after T012
T014 + T015                        ← after T010, T012 (parallel with each other)
T016                               ← after T010, T011, T012
T021                               ← after T010, T019
T022                               ← after T010, T019, T020
T023                               ← after T021, T022
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 2 (Foundational) — server + type system
2. Complete Phase 3 (US1) top-to-bottom — query layer then components
3. **Validate**: Two network requests on story load; scene mutations don't touch plots cache
4. Then verify Phase 4 + 5 (US2/US3) — mostly already done

### Notes

- Work through Phase 2 server tasks (T001–T007) first — TypeScript errors in the client will then point exactly to what needs fixing
- The TypeScript compiler is your guide: after T008, every `plot.scenes` access becomes a compile error and maps 1:1 to a remaining task
- Commit after each completed phase boundary
