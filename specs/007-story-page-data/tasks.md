# Tasks: Story Page Data Hookup

**Input**: Design documents from `/specs/007-story-page-data/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review story page entry points in web/src/pages/story.tsx and web/src/routes/dashboard/story.$storyId.tsx to confirm integration points

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Extend API domain types for Tag/Plot/Scene and responses in web/src/api/types.ts
- [x] T003 [P] Add story tags, plots-with-scenes, and update story API calls in web/src/api/stories.ts
- [x] T004 [P] Create Zustand story UI store for filters and card settings in web/src/store/storyStore.ts
- [x] T005 Add React Query hooks for story, tags, plots, and update mutation in web/src/hooks/useStory.ts
- [x] T006 [P] Add listScenesByPlotIds helper in express/src/models/scenes.ts
- [x] T007 Add story tags and plots-with-scenes service helpers in express/src/services/storyService.ts
- [x] T008 Add PATCH/GET story endpoints for tags, plots, and update in express/src/routers/storyRouter.ts
- [x] T009 Add storyId validation and ownership checks for tags/plots/update endpoints in express/src/routers/storyRouter.ts
- [x] T010 Add request validation for story update payload in express/src/routers/storyRouter.ts and express/src/utils/validators.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Story Details (Priority: P1) 🎯 MVP

**Goal**: Show story title, description, tags, and plots (with scenes) for a valid story id

**Independent Test**: Load a story page with a known id and confirm the UI renders the story, tags, and plots

### Implementation for User Story 1

- [x] T011 [US1] Read storyId from route params in web/src/routes/dashboard/story.$storyId.tsx and pass it into StoryPage
- [x] T012 [US1] Build StoryHeading view component in web/src/components/story/StoryHeading.tsx
- [x] T013 [US1] Render story data, tags, and plots in web/src/pages/story.tsx using StoryPage queries
- [x] T014 [US1] Add invalid storyId/empty tags/empty plots handling in web/src/pages/story.tsx and web/src/components/story/StoryHeading.tsx

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Edit Story Heading (Priority: P2)

**Goal**: Allow editing and saving story title and description from the heading

**Independent Test**: Edit the title/description, save, and confirm view mode updates immediately

### Implementation for User Story 2

- [x] T015 [US2] Add edit mode UI (title input + description editor + actions) in web/src/components/story/StoryHeading.tsx
- [x] T016 [US2] Wire update mutation with optimistic state refresh in web/src/components/story/StoryHeading.tsx
- [x] T017 [US2] Implement cancel flow to revert edits in web/src/components/story/StoryHeading.tsx

**Checkpoint**: User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Handle Loading and Missing Data (Priority: P3)

**Goal**: Provide skeleton/loading and error states for missing or slow data

**Independent Test**: Simulate slow responses or failed requests and observe correct loader or error UI

### Implementation for User Story 3

- [x] T018 [US3] Add story page skeleton/loading component in web/src/components/story/StoryLoading.tsx
- [x] T019 [US3] Show loading and error states in web/src/pages/story.tsx based on query status

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T020 [P] Update story page documentation in specs/007-story-page-data/quickstart.md if flows change
- [ ] T021 Run quickstart validation steps in specs/007-story-page-data/quickstart.md

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on StoryHeading view from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Can be implemented alongside US1

### Parallel Opportunities

- Phase 2 tasks T002, T003, T004, and T006 can run in parallel (distinct files)
- Phase 3 tasks can proceed once Phase 2 completes
- Phase 5 tasks can proceed in parallel with late P2/P3 UI work if staffing allows

---

## Parallel Example: User Story 1

```bash
Task: "Build StoryHeading view component in web/src/components/story/StoryHeading.tsx"
Task: "Render story data, tags, and plots in web/src/pages/story.tsx using StoryPage queries"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
