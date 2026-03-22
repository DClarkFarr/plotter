# Tasks: User Dashboard

**Input**: Design documents from `/specs/006-dashboard-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Tasks include Flowbite React usage, TanStack Query for server state, Zustand for UI state, axios `apiClient` for HTTP calls, and fixed dashboard layout requirements.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create stories router scaffold with async handler + error mapping in express/src/routers/storyRouter.ts
- [x] T002 Register stories router under /stories in express/src/routers/apiRouter.ts
- [x] T003 Add story response mapper helper in express/src/routers/storyRouter.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 [P] Align story API types with the contract in web/src/api/types.ts
- [x] T005 [P] Confirm story API client functions (list/create/get) in web/src/api/stories.ts
- [x] T006 [P] Confirm story query + mutation hooks in web/src/hooks/useStories.ts
- [x] T007 Ensure dashboard routes use layout + index files in web/src/routes/dashboard.tsx and web/src/routes/dashboard/index.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Navigate the dashboard (Priority: P1) MVP

**Goal**: Provide the fixed topbar, avatar dropdown, and story grid layout for the main dashboard.

**Independent Test**: Load /dashboard with an authenticated user and verify the topbar, avatar initials, and story grid render with no page scroll.

### Implementation for User Story 1

- [x] T008 [US1] Implement GET /stories list endpoint in express/src/routers/storyRouter.ts using session user id
- [x] T009 [US1] Add list response mapping (stats, description, timestamps) in express/src/routers/storyRouter.ts
- [x] T010 [P] [US1] Add avatar initials helper in web/src/components/layout/avatarInitials.ts
- [x] T011 [P] [US1] Build DashboardTopbar with avatar dropdown in web/src/components/layout/DashboardTopbar.tsx
- [x] T012 [P] [US1] Create StoryCard component in web/src/components/dashboard/StoryCard.tsx
- [x] T013 [P] [US1] Create StoryGrid component in web/src/components/dashboard/StoryGrid.tsx
- [x] T014 [US1] Implement fixed layout shell in web/src/components/layout/DashboardLayout.tsx
- [x] T015 [US1] Implement dashboard page header, + story button, and grid in web/src/pages/dashboard.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Create a new story from the dashboard (Priority: P2)

**Goal**: Allow users to open the create-story modal, submit a title, and navigate to the new story page.

**Independent Test**: Open the modal, enter a title, submit, see modal close, and navigate to the created story URL.

### Implementation for User Story 2

- [x] T016 [P] [US2] Add dashboard UI store for modal state in web/src/store/dashboardStore.ts
- [x] T017 [P] [US2] Build CreateStoryModal in web/src/components/dashboard/CreateStoryModal.tsx
- [x] T018 [US2] Add create-story service helper to normalize owner/description in express/src/services/storyService.ts
- [x] T019 [US2] Implement POST /stories endpoint with title validation in express/src/routers/storyRouter.ts
- [x] T020 [US2] Add create-story error handling in express/src/routers/storyRouter.ts
- [x] T021 [US2] Wire + story button, modal submit, and redirect in web/src/pages/dashboard.tsx
- [x] T022 [US2] Ensure modal overlay does not enable page scroll in web/src/components/dashboard/CreateStoryModal.tsx

**Checkpoint**: User Story 2 is fully functional and independently testable

---

## Phase 5: User Story 3 - View a story page shell (Priority: P3)

**Goal**: Provide a placeholder story page at the story-specific URL.

**Independent Test**: Navigate to /dashboard/story/:storyId and verify placeholder content appears.

### Implementation for User Story 3

- [x] T023 [US3] Implement GET /stories/:storyId endpoint in express/src/routers/storyRouter.ts
- [x] T024 [P] [US3] Create story page placeholder in web/src/pages/story.tsx
- [x] T025 [US3] Add story route file in web/src/routes/dashboard/story.$storyId.tsx

**Checkpoint**: User Story 3 is fully functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T026 [P] Refine dashboard empty state messaging in web/src/components/dashboard/StoryGrid.tsx
- [ ] T027 Validate quickstart steps remain accurate in specs/006-dashboard-ui/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on story routes and hooks
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on story routes

### Parallel Opportunities

- Phase 2 tasks T004-T006 can run in parallel
- User Story 1 tasks T010-T013 can run in parallel
- User Story 2 tasks T016-T017 can run in parallel
- User Story 3 task T024 can run in parallel with T023/T025

---

## Parallel Example: User Story 2

```bash
Task: "Add dashboard UI store for modal state in web/src/store/dashboardStore.ts"
Task: "Build CreateStoryModal in web/src/components/dashboard/CreateStoryModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and validate: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> MVP ready
3. Add User Story 2 -> Test independently -> Dashboard creation flow ready
4. Add User Story 3 -> Test independently -> Story route ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently
