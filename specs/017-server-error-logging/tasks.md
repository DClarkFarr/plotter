# Tasks: Server Error Logging

**Input**: Design documents from /specs/017-server-error-logging/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Includes tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared structures for error responses and context capture.

- [x] T001 Create request context types and helpers in express/src/utils/requestContext.ts
- [x] T002 Create error response helpers in express/src/utils/errorResponse.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [x] T003 Add request reference id middleware in express/src/utils/requestId.ts and register in express/src/utils/app.ts
- [x] T004 Add shared async handler wrapper in express/src/utils/asyncHandler.ts
- [x] T005 Add shared error handler scaffold in express/src/utils/errorHandler.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Actionable error logs for failed requests (Priority: P1) 🎯 MVP

**Goal**: Ensure unexpected errors log a single, context-rich entry with stack trace and route details.

**Independent Test**: Trigger a failing request and verify logs include message, stack trace, method, route, and reference id.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement error log formatting and stack parsing in express/src/utils/errorLogging.ts
- [x] T007 [US1] Wire error logging into express/src/utils/errorHandler.ts for 5xx cases
- [x] T008 [P] [US1] Replace authRouter per-route error handling with shared handler in express/src/routers/authRouter.ts
- [x] T009 [P] [US1] Replace characterRouter per-route error handling with shared handler in express/src/routers/characterRouter.ts
- [x] T010 [P] [US1] Replace storyRouter per-route error handling with shared handler in express/src/routers/storyRouter.ts
- [x] T011 [P] [US1] Replace sceneRouter per-route error handling with shared handler in express/src/routers/sceneRouter.ts

**Checkpoint**: User Story 1 is fully functional and independently verifiable.

---

## Phase 4: User Story 2 - Safe client-facing error responses (Priority: P2)

**Goal**: Return consistent, safe error responses with a reference id while logging full details server-side.

**Independent Test**: Submit invalid input and verify response includes reference id and field when applicable, while logs include full context.

### Implementation for User Story 2

- [x] T012 [US2] Implement response shaping with reference id in express/src/utils/errorHandler.ts
- [x] T013 [P] [US2] Ensure validation/auth error branches include reference id and field in express/src/utils/errorHandler.ts
- [x] T014 [US2] Remove obsolete per-router error response formatting in express/src/routers/authRouter.ts, express/src/routers/characterRouter.ts, express/src/routers/storyRouter.ts, express/src/routers/sceneRouter.ts

**Checkpoint**: User Story 2 works independently with consistent responses.

---

## Phase 5: User Story 3 - Move-within-plot debugging context (Priority: P3)

**Goal**: Log story, plot, and scene identifiers when move-within-plot fails.

**Independent Test**: Call the move-within-plot endpoint with a failing payload and verify logs include storyId, plotId, sceneId, and userId when available.

### Implementation for User Story 3

- [x] T015 [P] [US3] Capture storyId, plotId, sceneId, userId in express/src/utils/requestContext.ts
- [x] T016 [US3] Ensure sceneRouter move-within-plot includes plotId/sceneId in request context usage in express/src/routers/sceneRouter.ts

**Checkpoint**: User Story 3 logs include move-within-plot identifiers.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T017 [P] Validate quickstart instructions and update specs/017-server-error-logging/quickstart.md if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - depends on shared error handler from US1.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - depends on request context helpers from Setup.

### Parallel Opportunities

- T006, T008, T009, T010, T011 can run in parallel after Phase 2.
- T013 can run in parallel with T012 once error handler scaffolding exists.
- T015 can run in parallel with T012 after Phase 2.

---

## Parallel Example: User Story 1

```bash
Task: "Implement error log formatting and stack parsing in express/src/utils/errorLogging.ts"
Task: "Replace authRouter per-route error handling with shared handler in express/src/routers/authRouter.ts"
Task: "Replace characterRouter per-route error handling with shared handler in express/src/routers/characterRouter.ts"
Task: "Replace storyRouter per-route error handling with shared handler in express/src/routers/storyRouter.ts"
Task: "Replace sceneRouter per-route error handling with shared handler in express/src/routers/sceneRouter.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate logs for a failing request

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate logging
3. User Story 2 → validate response shape
4. User Story 3 → validate move-within-plot context
5. Polish tasks
