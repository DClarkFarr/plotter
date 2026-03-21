# Feature Specification: Auth Router

**Feature Branch**: `004-auth-router`  
**Created**: March 21, 2026  
**Status**: Draft  
**Input**: User description: "Let's create a auth router that is registered to the api router with the `/auth` prefix. Let's add endpoints for a user to A) signup, B) login, C) Reset password and D) a /me endpoint for the current authorized user. Let's follow best practices for security. The session will be cookie-based, will use mongo-session and our sessions and users collections. These sessions, models and services can be updated as needed."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create Account (Priority: P1)

As a new user, I can sign up to create an account and immediately start a session so I can access protected features.

**Why this priority**: Account creation is the entry point for all authenticated features.

**Independent Test**: Can be fully tested by completing signup and verifying the session with a follow-up request to the current-user endpoint.

**Acceptance Scenarios**:

1. **Given** a visitor with valid signup details, **When** they submit signup, **Then** an account is created and an authenticated session is established.
2. **Given** a visitor using an email that already exists, **When** they submit signup, **Then** they receive a clear error and no duplicate account is created.
3. **Given** a visitor with a weak password, **When** they submit signup, **Then** the request is rejected with guidance on password requirements.

---

### User Story 2 - Log In (Priority: P2)

As a returning user, I can log in to start a session so I can continue where I left off.

**Why this priority**: Existing users need a reliable way to access their accounts.

**Independent Test**: Can be fully tested by logging in with valid credentials and verifying access to the current-user endpoint.

**Acceptance Scenarios**:

1. **Given** a user with valid credentials, **When** they submit login, **Then** an authenticated session is established.
2. **Given** a user with invalid credentials, **When** they submit login, **Then** they receive a generic error and no session is established.

---

### User Story 3 - Reset Password (Priority: P3)

As a user who forgot my password, I can request a reset and set a new password so I can regain access.

**Why this priority**: Account recovery is essential for minimizing lockouts and support burden.

**Independent Test**: Can be fully tested by requesting a reset, completing it with a valid token, and logging in with the new password.

**Acceptance Scenarios**:

1. **Given** a reset request with any email, **When** the request is submitted, **Then** the response does not reveal whether the account exists.
2. **Given** a valid reset token, **When** a new password is submitted, **Then** the password is updated and existing sessions are invalidated.
3. **Given** an expired or used token, **When** a reset is attempted, **Then** the reset is rejected with a clear error.

---

### User Story 4 - View Current User (Priority: P4)

As an authenticated user, I can fetch my current profile so the app can display who is signed in.

**Why this priority**: The client needs a reliable way to confirm session status and user identity.

**Independent Test**: Can be fully tested by calling the current-user endpoint with and without an active session.

**Acceptance Scenarios**:

1. **Given** an active authenticated session, **When** the current-user endpoint is called, **Then** the user profile is returned.
2. **Given** no active session, **When** the current-user endpoint is called, **Then** an unauthorized response is returned.

### Edge Cases

- Repeated failed login attempts trigger temporary throttling without locking out valid users indefinitely.
- Password reset tokens are single-use and cannot be replayed.
- Requests are made without cookies or with blocked cookies.
- Sessions are invalidated after password reset, and old sessions cannot access protected endpoints.
- Concurrent signup attempts with the same email are handled without creating duplicates.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST expose authentication endpoints under the `/auth` path, including signup, login, reset password, and current-user.
- **FR-002**: System MUST allow new users to create accounts with a unique email identifier.
- **FR-003**: System MUST establish a cookie-based session on successful signup and login.
- **FR-004**: System MUST provide a current-user endpoint that returns profile data for authenticated sessions and an unauthorized response for unauthenticated requests.
- **FR-005**: System MUST allow users to request a password reset and complete the reset using a time-limited, single-use token.
- **FR-006**: System MUST invalidate active sessions after a successful password reset.
- **FR-007**: System MUST prevent account enumeration for login and password reset flows by returning consistent responses.
- **FR-008**: System MUST enforce a password policy (minimum 12 characters, maximum 128 characters, passphrases allowed).
- **FR-009**: System MUST apply protection against automated abuse, including throttling for repeated login and reset attempts.
- **FR-010**: System MUST protect session cookies against script access and cross-site misuse using standard web security safeguards.
- **FR-011**: System MUST mitigate cross-site request forgery using same-site cookies only.
- **FR-012**: System MUST record audit events for signup, login, logout (if applicable), and password reset actions.
- **FR-013**: System MUST expire sessions after 7 days of inactivity.
- **FR-014**: System MUST expire password reset tokens after 1 hour.
- **FR-015**: System MUST require email and password for signup and login.
- **FR-016**: System MUST invalidate sessions after password reset and after password change.

### Key Entities _(include if feature involves data)_

- **User**: Represents a registered account with unique email, credential data, and status metadata.
- **Session**: Represents an authenticated session tied to a user with creation, expiration, and revocation state.
- **Password Reset**: Represents a password reset request with a token, expiration time, and usage status.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of new users complete signup within 2 minutes.
- **SC-002**: 95% of successful logins complete within 30 seconds from submission.
- **SC-003**: 90% of password reset requests are completed within 15 minutes of the initial request.
- **SC-004**: An independent security review finds no account enumeration through auth endpoints.
- **SC-005**: Authentication endpoints maintain a system-error rate below 1% over a 30-day period.

## Assumptions

- Users authenticate with email and password.
- Password reset instructions are delivered through the user's registered email address.
- The current-user endpoint returns a minimal profile (identifier, email, and display name if available).

## Clarifications

### Session 2026-03-21

- Q: What should the session inactivity timeout be? → A: Session expires after 7 days of inactivity.
- Q: How long should password reset tokens remain valid? → A: Tokens are valid for 1 hour.
- Q: What identifiers should be allowed for authentication? → A: Require email and password.
- Q: When should sessions be forced to log out? → A: After password reset and after password change.
- Q: What CSRF mitigation should be used for cookie-based requests? → A: Use same-site cookies only.

## Out of Scope

- Multi-factor authentication.
- Single sign-on or third-party identity providers.
- Email verification or account activation flows.
