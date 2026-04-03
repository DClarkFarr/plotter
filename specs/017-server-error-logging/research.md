# Research: Server Error Logging

## Decision 1: Centralize error logging and responses

**Decision**: Use a single shared error handler for API routes that logs errors once and produces consistent responses.

**Rationale**: Current per-router error handling duplicates logic and can miss logging; a single handler ensures uniform response shape and avoids duplicate logs.

**Alternatives considered**:

- Keep per-router handlers and add logging to each route (rejected: inconsistent, easy to miss).
- Add ad-hoc logging inside services (rejected: mixes concerns, harder to correlate to requests).

## Decision 2: Add request-scoped reference ids and context

**Decision**: Generate a reference id per request and include it in both log output and error responses; capture available identifiers (user/story/plot/scene) from params or body.

**Rationale**: A reference id allows clients and logs to correlate the same failure without exposing stack traces to the client. Context fields make it easy to reproduce the failure.

**Alternatives considered**:

- Use only timestamps for correlation (rejected: not unique under load).
- Log only error message and stack (rejected: insufficient context for route-level debugging).

## Decision 3: Log full details, keep responses safe

**Decision**: Always log full error details (message + stack + context) in server output; keep client responses minimal, with a human-friendly message and reference id.

**Rationale**: The constitution requires root causes in development while protecting sensitive details; server logs meet debugging needs without leaking data to clients.

**Alternatives considered**:

- Return stack traces to clients in development (rejected: risk of leaking sensitive data and encourages reliance on client output).
- Suppress stack traces entirely (rejected: blocks debugging).
