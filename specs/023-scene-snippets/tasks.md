# Tasks: Scene Snippets

**Input**: Design documents from `/specs/023-scene-snippets/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested (manual QA only).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared types and baseline support for snippets across API and UI.

- [x] T001 Add snippet types and `snippets` field to Scene API types in web/src/api/types.ts
- [x] T002 Add `Snippet` type and `snippets` field to SceneDefinition/CreateSceneInput/UpdateSceneInput in express/src/models/scenes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API payload support and response mapping for snippets.

- [x] T003 Add snippet parsing/validation for create and update payloads in express/src/routers/sceneRouter.ts
- [x] T004 Include `snippets` in scene responses (toSceneResponse) in express/src/routers/sceneRouter.ts
- [x] T005 Pass snippet updates through the service layer in express/src/services/sceneService.ts
- [x] T006 Add snippet handling to optimistic updates and payloads in web/src/queries/scene/scene-mutations.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Review and edit snippets (Priority: P1) 🎯 MVP

**Goal**: Users can view snippets below the todo list, expand a snippet, and edit its title and rich text content.

**Independent Test**: Open a scene with snippets, expand one, edit label and content, and confirm updates persist in the list and on reload.

### Implementation for User Story 1

- [x] T007 [US1] Add snippet list UI below todo list with collapsed labels in web/src/components/story/SceneForm.tsx
- [x] T008 [US1] Implement expand/collapse state for snippets (no useEffect-driven updates) in web/src/components/story/SceneForm.tsx
- [x] T009 [US1] Wire snippet label edits to updateSceneMutation in web/src/components/story/SceneForm.tsx
- [x] T010 [US1] Render snippet rich text editor in full mode (no `isSimpleMode`) in web/src/components/story/SceneForm.tsx
- [x] T011 [US1] Render snippets in list view with extra horizontal margins and typewriter-like style in web/src/components/story/ListViewScene.tsx

**Checkpoint**: User Story 1 fully functional and independently testable.

---

## Phase 4: User Story 2 - Add a new snippet (Priority: P2)

**Goal**: Users can add a snippet through a modal that explains snippet usage.

**Independent Test**: From a scene with zero snippets, open the add snippet modal, submit a new snippet, and confirm it appears in the list.

### Implementation for User Story 2

- [x] T012 [US2] Add "add snippet" button and modal with helper copy in web/src/components/story/SceneForm.tsx
- [x] T013 [US2] Implement modal submit handler to append snippet and call updateSceneMutation in web/src/components/story/SceneForm.tsx
- [x] T014 [US2] Add empty-state messaging and add action when no snippets exist in web/src/components/story/SceneForm.tsx

**Checkpoint**: User Story 2 fully functional and independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ensure consistency, validation, and manual verification steps.

- [x] T015 [P] Validate snippet input trimming and defaults in express/src/routers/sceneRouter.ts
- [ ] T016 [P] Run quickstart verification steps in specs/023-scene-snippets/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on US2
- **User Story 2 (P2)**: Can start after Foundational - may reuse US1 UI patterns but is independently testable

### Parallel Opportunities

- T001 and T002 can run in parallel (different files).
- T003 and T005 can run in parallel after T002.
- T004 can run in parallel with T005 after T003.
- T007, T008, T009, and T010 can be split across UI and logic work if needed.

---

## Parallel Example: User Story 1

```bash
Task: "Add snippet list UI below todo list with collapsed labels in web/src/components/story/SceneForm.tsx"
Task: "Render snippets in list view with extra horizontal margins and typewriter-like style in web/src/components/story/ListViewScene.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate
3. User Story 2 → validate
4. Polish tasks
