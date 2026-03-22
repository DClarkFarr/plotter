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

- [x] T001 Create dashboard component folders in web/src/components/dashboard and web/src/components/layout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Add Story and StoryStats types to web/src/api/types.ts
- [x] T003 [P] Implement story endpoints in web/src/api/stories.ts using axios `apiClient`
- [x] T004 [P] Add story query and mutation hooks in web/src/hooks/useStories.ts with `useQuery()` and `useMutation()`
- [ ] T005 Update dashboard routing to use layout + index route in web/src/routes/dashboard.tsx and web/src/routes/dashboard/index.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Navigate the dashboard (Priority: P1) 🎯 MVP

**Goal**: Provide the fixed topbar, avatar dropdown, and story grid layout for the main dashboard.

**Independent Test**: Load `/dashboard` with an authenticated user and verify the topbar, avatar initials, and story grid render with no page scroll.

### Implementation for User Story 1

- [x] T006 [P] [US1] Add avatar initials helper in web/src/components/layout/avatarInitials.ts
- [x] T007 [P] [US1] Build DashboardTopbar with avatar dropdown in web/src/components/layout/DashboardTopbar.tsx (Flowbite Navbar/Dropdown/Avatar)
- [x] T008 [P] [US1] Create StoryCard component in web/src/components/dashboard/StoryCard.tsx for title, description, and stats
- [x] T009 [P] [US1] Create StoryGrid component in web/src/components/dashboard/StoryGrid.tsx with loading, empty, and scrollable states
- [x] T010 [US1] Implement fixed layout shell in web/src/components/layout/DashboardLayout.tsx (topbar + scrollable main area)
- [x] T011 [US1] Implement dashboard page header, + story button, and grid in web/src/pages/dashboard.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Create a new story from the dashboard (Priority: P2)

**Goal**: Allow users to open the create-story modal, submit a title, and navigate to the new story page.

**Independent Test**: Open the modal, enter a title, submit, see modal close, and navigate to the created story URL.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Add dashboard UI store for modal state in web/src/store/dashboardStore.ts (Zustand)
- [ ] T013 [P] [US2] Build CreateStoryModal in web/src/components/dashboard/CreateStoryModal.tsx (Flowbite Modal, TextInput, Button)
- [ ] T014 [US2] Wire + story button, modal submit, and redirect in web/src/pages/dashboard.tsx using `useMutation()`
- [ ] T015 [US2] Ensure modal overlay does not enable page scroll in web/src/components/dashboard/CreateStoryModal.tsx

**Checkpoint**: User Story 2 is fully functional and independently testable

---

## Phase 5: User Story 3 - View a story page shell (Priority: P3)

**Goal**: Provide a placeholder story page at the story-specific URL.

**Independent Test**: Navigate to `/dashboard/story/:storyId` and verify placeholder content appears.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create story page placeholder in web/src/pages/story.tsx
- [ ] T017 [US3] Add story route file in web/src/routes/dashboard/story.$storyId.tsx that renders StoryPage

**Checkpoint**: User Story 3 is fully functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 [P] Refine dashboard styling for a clean modern look in web/src/components/layout/DashboardTopbar.tsx and web/src/components/dashboard/StoryCard.tsx
- [ ] T019 Validate quickstart steps remain accurate in specs/006-dashboard-ui/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on Story API + hooks
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Parallel Opportunities

- Phase 2 tasks T002-T004 can run in parallel
- User Story 1 tasks T006-T009 can run in parallel
- User Story 2 tasks T012-T013 can run in parallel
- User Story 3 tasks T016 and T017 can run sequentially (route depends on page)

---

## Parallel Example: User Story 1

```bash
Task: "Add avatar initials helper in web/src/components/layout/avatarInitials.ts"
Task: "Build DashboardTopbar with avatar dropdown in web/src/components/layout/DashboardTopbar.tsx"
Task: "Create StoryCard component in web/src/components/dashboard/StoryCard.tsx"
Task: "Create StoryGrid component in web/src/components/dashboard/StoryGrid.tsx"
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
2. Add User Story 1 → Test independently → MVP ready
3. Add User Story 2 → Test independently → Dashboard creation flow ready
4. Add User Story 3 → Test independently → Story route ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently
