# Feature Specification: Server Error Logging

**Feature Branch**: `017-server-error-logging`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Server needs helpful error output for debugging for all endpoints"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Actionable error logs for failed requests (Priority: P1)

As a developer debugging a failed API request, I want the server to emit clear error output that includes the error message, location, and request context so I can quickly identify the root cause.

**Why this priority**: Without actionable logs, debugging is blocked and productivity drops immediately.

**Independent Test**: Trigger a failing request and verify a single log entry includes error message, stack trace, and request context; response includes a reference id.

**Acceptance Scenarios**:

1. **Given** an API request throws an unexpected exception, **When** the request completes, **Then** a single log entry includes message, stack trace (or best available source), method, route, and a reference id.
2. **Given** an async handler throws after validation has passed, **When** the request completes, **Then** the error is still logged with source location and the response is consistent with other 5xx errors.

---

### User Story 2 - Safe client-facing error responses (Priority: P2)

As a developer consuming the API, I want error responses to stay consistent and safe while still being traceable to server logs.

**Why this priority**: Client code depends on predictable error formats and must not receive sensitive details.

**Independent Test**: Submit invalid input and confirm the response remains a 4xx with a clear message and a reference id, while logs capture context.

**Acceptance Scenarios**:

1. **Given** a validation error occurs, **When** the request completes, **Then** the response remains a 4xx with the validation message and a reference id, and the log entry includes the same reference id and request context.

---

### User Story 3 - Move-within-plot debugging context (Priority: P3)

As a developer troubleshooting scene move failures, I want logs to include scene and plot identifiers so I can reproduce the issue quickly.

**Why this priority**: The move-within-plot flow is actively failing and needs immediate insight.

**Independent Test**: Call the move-within-plot endpoint with a payload that triggers an error and verify that log output includes story, plot, and scene identifiers.

**Acceptance Scenarios**:

1. **Given** the move-within-plot endpoint fails, **When** the request completes, **Then** the log entry includes story id, plot id, scene id, and user id when available.

---

### Edge Cases

- Errors that are thrown as non-Error values (string, object) still produce a useful message and source context.
- Errors that occur after the response starts do not suppress logging or create duplicate logs.
- Requests missing optional context (story id, scene id) still log with whatever identifiers are available.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST log unexpected errors with message, stack trace (or best available source), HTTP method, route, and status code.
- **FR-002**: System MUST include available request identifiers (user id, story id, plot id, scene id) in error logs when present.
- **FR-003**: System MUST return a consistent 5xx response that includes a human-readable summary and a reference id that matches the log entry.
- **FR-004**: System MUST preserve existing 4xx error responses while still emitting a traceable log entry.
- **FR-005**: System MUST avoid emitting duplicate error logs for a single request.
- **FR-006**: System MUST capture source location details in logs when available (file and line from stack trace).

### Assumptions

- Error output is intended for the server terminal or equivalent runtime logs in the development environment.
- A per-request reference id can be generated without affecting client behavior.
- Client-facing errors must not include sensitive data beyond the reference id.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of 5xx responses from API routes produce a log entry with stack trace and route context within 1 second of completion.
- **SC-002**: For the move-within-plot failure case, developers can identify the originating file and line from the log output.
- **SC-003**: 0 occurrences of 5xx responses without a matching reference id in server logs during local testing.
- **SC-004**: At least 95% of validation/auth errors include a log entry with error type and request context during local testing.
