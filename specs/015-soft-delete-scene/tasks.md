---
description: "Task list for soft delete scene"
---

# Tasks: Soft Delete Scene

**Input**: Design documents from `/specs/015-soft-delete-scene/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Update scene model schema and indexes with `deletedAt` and a partial unique index in express/src/models/scenes.ts
- [x] T002 [P] Add active-scene filter helpers for `deletedAt` in express/src/models/scenes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Update scene query methods to exclude deleted scenes in express/src/models/scenes.ts
- [x] T004 Add soft delete service method and ensure scene lookups ignore deleted scenes in express/src/services/sceneService.ts
- [x] T005 Implement DELETE /stories/:storyId/scenes/:sceneId route in express/src/routers/sceneRouter.ts
- [x] T006 Update story/plot services to use active scene counts and lists in express/src/services/storyService.ts and express/src/services/plotService.ts
- [x] T007 [P] Add deleteScene API client in web/src/api/stories.ts (and update web/src/api/types.ts if needed)
- [x] T008 Add delete scene mutation with cache updates in web/src/queries/scene/scene-mutations.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Remove an active scene (Priority: P1) 🎯 MVP

**Goal**: Remove an active scene from the grid and close the editor on delete.

**Independent Test**: Delete a selected scene and confirm it disappears from the grid and the sidebar closes.

### Implementation for User Story 1

- [x] T009 [US1] Add destructive delete section and button at the bottom of SceneForm in web/src/components/story/SceneForm.tsx
- [x] T010 [US1] Wire delete flow to clear selection, close sidebar, and refresh plots cache in web/src/components/story/SceneForm.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Confirm before deleting (Priority: P2)

**Goal**: Require confirmation before deleting a scene.

**Independent Test**: Open the confirmation modal and cancel without changes.

### Implementation for User Story 2

- [x] T011 [US2] Add Flowbite confirmation modal using `Modal` + `ModalBody` in web/src/components/story/SceneForm.tsx

**Checkpoint**: User Story 2 is independently functional

---

## Phase 5: User Story 3 - See clear failure feedback (Priority: P3)

**Goal**: Show a clear error message when deletion fails.

**Independent Test**: Simulate delete failure and confirm an error alert is shown with no data change.

### Implementation for User Story 3

- [x] T012 [US3] Show delete failure via alert.error from web/src/utils/alert.tsx in web/src/components/story/SceneForm.tsx

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 [P] Validate manual verification steps in specs/015-soft-delete-scene/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Within Each User Story

- UI flows should use the delete mutation and refresh plots cache after success
- Confirmation modal should wrap the destructive action
- Error feedback should not clear selection or close sidebar when deletion fails

### Parallel Opportunities

- T002 and T007 can run in parallel
- T003 and T006 can run in parallel once T001 is done
- User Story tasks can run in parallel after Phase 2 completes

---

## Parallel Example: User Story 1

```bash
Task: "Add destructive delete section and button at the bottom of SceneForm in web/src/components/story/SceneForm.tsx"
Task: "Wire delete flow to clear selection, close sidebar, and refresh plots cache in web/src/components/story/SceneForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Validate
3. Add User Story 2 → Validate
4. Add User Story 3 → Validate
5. Run polish validation
