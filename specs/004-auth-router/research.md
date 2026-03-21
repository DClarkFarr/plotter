# Research: Auth Router

## Decisions

### Session Storage Strategy

- **Decision**: Use `express-session` with a Mongo-backed store that writes to the existing `sessions` collection.
- **Rationale**: Matches the spec requirement for cookie sessions stored in MongoDB and aligns with the existing `sessions` model and TTL index behavior.
- **Alternatives considered**: Stateless JWTs (rejected by spec), in-memory sessions (not durable across restarts).

### Session Cookie Security

- **Decision**: Use HTTP-only, same-site cookies with secure flag in production and a 7-day inactivity timeout.
- **Rationale**: Meets security requirements, mitigates CSRF via same-site cookies, and matches clarified session timeout.
- **Alternatives considered**: CSRF tokens (not selected per clarification), long-lived cookies (higher exposure risk).

### Password Hashing

- **Decision**: Store password hashes using a slow adaptive hash (bcrypt with per-user salt).
- **Rationale**: Widely supported, tested, and appropriate for user credentials in Node.js environments.
- **Alternatives considered**: Argon2 (acceptable but heavier dependency), PBKDF2 (acceptable but less common in this codebase).

### Password Reset Tokens

- **Decision**: Store a hashed reset token with a 1-hour TTL and single-use enforcement.
- **Rationale**: Prevents token theft replay, aligns with clarified expiry, and supports auditability.
- **Alternatives considered**: Plain tokens stored in DB (rejected due to replay risk).

### Throttling / Abuse Protection

- **Decision**: Track auth attempts in MongoDB with a short TTL window keyed by email + IP.
- **Rationale**: Provides consistent throttling across server restarts without external infrastructure.
- **Alternatives considered**: In-memory rate limiting (not durable), external rate limiter (out of scope).
