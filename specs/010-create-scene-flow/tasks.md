# Tasks: Create Scene Editor Flow

**Input**: Design documents from `/specs/010-create-scene-flow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and governance prerequisites

- [x] T001 Update constitution to approve TipTap and dnd-kit in .specify/memory/constitution.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Add scene API types (inputs/responses) in web/src/api/types.ts
- [x] T003 [P] Create scene editor state store in web/src/store/sceneEditorStore.ts
- [x] T004 Add scene API client functions in web/src/api/stories.ts (createScene, updateScene)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Scene and Open Editor (Priority: P1) 🎯 MVP

**Goal**: Create a scene from an empty slot, select it, and open the sidebar editor immediately.

**Independent Test**: Click an empty slot, confirm scene creation with default title, and verify the sidebar opens with that scene selected.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add scene router with create/update endpoints in express/src/routers/sceneRouter.ts
- [x] T006 [US1] Mount scene router under stories in express/src/routers/apiRouter.ts
- [x] T007 [P] [US1] Extend scene workflow helpers in express/src/services/sceneService.ts (story ownership checks, create/update orchestration)
- [x] T008 [P] [US1] Add scene lookup helpers for story scoping in express/src/models/scenes.ts
- [x] T009 [P] [US1] Add create/update scene mutations with optimistic cache updates in web/src/hooks/useStory.ts
- [x] T010 [US1] Wire EmptyCard create action to createScene mutation in web/src/components/plot/SceneRenderer/EmptyCard.tsx
- [x] T011 [US1] Thread storyId/plot context into EmptyCard via web/src/components/plot/PlotGrid.tsx and web/src/components/plot/SortablePlot.tsx
- [x] T012 [US1] Add scene selection actions and sidebar-open behavior in web/src/store/sceneEditorStore.ts
- [x] T013 [US1] Render selected scene summary in sidebar using web/src/components/story/StoryForm.tsx and web/src/components/layout/DashboardLayout.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Edit Scene In Place (Priority: P2)

**Goal**: Provide in-place editing for title and description with rich text support.

**Independent Test**: Edit title and formatted description in the sidebar without a visual mode switch.

### Implementation for User Story 2

- [x] T014 [P] [US2] Add TipTap dependencies in web/package.json
- [x] T015 [US2] Implement in-place title input styling in web/src/components/story/StoryForm.tsx
- [x] T016 [US2] Add rich text editor component in web/src/components/story/SceneDescriptionEditor.tsx
- [x] T017 [US2] Persist title/description edits via updateScene mutation in web/src/hooks/useStory.ts

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - Manage Tags via Modal (Priority: P2)

**Goal**: Show selected tags inline and manage tags via a modal with live updates.

**Independent Test**: Toggle tag checkboxes in the modal and confirm badge list updates immediately.

### Implementation for User Story 3

- [x] T018 [P] [US3] Create inline tag badge list in web/src/components/story/SceneTags.tsx
- [x] T019 [P] [US3] Create tag selection modal in web/src/components/story/SceneTagsModal.tsx
- [x] T020 [US3] Wire modal state to web/src/store/sceneEditorStore.ts and useStoryTagsQuery in web/src/components/story/StoryForm.tsx
- [x] T021 [US3] Persist tag changes via updateScene mutation in web/src/hooks/useStory.ts

**Checkpoint**: User Story 3 is fully functional and testable independently

---

## Phase 6: User Story 4 - Manage Todo List (Priority: P3)

**Goal**: Provide a sortable todo checklist with completion styling.

**Independent Test**: Toggle todo items and reorder them via drag-and-drop, confirming persistence.

### Implementation for User Story 4

- [x] T022 [P] [US4] Add dnd-kit dependencies in web/package.json
- [x] T023 [US4] Build todo list UI in web/src/components/story/SceneTodoList.tsx
- [x] T024 [US4] Add dnd-kit sortable behavior in web/src/components/story/SceneTodoList.tsx
- [x] T025 [US4] Persist todo updates via updateScene mutation in web/src/hooks/useStory.ts

**Checkpoint**: User Story 4 is fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T026 Update quickstart validation notes in specs/010-create-scene-flow/quickstart.md
- [x] T027 [P] Review error handling consistency in express/src/routers/sceneRouter.ts and web/src/hooks/useStory.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on create/update mutation plumbing from US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on scene selection plumbing from US1
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Depends on scene selection plumbing from US1

### Parallel Opportunities

- T002 and T003 can run in parallel
- Backend tasks T005 and T007/T008 can run in parallel
- Frontend tasks T009 and T011 can run in parallel once API client is ready
- Tag UI tasks (T018, T019) can run in parallel
- Todo tasks (T023, T024) can run in parallel after dependencies are added

---

## Parallel Example: User Story 1

```bash
Task: "Add scene router with create/update endpoints in express/src/routers/sceneRouter.ts"
Task: "Extend scene workflow helpers in express/src/services/sceneService.ts (story ownership checks, create/update orchestration)"
Task: "Add scene lookup helpers for story scoping in express/src/models/scenes.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
