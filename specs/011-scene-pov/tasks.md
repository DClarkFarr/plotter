# Tasks: Scene POV Selection

**Input**: Design documents from `/specs/011-scene-pov/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add characters collection name in express/src/models/collections.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Checkpoint**: Foundation ready - user story implementation can now begin

- [x] T002 [P] Create characters model with indexes and CRUD in express/src/models/characters.ts
- [x] T003 Implement character service with story scoping and validation in express/src/services/characterService.ts
- [x] T004 Implement character router for list/create endpoints in express/src/routers/characterRouter.ts
- [x] T005 Wire character router into express/src/routers/apiRouter.ts
- [x] T006 Add optional pov field to scene inputs and persistence in express/src/models/scenes.ts
- [x] T007 Add POV validation and update flow in express/src/services/sceneService.ts
- [x] T008 Update scene router parsing and response mapping for pov in express/src/routers/sceneRouter.ts
- [x] T009 Add Character types and pov field to scenes in web/src/api/types.ts
- [x] T010 Add list/create character API methods in web/src/api/stories.ts
- [x] T011 Update story hooks with character queries/mutations and pov optimistic updates in web/src/hooks/useStory.ts

---

## Phase 3: User Story 1 - Assign POV to a Scene (Priority: P1) 🎯 MVP

**Goal**: Let writers choose a single POV character for a scene from the sidebar and persist it.

**Independent Test**: Select a POV in the scene sidebar, reopen the scene, and confirm the selection persists.

### Implementation for User Story 1

- [x] T012 [P] [US1] Add avatar color utility for names in web/src/utils/avatarColor.ts
- [x] T013 [P] [US1] Build react-select POV option/label rendering in web/src/components/story/ScenePovSelect.tsx
- [x] T014 [US1] Add POV selector under the title in web/src/components/story/SceneForm.tsx
- [x] T015 [US1] Load character options and handle empty-state messaging in web/src/components/story/SceneForm.tsx
- [x] T015a [US1] Sort POV options alphabetically and enable clearable selection in web/src/components/story/ScenePovSelect.tsx

**Checkpoint**: User Story 1 works independently

---

## Phase 4: User Story 2 - Add a New Character Inline (Priority: P2)

**Goal**: Create a new character from the POV selector and auto-select it.

**Independent Test**: Add a character from the POV selector and verify it is created and selected.

### Implementation for User Story 2

- [x] T016 [P] [US2] Create inline add-character row component in web/src/components/story/ScenePovCreateRow.tsx
- [x] T017 [US2] Wire save flow to create character and auto-select in web/src/components/story/SceneForm.tsx
- [x] T018 [US2] Handle create character errors in web/src/components/story/SceneForm.tsx

**Checkpoint**: User Story 2 works independently

---

## Phase 5: User Story 3 - See POV on Scene Cards (Priority: P3)

**Goal**: Display POV avatar and name on each scene card.

**Independent Test**: Assign a POV and verify the avatar and name render in the scene card top-right.

### Implementation for User Story 3

- [x] T019 [US3] Add POV lookup helper from character list in web/src/utils/characterLookup.ts
- [x] T020 [US3] Render POV avatar/name on scene cards in web/src/components/plot/SceneRenderer/SceneCard.tsx

**Checkpoint**: User Story 3 works independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 [P] Validate quickstart flow and update notes in specs/011-scene-pov/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion; can proceed in parallel if staffed
- **Polish (Final Phase)**: Depends on completed user stories

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational phase
- **User Story 2 (P2)**: Starts after Foundational phase; uses character creation flow
- **User Story 3 (P3)**: Starts after Foundational phase; displays POV info

### Parallel Opportunities

- Phase 2 tasks T002, T009, T010 can run in parallel (separate files)
- In US1, T012 and T013 can run in parallel
- In US2, T016 can run in parallel with US1 tasks once foundational work is done

---

## Parallel Example: User Story 1

```bash
Task: "Add avatar color utility for names in web/src/utils/avatarColor.ts"
Task: "Build react-select POV option/label rendering in web/src/components/story/ScenePovSelect.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate POV selection persistence in the sidebar

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1 (POV selection)
3. Deliver User Story 2 (inline character creation)
4. Deliver User Story 3 (scene card display)
5. Validate quickstart flow
