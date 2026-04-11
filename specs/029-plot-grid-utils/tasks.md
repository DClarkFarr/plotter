# Tasks: Plot Grid Utilities

**Input**: Design documents from `/specs/029-plot-grid-utils/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested (manual validation only).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create plot grid utilities module scaffold in express/src/utils/plotGridUtils.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add downward shift helper for scenes in express/src/models/scenes.ts
- [x] T003 [P] Add downward shift helper for sections in express/src/models/sections.ts
- [x] T004 [P] Add bounded-range shift helper for scenes in express/src/models/scenes.ts
- [x] T005 [P] Add bounded-range shift helper for sections in express/src/models/sections.ts
- [x] T006 Implement shared occupancy checks and shift orchestration in express/src/utils/plotGridUtils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Collision-aware insert (Priority: P1) 🎯 MVP

**Goal**: Insert scenes or sections at occupied indices without overwriting existing items.

**Independent Test**: Add a scene or section at an occupied index and confirm the grid shifts only when the index is occupied.

### Implementation for User Story 1

- [x] T007 [US1] Update scene insert flow to use shift-on-insert rules in express/src/services/sceneService.ts
- [x] T008 [US1] Update section insert flow to use shift-on-insert rules in express/src/services/sectionService.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Safe removal and collapse (Priority: P2)

**Goal**: Collapse the grid only when a removed index becomes empty for the applicable scope.

**Independent Test**: Remove a scene or section and confirm reverse shifts occur only when the index is empty.

### Implementation for User Story 2

- [x] T009 [US2] Add remove-and-collapse helper for plot or story scope in express/src/utils/plotGridUtils.ts
- [x] T010 [US2] Update scene removal flow to use collapse helper in express/src/services/sceneService.ts
- [x] T011 [US2] Update section removal flow to use collapse helper in express/src/services/sectionService.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Consistent order preservation (Priority: P3)

**Goal**: Preserve ordering by applying bounded-range shifts during move operations.

**Independent Test**: Move a scene or section between indices and verify only the bounded range shifts.

### Implementation for User Story 3

- [x] T012 [US3] Implement bounded-range move orchestration in express/src/utils/plotGridUtils.ts
- [x] T013 [US3] Update scene move flow to use bounded-range shifts in express/src/services/sceneService.ts
- [x] T014 [US3] Update section move flow to use bounded-range shifts in express/src/services/sectionService.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 [P] Validate quickstart steps and record results in specs/029-plot-grid-utils/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Utilities before services
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004, T005 can run in parallel (different model files)
- User stories can be implemented in parallel after Phase 2
- T015 can run once implementation tasks complete

---

## Parallel Example: User Story 1

```bash
Task: "Update scene insert flow to use shift-on-insert rules in express/src/services/sceneService.ts"
Task: "Update section insert flow to use shift-on-insert rules in express/src/services/sectionService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo
5. Validate quickstart steps

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid cross-story dependencies that break independence
