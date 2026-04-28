# Tasks: Matched Results Only Filter Mode

**Input**: Design documents from `/specs/054-add-matched-scenes-filter/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: No automated tests were explicitly requested in the specification; include manual validation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no direct dependency)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare task tracking and shared feature docs.

- [ ] T001 Create feature task breakdown file at specs/054-add-matched-scenes-filter/tasks.md
- [ ] T002 [P] Confirm requirement checklist remains aligned after task generation in specs/054-add-matched-scenes-filter/checklists/requirements.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the new mode to shared state and filter projection so all stories can build on it.

**⚠️ CRITICAL**: User story implementation should start after this phase.

- [x] T003 Extend `FilterVisibilityMode` with a match-only value in web/src/store/storyStore.types.ts
- [x] T004 Update story store default/reset handling for the new mode in web/src/store/storyStore.ts
- [x] T005 Extend filter projection result to include `includedPlotIds` in web/src/utils/applyFiltersToPlots.ts
- [x] T006 Preserve existing behavior for no-filter and combined-filter scenarios while adding plot inclusion projection in web/src/utils/applyFiltersToPlots.ts

**Checkpoint**: Shared state and filter projection are ready for grid/list implementations.

---

## Phase 3: User Story 1 - Show only matched scenes (Priority: P1) 🎯 MVP

**Goal**: Users can select a third filter visibility mode that shows only matched scenes.

**Independent Test**: Activate filters with mixed matches, switch to match-only mode, and verify only matched scenes remain visible.

### Implementation for User Story 1

- [x] T007 [US1] Convert filter visibility toggle from 2-state to 3-state cycle in web/src/pages/story.tsx
- [x] T008 [US1] Add mode-specific icon and tooltip mapping for hide/minify/match-only in web/src/pages/story.tsx
- [x] T009 [US1] Ensure mode transitions update state correctly without stale UI remnants in web/src/pages/story.tsx
- [x] T010 [US1] Return no scene UI for excluded scenes in match-only mode in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [x] T011 [US1] Return no scene UI for excluded scenes in match-only mode in web/src/components/story/ListViewScene.tsx

**Checkpoint**: Match-only mode is selectable and excluded scenes are removed from scene-level rendering.

---

## Phase 4: User Story 2 - Remove excluded scenes from rendering (Priority: P2)

**Goal**: Excluded scenes are fully omitted from rendered outputs, including list/sidebar projections.

**Independent Test**: With active filters and mixed results, confirm excluded scenes do not appear as hidden/minified placeholders in match-only mode.

### Implementation for User Story 2

- [ ] T012 [US2] Filter list entries to omit excluded scenes when mode is match-only in web/src/components/story/ListView.tsx
- [ ] T013 [US2] Ensure sidebar entries mirror filtered list content in match-only mode in web/src/components/story/ListView.tsx
- [ ] T014 [US2] Skip disabled/minified sidebar render path for excluded scenes in match-only mode in web/src/components/story/ListViewSidebarItem.tsx
- [ ] T015 [US2] Add/verify explicit empty-results state for filtered list when no matched scenes remain in web/src/components/story/ListView.tsx

**Checkpoint**: List view and sidebar no longer render excluded scene artifacts in match-only mode.

---

## Phase 5: User Story 3 - Hide non-matching plots in grid mode (Priority: P3)

**Goal**: Grid mode only renders plots that contain matched scenes while in match-only mode.

**Independent Test**: Apply filters where only some plots have matches and verify unmatched plots are fully absent from grid rendering.

### Implementation for User Story 3

- [ ] T016 [US3] Derive active plot/scene render dataset from filter mode and included IDs in web/src/components/plot/PlotGrid.tsx
- [ ] T017 [US3] Build grid maps/layout from pruned dataset in match-only mode in web/src/components/plot/PlotGrid.tsx
- [ ] T018 [US3] Ensure unmatched plot headers are not rendered in match-only mode in web/src/components/plot/PlotGrid.tsx
- [ ] T019 [US3] Ensure empty cards/scene actions are not rendered for excluded scenes in match-only mode in web/src/components/plot/PlotGrid.tsx
- [ ] T020 [US3] Add/verify explicit empty-results state for grid when no matched scenes remain in web/src/components/plot/PlotGrid.tsx

**Checkpoint**: Grid mode hides unmatched plots entirely and renders only matched scene content.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate transitions and regressions across all three visibility modes.

- [ ] T021 [P] Perform manual mode-switch validation (hide/minify/match-only) in web/src/pages/story.tsx and web/src/components/plot/PlotGrid.tsx
- [ ] T022 [P] Perform manual filtered dataset validation for list/sidebar consistency in web/src/components/story/ListView.tsx
- [ ] T023 Verify clearing filters while in match-only restores full rendering in web/src/components/plot/PlotGrid.tsx and web/src/components/story/ListView.tsx
- [ ] T024 Record final validation outcomes and any follow-ups in specs/054-add-matched-scenes-filter/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks user story implementation.
- **User Stories (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 and delivers MVP mode selection + scene-level omission behavior.
- **User Story 2 (P2)**: Starts after Phase 2; depends on mode and included scene IDs from foundational work.
- **User Story 3 (P3)**: Starts after Phase 2; depends on included plot IDs from foundational work.

### Within Each User Story

- Update shared projection/state before component rendering changes.
- Update mode control before validating scene-level rendering.
- Complete rendering omission before empty-state messaging checks.

### Parallel Opportunities

- T003 and T005 can run in parallel (types vs projection utility).
- T010 and T011 can run in parallel (grid scene card vs list scene item).
- T012 and T014 can run in parallel after T003-T006.
- T018 and T020 can run in parallel after T016-T017.
- T021 and T022 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Return no scene UI for excluded scenes in match-only mode in web/src/components/plot/SceneRenderer/SceneCard.tsx"
Task: "Return no scene UI for excluded scenes in match-only mode in web/src/components/story/ListViewScene.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Ensure unmatched plot headers are not rendered in match-only mode in web/src/components/plot/PlotGrid.tsx"
Task: "Add/verify explicit empty-results state for grid when no matched scenes remain in web/src/components/plot/PlotGrid.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. Validate mixed-match dataset behavior and mode switching.

### Incremental Delivery

1. Deliver User Story 1 (third mode + scene-level omission).
2. Deliver User Story 2 (list/sidebar complete omission behavior).
3. Deliver User Story 3 (grid plot-level omission behavior).
4. Finish polish validation and checklist updates.

### Parallel Team Strategy

1. Developer A: store + story controls (`web/src/store/*`, `web/src/pages/story.tsx`).
2. Developer B: grid rendering (`web/src/components/plot/PlotGrid.tsx`, `web/src/components/plot/SceneRenderer/SceneCard.tsx`).
3. Developer C: list rendering (`web/src/components/story/ListView.tsx`, `web/src/components/story/ListViewScene.tsx`, `web/src/components/story/ListViewSidebarItem.tsx`).
