# Tasks: Plot Header Grid Enhancements

**Input**: Design documents from `/specs/008-plot-header-grid/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested (manual validation only)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create plot header component scaffold in web/src/components/plot/PlotHeader.tsx
- [x] T002 [P] Add plot API inputs and responses in web/src/api/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Add plot create endpoint in express/src/routers/storyRouter.ts with validation and error handling
- [x] T004 Add plot update endpoint in express/src/routers/storyRouter.ts with validation and error handling
- [x] T005 [P] Add plot create/update functions in web/src/api/stories.ts
- [x] T006 [P] Add plot create/update mutations with optimistic cache updates in web/src/hooks/useStory.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a plot header (Priority: P1) 🎯 MVP

**Goal**: Writers can create a new plot column from the grid header with immediate feedback.

**Independent Test**: Create a plot from an empty column and confirm the header appears and scenes enable.

### Implementation for User Story 1

- [x] T007 [US1] Update plot grid header rendering to use PlotHeaderCreate for empty columns in web/src/components/plot/PlotGrid.tsx
- [x] T008 [US1] Add dirty-state input handling and fade-in create button in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx
- [x] T009 [US1] Wire PlotHeaderCreate to plot create mutation and optimistic cache updates in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx
- [x] T010 [US1] Add create error display and rollback handling in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Edit and move existing plot headers (Priority: P2)

**Goal**: Writers can edit plot header details and move plot columns left or right from the grid.

**Independent Test**: Edit title/description/color, save, and move the plot left/right with immediate updates.

### Implementation for User Story 2

- [x] T011 [US2] Implement view mode layout and hover toolbar in web/src/components/plot/PlotHeader.tsx
- [x] T012 [US2] Implement edit mode form with title, description, and color input in web/src/components/plot/PlotHeader.tsx
- [x] T013 [US2] Add cancel/save handlers with optimistic updates in web/src/components/plot/PlotHeader.tsx
- [x] T014 [US2] Add move left/right actions with optimistic horizontal index updates in web/src/components/plot/PlotHeader.tsx
- [x] T015 [US2] Render PlotHeader for existing plots in web/src/components/plot/PlotGrid.tsx

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Prevent scene creation before plots exist (Priority: P3)

**Goal**: Empty scene cards are disabled when the plot header is missing.

**Independent Test**: Attempt to create a scene in a plotless column and confirm disabled UI.

### Implementation for User Story 3

- [x] T016 [US3] Add disabled prop to empty card renderer types in web/src/components/plot/plot.types.ts
- [x] T017 [US3] Implement disabled visuals and blocked interaction in web/src/components/plot/SceneRenderer/EmptyCard.tsx
- [x] T018 [US3] Pass disabled state based on plot presence in web/src/components/plot/PlotGrid.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 [P] Ensure plot header styling consistency in web/src/components/plot/PlotHeader.tsx and web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx
- [ ] T020 Run quickstart flow validation from specs/008-plot-header-grid/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 plot header creation
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but uses shared grid behavior

### Parallel Opportunities

- T003 and T004 can run in parallel (different endpoints)
- T005 and T006 can run in parallel (API client vs hooks)
- T011 and T012 can run in parallel if split across view/edit layouts
- T016 and T017 can run in parallel (types vs UI)

---

## Parallel Example: User Story 1

```text
Task: "Update plot grid header rendering to use PlotHeaderCreate for empty columns in web/src/components/plot/PlotGrid.tsx"
Task: "Add dirty-state input handling and fade-in create button in web/src/components/plot/SceneRenderer/PlotHeaderCreate.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Implement view mode layout and hover toolbar in web/src/components/plot/PlotHeader.tsx"
Task: "Implement edit mode form with title, description, and color input in web/src/components/plot/PlotHeader.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add disabled prop to empty card renderer types in web/src/components/plot/plot.types.ts"
Task: "Implement disabled visuals and blocked interaction in web/src/components/plot/SceneRenderer/EmptyCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Validate independently
3. Add User Story 2 → Validate independently
4. Add User Story 3 → Validate independently
5. Finish Polish phase
