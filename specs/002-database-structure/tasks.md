---
description: "Task list for Database Structure feature"
---

# Tasks: Database Structure

**Input**: Design documents from `/specs/002-database-structure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Update collection registry in express/src/models/collections.ts for users, stories, tags, plots, scenes, sessions
- [ ] T002 [P] Extend shared model types for ids and timestamps in express/src/models/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Add ObjectId validation/coercion helpers in express/src/models/types.ts for shared use
- [ ] T004 Add createdAt/updatedAt helper utilities in express/src/models/types.ts to standardize timestamps

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Share Stories (Priority: P1) MVP

**Goal**: Create stories with owner/editor permissions and user identities with unique emails.

**Independent Test**: Create a user, create a story with an owner permission, then add an editor permission for another user.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Create user model types and collection getter in express/src/models/users.ts
- [ ] T006 [US1] Implement user CRUD and unique email index setup in express/src/models/users.ts
- [ ] T007 [P] [US1] Create story model types and collection getter in express/src/models/stories.ts
- [ ] T008 [US1] Implement story CRUD, permission helpers, and indexes in express/src/models/stories.ts
- [ ] T008a [US1] Add soft-delete fields (for example, deletedAt) and ensure list/get helpers exclude soft-deleted stories by default in express/src/models/stories.ts
- [ ] T008b [US1] Add story restore helper to clear deletedAt in express/src/models/stories.ts (optional)
- [ ] T009 [US1] Add user existence validation for story permissions in express/src/models/stories.ts

**Checkpoint**: User Story 1 should be functional and independently testable

---

## Phase 4: User Story 2 - Organize Plots, Scenes, and Tags (Priority: P2)

**Goal**: Create plots, scenes, and tags linked to stories with ordered indices and tag references.

**Independent Test**: Create a plot and scene with tags for a story and confirm ordering values persist.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Expand plot schema/types and collection getter in express/src/models/plots.ts
- [ ] T011 [US2] Implement plot CRUD, storyId checks, and indexes in express/src/models/plots.ts
- [ ] T011a [US2] Implement stable insert reindexing for plot ordering (shift existing items down on insert/move) in express/src/models/plots.ts
- [ ] T012 [P] [US2] Create tag model types and collection getter in express/src/models/tags.ts
- [ ] T013 [US2] Implement tag CRUD and storyId/name indexes in express/src/models/tags.ts
- [ ] T014 [P] [US2] Create scene model types and collection getter in express/src/models/scenes.ts
- [ ] T015 [US2] Implement scene CRUD, tag validation, and indexes in express/src/models/scenes.ts
- [ ] T015a [US2] Implement stable insert reindexing for scene ordering (shift existing items down on insert/move) in express/src/models/scenes.ts

**Checkpoint**: User Story 2 should be functional and independently testable

---

## Phase 5: User Story 3 - Start and End Sessions (Priority: P3)

**Goal**: Start sessions with tokens and expire or end them cleanly.

**Independent Test**: Create a session token with expiry and verify it is invalid after expiration.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create session model types and collection getter in express/src/models/sessions.ts
- [ ] T017 [US3] Implement session CRUD, token lookup, and TTL index in express/src/models/sessions.ts
- [ ] T017a [US3] Enforce expiresAt validation in session lookup helpers (reject expired tokens) in express/src/models/sessions.ts

**Checkpoint**: User Story 3 should be functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 [P] Align documentation fields with implementation in specs/002-database-structure/data-model.md
- [ ] T019 Run quickstart validation steps and update specs/002-database-structure/quickstart.md with any adjustments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - uses story IDs from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - independent of US1/US2 data structures

### Parallel Opportunities

- All tasks marked [P] can be run in parallel (different files, no dependencies)
- After Phase 2, User Stories 1-3 can be assigned to separate owners in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Create user model types and collection getter in express/src/models/users.ts"
Task: "Create story model types and collection getter in express/src/models/stories.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Create tag model types and collection getter in express/src/models/tags.ts"
Task: "Create scene model types and collection getter in express/src/models/scenes.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Create session model types and collection getter in express/src/models/sessions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and validate
3. Add User Story 2 and validate
4. Add User Story 3 and validate
5. Perform Polish phase adjustments
