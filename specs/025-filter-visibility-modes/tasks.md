---
description: "Task list for filter visibility modes"
---

# Tasks: Filter Visibility Modes

**Input**: Design documents from `/specs/025-filter-visibility-modes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared utilities used across grid and list views

- [x] T001 Create shared filter helper module at web/src/utils/applyFiltersToPlots.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI state and shared prop types needed by all stories

- [x] T002 Update filter visibility mode types and story state shape in web/src/store/storyStore.types.ts
- [x] T003 Update story store defaults, actions, and reset logic for visibility mode in web/src/store/storyStore.ts
- [x] T004 Extend scene renderer props with `isFilterExcluded` in web/src/components/plot/plot.types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Toggle visibility modes (Priority: P1) 🎯 MVP

**Goal**: Provide a top-bar control to toggle Hide vs Minify for excluded scenes

**Independent Test**: Toggle the control and confirm the tooltip and UI state switch between Hide and Minify

### Implementation for User Story 1

- [x] T005 [US1] Add visibility-mode toggle button next to filters in web/src/pages/story.tsx
- [x] T006 [US1] Wire toggle state and tooltip copy for Hide vs Minify in web/src/pages/story.tsx

**Checkpoint**: Visibility toggle renders and updates state

---

## Phase 4: User Story 2 - Plot grid respects visibility mode (Priority: P1)

**Goal**: Apply filters to the grid and render excluded scenes in hide/minify variants

**Independent Test**: With filters active, toggle Hide/Minify and verify excluded scenes render correctly

### Implementation for User Story 2

- [x] T007 [US2] Implement `applyFiltersToPlots` logic to return `plotsFiltered` and `includedSceneIds` in web/src/utils/applyFiltersToPlots.ts
- [x] T008 [US2] Memoize `plotsFiltered` and `includedSceneIds` before grid layout and pass `isFilterExcluded` to scene cards in web/src/components/plot/PlotGrid.tsx
- [x] T009 [US2] Render hide/minify variants (line with hidden icon or title-only) in web/src/components/plot/SceneRenderer/SceneCard.tsx
- [x] T010 [US2] Add grid empty-state messaging when filters return no scenes in web/src/components/plot/PlotGrid.tsx

**Checkpoint**: Plot grid reflects filter visibility mode and empty states

---

## Phase 5: User Story 3 - Story list respects visibility mode (Priority: P2)

**Goal**: Apply filters to the list view and render excluded scenes appropriately

**Independent Test**: With filters active, toggle Hide/Minify and verify excluded list entries render correctly

### Implementation for User Story 3

- [x] T011 [US3] Apply `applyFiltersToPlots` before list ordering and derive `isFilterExcluded` in web/src/components/story/ListView.tsx
- [x] T012 [US3] Render hide/minify list variants (placeholder line or title-only with excluded indicator) in web/src/components/story/ListViewScene.tsx
- [x] T013 [US3] Add list-view empty-state messaging when filters return no scenes in web/src/components/story/ListView.tsx

**Checkpoint**: Story list reflects filter visibility mode and empty states

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate consistency across views

- [x] T014 [P] Validate icon usage and tooltip copy for filter visibility modes in web/src/pages/story.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on User Story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies beyond Foundational tasks
- **User Story 2 (P1)**: Depends on shared helper and `isFilterExcluded` props (T001-T004)
- **User Story 3 (P2)**: Depends on shared helper and visibility mode state (T001-T003)

### Parallel Opportunities

- T002 and T004 can run in parallel
- T005 and T006 can run in parallel after T002-T003
- T008 and T010 can run in parallel after T007
- T011 and T013 can run in parallel after T007

---

## Parallel Example: User Story 2

```bash
Task: "Memoize plotsFiltered and pass isFilterExcluded in web/src/components/plot/PlotGrid.tsx"
Task: "Add grid empty-state messaging in web/src/components/plot/PlotGrid.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate toggle behavior and tooltip text

### Incremental Delivery

1. Add User Story 2 → Validate grid rendering and empty states
2. Add User Story 3 → Validate list rendering and empty states
3. Polish UI consistency
