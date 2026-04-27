# Research: Change Scene Plot Without Dragging

## Decision 1: Reuse Existing Scene Move Endpoint for Both New UX Entry Points

**Decision**: Use the existing `POST /stories/:storyId/scenes/:sceneId/move-within-plot` endpoint for plot changes triggered from scene actions and scene form.

**Rationale**: The endpoint already supports `fromPlotId`, `toPlotId`, `fromIndex`, and `toIndex`, and already returns `shiftedResources`. Reuse avoids duplicate server behavior and keeps drag and non-drag moves consistent.

**Alternatives considered**:

- Create a dedicated `change-plot` endpoint. Rejected because it duplicates existing move orchestration and increases drift risk.
- Patch scene directly with only `plotId`. Rejected because it bypasses grid-shift conflict handling and can overwrite occupied destinations.

## Decision 2: Destination Collision Always Shifts Downward From Target Index

**Decision**: When the destination plot already contains a scene at the destination `verticalIndex`, shift the grid downward from that index before placing the moved scene.

**Rationale**: This preserves every existing scene and ensures deterministic placement for the moved scene. It directly matches user requirement and existing move-range shift semantics.

**Alternatives considered**:

- Swap scenes at the target row. Rejected because it changes ordering semantics and can surprise users.
- Move scene to nearest empty row automatically. Rejected because it is less predictable and diverges from current grid-shift model.

## Decision 3: Optimistic Updates Must Mirror Server Shift Semantics and Reconcile to Server Output

**Decision**: Keep optimistic shifts driven by `getMoveRangeShift` and always reconcile with server-returned `shiftedResources` in mutation success.

**Rationale**: This provides instant feedback while preserving backend authority. The optimistic view and final persisted state remain aligned, minimizing visual snaps and data drift.

**Alternatives considered**:

- No optimistic shift, wait for server only. Rejected because UX feels laggy for frequent scene moves.
- Optimistic shift without server reconciliation. Rejected due to risk of eventual drift in edge cases.

## Decision 4: Both Entry Points Must Share One Mutation Path

**Decision**: Scene action menu flow and scene form plot selector will call the same scene-move mutation utility.

**Rationale**: Single-path mutations ensure equivalent optimistic logic, error handling, and rollback behavior regardless of where the user initiates the move.

**Alternatives considered**:

- Separate mutation hooks for each UI entry point. Rejected because duplicated logic tends to diverge and increases maintenance risk.

## Edge Cases to Validate

- Selecting the current plot from either entry point should be a no-op.
- Moving to an occupied destination row in a dense grid should shift all affected rows downward from that index.
- Rapid repeated plot changes for the same scene should settle to the final confirmed server state.
- Failed mutation after optimistic shift must fully restore previous scenes/sections cache state.
