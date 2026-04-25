# Implementation Tasks: Forgot Password Email Flow

**Branch**: `048-password-reset-email`  
**Feature**: Forgot Password Email Flow  
**Created**: April 24, 2026  
**Status**: Ready for Implementation

## Overview

This task list breaks the implementation plan into dependency-ordered work items with explicit file targets. Tasks are grouped by user story so each story can be validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add core email infrastructure and configuration used by all stories.

- [x] T001 Add `nodemailer` dependency in `/Users/daniel/git/plotter/express/package.json`
- [x] T002 Extend env config types/parsers with `MAILER_GMAIL_USER`, `MAILER_GMAIL_PASS`, `MAILER_FROM_EMAIL`, `MAILER_FROM_NAME` in `/Users/daniel/git/plotter/express/src/utils/env.ts`
- [x] T003 Pass new mailer env values in `setupEnvironment()` in `/Users/daniel/git/plotter/express/src/utils/app.ts`
- [x] T004 [P] Create Gmail transport and `sendEmail` helper in `/Users/daniel/git/plotter/express/src/services/emailService.ts`
- [x] T005 [P] Create reset email template builder (text + html) in `/Users/daniel/git/plotter/express/src/services/emailTemplates/passwordResetEmail.ts`
- [x] T006 Document local Gmail placeholder values and app-password requirement in `/Users/daniel/git/plotter/specs/048-password-reset-email/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Evolve password reset data + backend workflow to support code-based reset confirmation.

**Critical**: No user story implementation starts until this phase is complete.

- [x] T007 Update password reset model shape and helpers for code-based verification in `/Users/daniel/git/plotter/express/src/models/passwordResets.ts`
- [x] T008 [P] Add helper to invalidate existing active reset records for a user in `/Users/daniel/git/plotter/express/src/models/passwordResets.ts`
- [x] T009 Add reusable code generation/hash helpers in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T010 Implement request flow to store code hash + expiry and send email template via `emailService` in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T011 Preserve non-enumerating response behavior and audit logging for reset request outcomes in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T012 Update reset confirm route payload contract (`email`, `code`, `password`) in `/Users/daniel/git/plotter/express/src/routers/authRouter.ts`

**Checkpoint**: Backend foundation is ready for independent user story work.

---

## Phase 3: User Story 1 - Request Password Reset Email (Priority: P1) MVP

**Goal**: Users can submit email and receive reset email with a code while always seeing a neutral response.

**Independent Test**: Submit known and unknown emails through request UI/API and verify neutral response; verify known email receives reset message.

### Implementation

- [x] T013 [US1] Confirm API client request shape and response typing for reset request in `/Users/daniel/git/plotter/web/src/api/auth.ts`
- [x] T014 [US1] Refine request form mutation/error mapping for rate limit and generic failures in `/Users/daniel/git/plotter/web/src/hooks/useResetPasswordForm.ts`
- [x] T015 [US1] Update request form copy/state to clarify code delivery by email in `/Users/daniel/git/plotter/web/src/components/forms/ResetPasswordForm.tsx`
- [x] T016 [US1] Wire request-success transition state in `/Users/daniel/git/plotter/web/src/pages/reset-password.tsx`
- [x] T017 [US1] Verify backend request route integration from router to service in `/Users/daniel/git/plotter/express/src/routers/authRouter.ts`
- [ ] T018 [US1] Manual verification: known email gets reset email, unknown email gets same response, no account leakage

**Checkpoint**: Request-email journey is fully functional and testable.

---

## Phase 4: User Story 2 - Submit Code and New Password (Priority: P1)

**Goal**: Users can submit email + reset code + new password and then log in with the new password.

**Independent Test**: Request code, submit valid code + new password, then authenticate with new password and confirm old password fails.

### Implementation

- [x] T019 [US2] Add reset confirmation API function for `{ email, code, password }` in `/Users/daniel/git/plotter/web/src/api/auth.ts`
- [x] T020 [P] [US2] Create confirm-form hook with field validation and mutation handling in `/Users/daniel/git/plotter/web/src/hooks/useResetPasswordConfirmForm.ts`
- [x] T021 [P] [US2] Create code + new password UI form in `/Users/daniel/git/plotter/web/src/components/forms/ResetPasswordConfirmForm.tsx`
- [x] T022 [US2] Implement two-step page orchestration (request step -> confirm step -> success state) in `/Users/daniel/git/plotter/web/src/pages/reset-password.tsx`
- [x] T023 [US2] Implement confirm service logic for validating email/code/password and completing reset in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T024 [US2] Update confirm endpoint handler to pass email/code/password to service in `/Users/daniel/git/plotter/express/src/routers/authRouter.ts`
- [x] T025 [US2] Invalidate active sessions after successful password reset in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [ ] T026 [US2] Manual verification: complete full flow and confirm login works only with new password

**Checkpoint**: End-to-end reset completion works for valid codes.

---

## Phase 5: User Story 3 - Handle Invalid/Expired/Reused Code (Priority: P2)

**Goal**: Invalid, expired, and reused codes are blocked with clear user guidance and safe backend behavior.

**Independent Test**: Attempt reset with invalid/expired/reused code; ensure reset is denied and user can request a new code.

### Implementation

- [x] T027 [US3] Enforce single-use semantics and explicit used-state update in `/Users/daniel/git/plotter/express/src/models/passwordResets.ts`
- [x] T028 [US3] Reject invalid, expired, and reused code attempts with safe error responses in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T029 [US3] Ensure creating a new reset request invalidates prior active codes for the same account in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [ ] T030 [US3] Add audit events for reset failures (without leaking sensitive details) in `/Users/daniel/git/plotter/express/src/services/authService.ts`
- [x] T031 [US3] Map backend error states to clear UI guidance and retry path in `/Users/daniel/git/plotter/web/src/hooks/useResetPasswordConfirmForm.ts`
- [x] T032 [US3] Add "request a new code" UX path in `/Users/daniel/git/plotter/web/src/components/forms/ResetPasswordConfirmForm.tsx`
- [ ] T033 [US3] Manual verification: invalid/expired/reused attempts fail and re-request flow succeeds

**Checkpoint**: Failure states are secure, user-friendly, and recoverable.

---

## Phase 6: Polish & Validation

**Purpose**: Validate cross-cutting quality and lock in developer setup.

- [x] T034 [P] Run install/update for backend dependencies and verify lockfile updates in `/Users/daniel/git/plotter/express/`
- [x] T035 [P] Run backend build/type check and resolve any regressions in `/Users/daniel/git/plotter/express/`
- [x] T036 [P] Run frontend build/type check and resolve any regressions in `/Users/daniel/git/plotter/web/`
- [ ] T037 Validate reset attempt throttling behavior still applies for request and confirm paths
- [ ] T038 Validate success criteria checklist against implemented behavior in `/Users/daniel/git/plotter/specs/048-password-reset-email/spec.md`
- [x] T039 Update implementation notes and execution evidence in `/Users/daniel/git/plotter/specs/048-password-reset-email/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> required before Phase 2
- Phase 2 -> blocks all user story phases
- Phase 3 (US1) -> can ship MVP request flow independently
- Phase 4 (US2) -> depends on Phase 2 and benefits from US1 UI state work
- Phase 5 (US3) -> depends on Phase 4 confirm flow
- Phase 6 -> after all desired stories are complete

### User Story Dependencies

- US1: no dependency on other stories after Foundation
- US2: depends on foundational backend + frontend request step
- US3: depends on US2 confirm implementation

### Parallel Opportunities

- Phase 1: T004 and T005 can run in parallel
- Phase 2: T008 can run while T007 is being implemented if split by commit or pair programming
- Phase 4: T020 and T021 can run in parallel
- Phase 6: T034, T035, and T036 can run in parallel

---

## Implementation Strategy

### MVP First

1. Finish Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate request-email flow in isolation
4. Proceed to US2 for full reset completion

### Incremental Delivery

1. Deliver request flow (US1)
2. Deliver full code confirmation flow (US2)
3. Deliver robust failure handling and retries (US3)
4. Final hardening and verification (Phase 6)
