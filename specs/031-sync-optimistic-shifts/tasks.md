# Tasks: Sync Optimistic Shift Logic

**Input**: Design documents from `/specs/031-sync-optimistic-shifts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested; rely on quickstart.md manual verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm alignment context and update feature notes.

- [x] T001 Review backend shift rules and document any new edge cases in specs/031-sync-optimistic-shifts/research.md
- [x] T002 [P] Refresh manual verification notes if new scenarios are added in specs/031-sync-optimistic-shifts/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared client utilities for shift logic and cache updates.

- [x] T003 Create client shift decision helpers mirroring backend rules in web/src/queries/story/shift-logic.ts
- [x] T004 [P] Extend cache update utilities to apply optimistic shifts consistently in web/src/queries/story/shifted-resources.ts

**Checkpoint**: Shared shift logic utilities ready for use by all mutations.

---

## Phase 3: User Story 1 - Accurate row shifting while moving scenes (Priority: P1) 🎯 MVP

**Goal**: Moving scenes applies the same row-shift outcomes as the backend, including bounded-range shifts and same-row cross-plot moves.

**Independent Test**: Move scenes across rows and plots and confirm immediate layout matches the final saved layout (see quickstart.md).

### Implementation for User Story 1

- [x] T005 [US1] Update move-scene optimistic flow to use shared shift helpers in web/src/queries/scene/scene-mutations.ts
- [x] T006 [P] [US1] Align move-range shift math with backend rules in web/src/queries/scene/scene-helpers.ts
- [x] T007 [US1] Ensure move mutations apply shiftedResources responses consistently in web/src/queries/story/shifted-resources.ts

**Checkpoint**: Moving scenes yields the same grid layout before and after server response.

---

## Phase 4: User Story 2 - Reliable shifts for scene creation and deletion (Priority: P2)

**Goal**: Creating and deleting scenes applies consistent shifts matching backend rules.

**Independent Test**: Create and delete scenes in occupied rows and confirm immediate layout matches final saved layout (see quickstart.md).

### Implementation for User Story 2

- [x] T008 [US2] Update create-scene optimistic logic using insert shift helper in web/src/queries/scene/scene-mutations.ts
- [x] T009 [US2] Update delete-scene optimistic logic using removal shift helper in web/src/queries/scene/scene-mutations.ts

**Checkpoint**: Scene create/delete shifts match server outcomes.

---

## Phase 5: User Story 3 - Consistent shifts for section actions (Priority: P3)

**Goal**: Section create, move, and delete apply the same row-shift outcomes as the backend.

**Independent Test**: Create, move, and delete sections to occupied rows and verify immediate layout matches final saved layout (see quickstart.md).

### Implementation for User Story 3

- [x] T010 [US3] Update create-section optimistic logic using section insert shift helper in web/src/queries/section/section-mutations.ts
- [x] T011 [US3] Update move-section optimistic logic to use shared move shift helper in web/src/queries/section/section-mutations.ts
- [x] T012 [US3] Update delete-section optimistic logic using section removal shift helper in web/src/queries/section/section-mutations.ts
- [x] T013 [P] [US3] Align section shift helpers with backend rules in web/src/queries/section/section-helpers.ts

**Checkpoint**: Section actions shift rows consistently with server rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates.

- [x] T014 [P] Update quickstart validation notes in specs/031-sync-optimistic-shifts/quickstart.md if new edge cases were added
- [ ] T015 Run manual verification steps and record outcomes in specs/031-sync-optimistic-shifts/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks user story work
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational phase
- **User Story 2 (P2)**: Starts after Foundational phase
- **User Story 3 (P3)**: Starts after Foundational phase

### Parallel Opportunities

- T002 and T004 can run in parallel with other phase tasks if files do not overlap.
- T006 and T013 can run in parallel as they touch different helper modules.

---

## Parallel Example: User Story 1

```bash
Task: "Update move-scene optimistic flow to use shared shift helpers in web/src/queries/scene/scene-mutations.ts"
Task: "Align move-range shift math with backend rules in web/src/queries/scene/scene-helpers.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate with quickstart.md

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 (MVP)
3. Deliver User Story 2
4. Deliver User Story 3
5. Complete Polish phase
