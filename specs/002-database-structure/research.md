# Research

## Password Storage

- Decision: Use `bcrypt` to hash passwords before persistence; store only the hash.
- Rationale: `bcrypt` is a standard adaptive hashing algorithm with salt handling, suitable for password storage.
- Alternatives considered: `argon2` (strong but not currently in dependencies), `scrypt` (not in dependencies).

## Session Storage

- Decision: Store sessions in the `sessions` collection with a unique token and TTL-based expiration handling.
- Rationale: The spec notes use with `express-session`; the DB can support lookup by token and expiration cleanup.
- Alternatives considered: In-memory sessions (does not scale), Redis-backed session store (not part of stack guardrails).

## Referential Integrity in MongoDB

- Decision: Enforce referential integrity in model/service operations by verifying referenced IDs exist before write.
- Rationale: MongoDB does not enforce foreign keys; application-level checks satisfy FR-010.
- Alternatives considered: Database triggers or external consistency jobs (not supported/overkill).

## Index Strategy

- Decision: Add unique index on `users.email` and `sessions.token`, and lookup indexes on story/plot/tag foreign keys.
- Rationale: Ensures uniqueness and keeps lookup performance under the 200ms p95 target.
- Alternatives considered: No indexes (risk slow lookups, violates performance goals).
