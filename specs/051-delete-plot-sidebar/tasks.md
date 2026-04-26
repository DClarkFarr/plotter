# Tasks: Plot Sidebar Edit and Soft Delete

**Input**: Design documents from `/specs/051-delete-plot-sidebar/`
**Prerequisites**: plan.md ✅, spec.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare sidebar view/state plumbing and API typing surface needed by all stories.

- [x] T001 Add plot editor selection store in `web/src/store/plotEditorStore.ts` with selectedPlotId, selectPlot, clearSelection, and optional setSaving/setError helpers
- [x] T002 [P] Extend `SidebarView` union to include `plot` in `web/src/store/sidebarStore.ts`
- [x] T003 [P] Add delete plot API response types in `web/src/api/types.ts` (deleted payload + error shape compatibility)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement backend soft-delete foundation and active-plot query consistency before user-story work.

**⚠️ CRITICAL**: No user story work should ship before this phase is complete.

- [x] T004 Add `deletedAt?: Date | null` to plot model, and set `deletedAt: null` on create/duplicate paths in `express/src/models/plots.ts`
- [x] T005 Add active-plot filter helper and apply it to active reads in `express/src/models/plots.ts` (`listPlots`, `countPlotsByStoryId`, `listPlotIdsByStoryId`, `listPlotsByIds`, `getPlotById`)
- [x] T006 Replace hard delete implementation with soft delete update (`deletedAt` + timestamps) in `express/src/models/plots.ts`
- [x] T007 Update plot indexes so unique `(storyId, horizontalIndex)` applies to active plots only in `express/src/models/plots.ts`
- [x] T008 [P] Add scene reassignment helper for bulk transfer from one plot to another in `express/src/models/scenes.ts`
- [x] T009 [P] Ensure story-level plot/scenes aggregations continue to use active plot ids only in `express/src/services/storyService.ts`

**Checkpoint**: Active-plot soft-delete model is consistent and safe.

---

## Phase 3: User Story 1 - Edit Plot in Sidebar (Priority: P1) 🎯 MVP

**Goal**: Move plot editing from in-place header form to sidebar pane.

**Independent Test**: Click plot edit button in grid header and confirm sidebar opens with plot fields and updates persist.

### Implementation

- [x] T010 [US1] Replace in-place edit mode behavior with sidebar-open behavior in `web/src/components/plot/SceneRenderer/PlotHeader.tsx`
- [x] T011 [US1] Render plot sidebar view in layout by wiring current view `plot` to `PlotForm` in `web/src/components/layout/DashboardLayout.tsx`
- [x] T012 [US1] Create sidebar plot editor component in `web/src/components/story/PlotForm.tsx` using existing plot update mutation for title/description/color edits
- [x] T013 [P] [US1] Ensure plot header/selection interactions set selected plot id in `web/src/store/plotEditorStore.ts` and open sidebar in `web/src/components/plot/SceneRenderer/PlotHeader.tsx`
- [x] T014 [US1] Remove obsolete in-place edit-only state/UX code paths in `web/src/components/plot/SceneRenderer/PlotHeader.tsx`

**Checkpoint**: Sidebar-based plot editing works and in-place edit form no longer appears.

---

## Phase 4: User Story 2 - Delete Plot from Danger Zone (Priority: P1)

**Goal**: Add a danger-zone delete workflow with confirmation modal, backed by soft-delete endpoint.

**Independent Test**: Delete a plot from PlotForm danger zone and verify plot disappears from active grid views after confirmation.

### Implementation

