# Research: Sync Optimistic Shift Logic

## Decision 1: Use backend shift rules as the source of truth

**Decision**: Align optimistic UI shifts with the same rules as `getMoveRangeShift`, `shouldShiftForSceneInsert`, and removal shift checks.

**Rationale**: The server already defines the canonical row-shift outcomes. Matching these rules in the optimistic updates prevents temporary grid layouts that diverge from the saved state.

**Alternatives considered**:

- Keep client-specific shift heuristics and rely on server responses to correct later. Rejected because it allows visible inconsistencies and user confusion.
- Skip optimistic shifts and wait for server updates. Rejected because the UI needs immediate feedback during drag and drop.

## Decision 2: Prefer server-returned `shiftedResources` to reconcile cache state

**Decision**: Apply `shiftedResources` from mutation responses when available and ensure optimistic handlers mirror the same shift math.

**Rationale**: Server responses already include the authoritative set of shifted scenes and sections. Using these updates ensures a consistent final layout.

**Alternatives considered**:

- Recompute all shifts client-side after every mutation. Rejected because it duplicates server logic and risks drift.

## Decision 3: Keep all shifts within a single story

**Decision**: Continue to assume all moves happen within the same story context.

**Rationale**: The backend enforces same-story moves and the UI flows are scoped to a story grid.

**Alternatives considered**:

- Support cross-story moves. Rejected as out of scope for this change.

## Edge Cases to Validate

- Moving a scene to the same row in a different plot when the target row is occupied should shift from the target row upward.
- Moving a scene to the same row in a different plot when the target row is empty should not shift any rows.
- Moving a scene from an empty source row to an occupied target should shift only the bounded range between rows (not the full grid).
- Moving a section should treat the source row as empty and use the same bounded-range shift when the target row is occupied.
