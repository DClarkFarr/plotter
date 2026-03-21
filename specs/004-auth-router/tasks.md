# Tasks: Auth Router

**Input**: Design documents from `/specs/004-auth-router/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add auth dependencies (`express-session`, Mongo session store, bcrypt) to express/package.json
- [x] T002 Add session config values to express/src/utils/env.ts (session secret, cookie settings)
- [x] T003 [P] Create express/src/utils/sessionStore.ts to persist sessions in MongoDB `sessions` collection
- [x] T004 [P] Create express/src/utils/passwords.ts for hashing and verification utilities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Update express/src/utils/app.ts to initialize `express-session` with Mongo-backed store and cookie config
- [x] T006 [P] Add express/src/models/passwordResets.ts with TTL index, create/read/update helpers
- [x] T007 [P] Add express/src/models/authAttempts.ts with TTL index and counters for throttling
- [x] T008 [P] Update express/src/models/users.ts to include `passwordChangedAt` field and setters
- [x] T009 Add express/src/services/authService.ts with shared auth workflows (signup/login/reset/verify)
- [x] T010 Add express/src/services/authAttemptService.ts to enforce throttling rules
- [x] T011 Add express/src/utils/validators.ts for auth payload validation (email, password policy)
- [x] T012 Add express/src/utils/audit.ts to record auth events (signup, login, reset)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create Account (Priority: P1) 🎯 MVP

**Goal**: New users can sign up and receive a session.

**Independent Test**: Submit signup and follow with `GET /api/auth/me` to confirm session.

### Implementation for User Story 1

- [x] T013 [P] Add `signup` handler in express/src/routers/authRouter.ts with validation and error mapping
- [x] T014 [US1] Implement `signup` workflow in express/src/services/authService.ts
- [x] T015 [US1] Register auth router under `/api/auth` in express/src/routers/apiRouter.ts
- [x] T016 [US1] Ensure audit logging and throttling hooks are invoked on signup in authService

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Log In (Priority: P2)

**Goal**: Existing users can log in and receive a session.

**Independent Test**: Submit login and follow with `GET /api/auth/me` to confirm session.

### Implementation for User Story 2

- [x] T017 [P] Add `login` handler in express/src/routers/authRouter.ts with validation and generic errors
- [x] T018 [US2] Implement `login` workflow in express/src/services/authService.ts (password verify, session)
- [x] T019 [US2] Enforce throttling for login attempts in express/src/services/authAttemptService.ts
- [x] T020 [US2] Record login audit events in express/src/utils/audit.ts

**Checkpoint**: User Stories 1 and 2 are functional and independently testable

---

## Phase 5: User Story 3 - Reset Password (Priority: P3)

**Goal**: Users can request a reset and set a new password with a token.

**Independent Test**: Request reset, confirm reset with a valid token, and log in with the new password.

### Implementation for User Story 3

- [x] T021 [P] Add reset request handler in express/src/routers/authRouter.ts (`/reset-password/request`)
- [x] T022 [P] Add reset confirm handler in express/src/routers/authRouter.ts (`/reset-password/confirm`)
- [x] T023 [US3] Implement reset request workflow in express/src/services/authService.ts (token generation, storage)
- [x] T024 [US3] Implement reset confirm workflow in express/src/services/authService.ts (token verify, password update)
- [x] T025 [US3] Invalidate sessions after reset in express/src/services/sessionService.ts and authService
- [x] T026 [US3] Ensure generic responses to avoid account enumeration in reset flows

**Checkpoint**: User Stories 1-3 are functional and independently testable

---

## Phase 6: User Story 4 - View Current User (Priority: P4)

**Goal**: Authenticated users can fetch their profile via `/me`.

**Independent Test**: Call `/api/auth/me` with and without an active session.

### Implementation for User Story 4

- [x] T027 [P] Add `me` handler in express/src/routers/authRouter.ts
- [x] T028 [US4] Add session-to-user lookup helper in express/src/services/authService.ts
- [x] T029 [US4] Enforce authorization response for missing/expired sessions in authRouter

**Checkpoint**: All user stories are functional and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T030 [P] Add security headers and cookie settings review in express/src/utils/app.ts
- [x] T031 [P] Update quickstart in specs/004-auth-router/quickstart.md with session config notes
- [ ] T032 [P] Run model import check script update if new models added (express/scripts/check-model-imports.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational - no dependencies
- **User Story 2 (P2)**: Starts after Foundational - integrates with session handling
- **User Story 3 (P3)**: Starts after Foundational - depends on user and session infrastructure
- **User Story 4 (P4)**: Starts after Foundational - depends on session handling

### Parallel Opportunities

- Phase 1: T002, T003, T004 can run in parallel
- Phase 2: T006, T007, T008 can run in parallel
- Story phases: Router handlers can be added in parallel where they touch distinct blocks

---

## Parallel Example: User Story 1

```bash
Task: "Add signup handler in express/src/routers/authRouter.ts"
Task: "Implement signup workflow in express/src/services/authService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate with `/api/auth/me`

### Incremental Delivery

1. Add User Story 2 → Validate login
2. Add User Story 3 → Validate reset flow
3. Add User Story 4 → Validate current-user endpoint

---

## Notes

- Task ordering prioritizes security foundations before auth endpoints.
- File paths align with existing Express structure and Clean Architecture boundaries.
- No automated tests are planned unless requested later.