- [x] T015 [US2] Add plot delete service orchestration in `express/src/services/plotService.ts` (story ownership, transfer target, scene transfer, soft delete, horizontal index compaction)
- [x] T016 [US2] Add delete route `DELETE /:storyId/plots/:plotId` in `express/src/routers/storyRouter.ts`
- [x] T017 [US2] Add scene transfer logic: move scenes from deleted plot to left plot (`horizontalIndex - 1`) or right plot (`horizontalIndex + 1`) when no left plot in `express/src/services/plotService.ts`
- [x] T018 [US2] Add deletePlot API function in `web/src/api/stories.ts`
- [x] T019 [US2] Add `useDeletePlotMutation(storyId)` with optimistic/invalidation handling for plots and scenes caches in `web/src/queries/plot/plot-mutations.ts`
- [x] T020 [US2] Add danger zone and delete confirmation modal in `web/src/components/story/PlotForm.tsx`, matching scene delete interaction style
- [x] T021 [P] [US2] Close sidebar and clear selected plot after successful delete in `web/src/components/story/PlotForm.tsx` and `web/src/store/plotEditorStore.ts`

**Checkpoint**: Plot delete flow is available from sidebar and executes as a soft delete.

---

## Phase 5: User Story 3 - Enforce Safe Delete Rules (Priority: P2)

**Goal**: Prevent destructive edge cases and enforce business constraints.

**Independent Test**: Attempt to delete the last active plot and confirm deletion is blocked with clear user feedback.

### Implementation

- [x] T022 [US3] Enforce minimum-active-plot rule (cannot delete when active count is 1) in `express/src/services/plotService.ts`
- [x] T023 [US3] Return conflict-style response for last-plot deletion attempts in `express/src/routers/storyRouter.ts`
- [x] T024 [US3] Disable delete button with explanatory message when only one active plot remains in `web/src/components/story/PlotForm.tsx`
- [x] T025 [US3] Surface backend last-plot-delete error clearly in plot sidebar form in `web/src/components/story/PlotForm.tsx`
- [ ] T026 [US3] Verify scene transfer target selection and leftmost fallback behavior under edge conditions in `express/src/services/plotService.ts`

**Checkpoint**: Business rules prevent invalid deletion and user receives clear guidance.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Stabilize behavior across stories and validate no regressions.

- [x] T027 [P] Validate no active plot queries leak soft-deleted records by reviewing model query paths in `express/src/models/plots.ts` and `express/src/services/storyService.ts`
- [x] T028 [P] Validate cache coherence after delete (plots and scenes reflect transfer + compaction) in `web/src/queries/plot/plot-mutations.ts`
- [x] T029 Run backend checks in `express/` (build/type/lint scripts used by project)
- [x] T030 Run frontend checks in `web/` (build/type/lint scripts used by project)
- [ ] T031 Execute manual quick validation from spec acceptance scenarios for US1-US3 and update notes in `specs/051-delete-plot-sidebar/quickstart.md` if quickstart is later added

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → starts immediately
- Phase 2 → depends on Phase 1 and blocks story completion
- Phase 3 (US1) → depends on Phase 2
- Phase 4 (US2) → depends on Phase 2 and uses Phase 3 sidebar shell
- Phase 5 (US3) → depends on Phase 4 delete path
- Phase 6 → after all targeted stories

### User Story Dependencies

- US1: independent once foundation is complete
- US2: independent once foundation is complete; integrates with US1 sidebar UX
- US3: depends on delete flow from US2

### Parallel Opportunities

- T002 and T003 can run in parallel with T001
- T008 and T009 can run in parallel after T004-T007 direction is set
- T013 can run in parallel with T011-T012
- T021 can run in parallel with final delete UX wiring
- T027 and T028 can run in parallel during polish

---

## Suggested Delivery Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Complete US1 (Phase 3) for sidebar editing
3. Complete US2 (Phase 4) for deletion capability
4. Validate end-to-end before rule hardening

### Full Delivery

1. Add US3 rule enforcement (last active plot cannot be deleted)
2. Complete final validation tasks

---

## Task Count Summary

| Phase                 | Tasks  | Scope                               |
| --------------------- | ------ | ----------------------------------- |
| Phase 1: Setup        | 3      | shared frontend plumbing            |
| Phase 2: Foundational | 6      | backend soft-delete + transfer base |
| Phase 3: US1          | 5      | sidebar plot editing                |
| Phase 4: US2          | 7      | delete endpoint + UX                |
| Phase 5: US3          | 5      | safe delete business rules          |
| Phase 6: Polish       | 5      | validation and checks               |
| **Total**             | **31** |                                     |
