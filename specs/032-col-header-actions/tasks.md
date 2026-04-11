# Tasks: Col Header Row Actions

**Input**: Design documents from `/specs/032-col-header-actions/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: No new libraries; Tailwind + Flowbite + unplugin-icons only. Clean architecture boundaries respected.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm reuse points and plan integration

- [x] T001 [P] Review grid shift helpers in express/src/utils/plotGridUtils.ts and web/src/queries/story/shifted-resources.ts
- [x] T002 [P] Review section mutation inputs in web/src/queries/section/section-mutations.ts and section types in web/src/api/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the story grid shift endpoint and client mutation

- [x] T003 Create story grid shift service in express/src/services/storyGridService.ts using shiftGridUpwardFromIndex/shiftGridDownwardFromIndex and validation
- [x] T004 Add POST /:storyId/grid-shift route in express/src/routers/storyRouter.ts with input validation and shiftedResources response
- [x] T005 Add grid shift API call in web/src/api/stories.ts and type definitions in web/src/api/types.ts
- [x] T006 Add TanStack Query mutation in web/src/queries/story/story-mutations.ts for grid shift and applyShiftedResources reconciliation

**Checkpoint**: Grid shift endpoint exists and client mutation is available

---

## Phase 3: User Story 1 - Insert Rows from Header (Priority: P1) 🎯 MVP

**Goal**: Insert rows above or below a header via hover actions

**Independent Test**: Hover a header and insert rows above/below; confirm rows shift and endpoint is called

### Implementation for User Story 1

- [x] T007 [US1] Update web/src/components/plot/ColHeader.tsx to call grid shift mutation for insert-above and insert-below with optimistic applyOptimisticShift
- [x] T008 [US1] Ensure insert actions reconcile shiftedResources via mutation success in web/src/queries/story/story-mutations.ts

**Checkpoint**: Row insertion above/below works, calls the endpoint, and reconciles shifts

---

## Phase 4: User Story 2 - Add Acts or Chapters (Priority: P2)

**Goal**: Insert act/chapter sections and render them in the grid

**Independent Test**: Add act/chapter and see the section row render with correct styling and inline edit

### Implementation for User Story 2

- [x] T009 [US2] Add section rendering to the grid in web/src/components/plot/PlotGrid.tsx using section data
- [x] T010 [US2] Create web/src/components/plot/SectionRow.tsx with inline edit input, 4xl act text, 2xl chapter text, and centered 4px guide line
- [x] T011 [US2] Wire inline edit to use section update mutation in web/src/queries/section/section-mutations.ts

**Checkpoint**: Sections render with styling and inline edits persist

---

## Phase 5: User Story 3 - Clear Empty Row (Priority: P3)

**Goal**: Clear an empty row from the header when eligible

**Independent Test**: Delete button appears only on empty rows and calls the grid shift endpoint

### Implementation for User Story 3

- [x] T012 [US3] Update web/src/components/plot/ColHeader.tsx to call grid shift mutation for clear-empty-row with optimistic applyOptimisticShift
- [x] T013 [US3] Add server-side validation in express/src/services/storyGridService.ts to reject clear requests when target row is not empty

**Checkpoint**: Empty row removal only fires on empty rows and reconciles shifts

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consistency and validation

- [ ] T014 Align ColHeader button styling with SceneCard action buttons in web/src/components/plot/ColHeader.tsx
- [ ] T015 Run quickstart validation steps in specs/032-col-header-actions/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- Phase 1 tasks can run in parallel
- Phase 2 tasks T003-T006 can be parallelized by backend/frontend pairing
- After Phase 2, user stories can be worked on in parallel if needed

---

## Parallel Example: User Story 1

```bash
Task: "Update web/src/components/plot/ColHeader.tsx to call grid shift mutation for insert-above and insert-below with optimistic applyOptimisticShift"
Task: "Ensure insert actions reconcile shiftedResources via mutation success in web/src/queries/story/story-mutations.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add section rendering to the grid in web/src/components/plot/PlotGrid.tsx using section data"
Task: "Create web/src/components/plot/SectionRow.tsx with inline edit input, 4xl act text, 2xl chapter text, and centered 4px guide line"
```

---

## Parallel Example: User Story 3

```bash
Task: "Update web/src/components/plot/ColHeader.tsx to call grid shift mutation for clear-empty-row with optimistic applyOptimisticShift"
Task: "Add server-side validation in express/src/services/storyGridService.ts to reject clear requests when target row is not empty"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate row insertion independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → Validate
3. User Story 2 → Validate
4. User Story 3 → Validate
5. Polish + quickstart validation
