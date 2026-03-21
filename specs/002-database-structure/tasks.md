---
description: "Task list for Database Structure refactor"
---

# Tasks: Database Structure Refactor

**Input**: Design documents from `/specs/002-database-structure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Constitution Check

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.

## Scope Notes

- CRUD entities, timestamps, soft delete, and session invalidation already exist; this refactor focuses on model boundaries and services.
- New tasks are limited to service orchestration, model import removal, and enforcement checks.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define service boundaries and enforcement scaffolding

- [x] T001 [P] Document service responsibilities in specs/002-database-structure/plan.md
- [x] T002 [P] Inventory current model-to-model imports in express/src/models/ (plots.ts, scenes.ts, sessions.ts, stories.ts, tags.ts)
- [x] T003 [P] Add a model-import check script in express/scripts/check-model-imports.ts
- [x] T004 Add a npm script hook in express/package.json for the model-import check

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enforce boundaries and provide base single-collection helpers

- [x] T005 Create single-collection lookup helpers in express/src/models/users.ts (e.g., listUsersByIds)
- [x] T006 Create single-collection lookup helpers in express/src/models/stories.ts (e.g., listStoriesByIds)
- [x] T007 Create single-collection lookup helpers in express/src/models/plots.ts (e.g., listPlotsByIds)
- [x] T008 Create single-collection lookup helpers in express/src/models/tags.ts (e.g., listTagsByIds)
- [x] T009 Confirm no export barrels needed for model helpers in express/src/models/types.ts

**Checkpoint**: Model helpers are single-collection only; no cross-model imports remain after refactors.

---

## Phase 3: User Story 1 - Create and Share Stories (Priority: P1) 🎯 MVP

**Goal**: CRUD story permissions without cross-model imports; multi-collection validation lives in services.

**Independent Test**: Create a story with owner + editor permissions; verify validation uses service flow only.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create StoryService in express/src/services/storyService.ts with permission validation using model helpers
- [x] T011 [US1] Move validateStoryPermissionsUsers from express/src/models/stories.ts to express/src/services/storyService.ts
- [x] T012 [US1] Update express/src/models/stories.ts to remove getUsersCollection import and accept validated permissions as input
- [x] T013 [US1] Confirm no story-related call sites require updates yet

**Checkpoint**: Story creation and update paths use StoryService orchestration with model CRUD-only helpers.

---

## Phase 4: User Story 2 - Organize Plots, Scenes, and Tags (Priority: P2)

**Goal**: Enforce plot/scene/tag validation and ordering via services; models remain single-collection CRUD.

**Independent Test**: Create a plot and scene with tags; ordering conflicts shift; all validation occurs in services.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create PlotService in express/src/services/plotService.ts to handle story existence and ordering shifts via model calls
- [x] T015 [P] [US2] Create TagService in express/src/services/tagService.ts to validate story existence and tag uniqueness via model calls
- [x] T016 [P] [US2] Create SceneService in express/src/services/sceneService.ts to validate plot existence, tag ownership, and ordering via model calls
- [x] T017 [US2] Remove getStoriesCollection import from express/src/models/plots.ts and move story validation/ordering orchestration into PlotService
- [x] T018 [US2] Remove getStoriesCollection import from express/src/models/tags.ts and move story validation into TagService
- [x] T019 [US2] Remove getPlotsCollection/getTagsCollection imports from express/src/models/scenes.ts and move validation/orchestration into SceneService
- [x] T020 [US2] Confirm plots model does not require story inputs after moving validation to services
- [x] T021 [US2] Confirm scenes model does not require plot/tag inputs after moving validation to services
- [x] T022 [US2] Confirm tags model does not require story inputs after moving validation to services

**Checkpoint**: Plot/scene/tag operations use services for cross-collection validation and ordering logic.

---

## Phase 5: User Story 3 - Start and End Sessions (Priority: P3)

**Goal**: Session validation uses UserService; models remain CRUD-only.

**Independent Test**: Create a session tied to a user; confirm expired tokens are rejected.

### Implementation for User Story 3

- [x] T023 [P] [US3] Create UserService in express/src/services/userService.ts to validate user existence and unique email behavior
- [x] T024 [P] [US3] Create SessionService in express/src/services/sessionService.ts to orchestrate session creation and validation using model calls
- [x] T025 [US3] Remove getUsersCollection import from express/src/models/sessions.ts and move assertUserExists into SessionService
- [x] T026 [US3] Confirm sessions model no longer requires user inputs after moving validation to services
- [x] T027 [US3] Move email uniqueness checks from express/src/models/users.ts into UserService and keep model CRUD-only

**Checkpoint**: Session creation and email uniqueness validation are handled via services only.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, enforcement, and verification

- [x] T028 [P] Audit express/src/services/ to ensure no direct MongoDB driver calls
- [x] T029 [P] Remove any remaining model-to-model imports in express/src/models/
- [x] T030 [P] Update express/README.md with service/model boundary rules and the model-import check command
- [ ] T031 Run quickstart validation steps in specs/002-database-structure/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on user story phases completion

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational phase
- **User Story 2 (P2)**: Starts after Foundational phase
- **User Story 3 (P3)**: Starts after Foundational phase

### Parallel Opportunities

- Phase 1 tasks T001-T003 are parallelizable
- Phase 2 helper additions T005-T008 are parallelizable across model files
- Service creation tasks T010, T014-T016, T023-T024 can proceed in parallel

---

## Parallel Example: User Story 2

```bash
Task: "Create PlotService in express/src/services/plotService.ts"
Task: "Create TagService in express/src/services/tagService.ts"
Task: "Create SceneService in express/src/services/sceneService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate story creation and permission validation via StoryService

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate
3. User Story 2 → validate ordering and tag ownership
4. User Story 3 → validate session lifecycle
