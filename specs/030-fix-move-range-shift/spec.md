# Feature Specification: Fix Move Range Shift Logic

**Feature Branch**: `030-fix-move-range-shift`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "I want to build out logic and them implment the changes for method #sym:getMoveRangeShift . The function definition has been changed. The implementation has not. So those are broken for now. After the method is fixed, to match the new definition, we need to fix them."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Move Items Without Unintended Shifts (Priority: P1)

As a user arranging story content, I want moving a scene or section within the same plot and row to leave the grid unchanged so that my layout does not shift unexpectedly.

**Why this priority**: Unintended shifts can break a user’s layout and cause confusion during routine edits.

**Independent Test**: Move a scene or section to the same plot and same row and verify no rows shift and the item stays in place.

**Acceptance Scenarios**:

1. **Given** a grid with an item at row 5 in plot A, **When** the item is moved to row 5 in plot A, **Then** no rows shift and the item remains at row 5.
2. **Given** a grid with multiple occupied rows, **When** a move is attempted that results in the same source and destination row in the same plot, **Then** the grid remains unchanged.

---

### User Story 2 - Move Items Across Plots at the Same Row (Priority: P2)

As a user, I want moving a scene to another plot at the same row to either place it directly or make room if the target row is occupied so that the move does not overwrite existing content.

**Why this priority**: Cross-plot moves are common and must preserve existing content without conflicts.

**Independent Test**: Move a scene from plot A row 7 to plot B row 7 and verify the target row is preserved or shifted safely.

**Acceptance Scenarios**:

1. **Given** row 7 in plot B is empty, **When** a scene is moved from plot A row 7 to plot B row 7, **Then** the scene lands at row 7 with no other rows shifting.
2. **Given** row 7 in plot B is occupied, **When** a scene is moved from plot A row 7 to plot B row 7, **Then** rows from row 7 downward shift by one and the moved scene occupies row 7.

---

### User Story 3 - Move Items Across Rows (Priority: P3)

As a user, I want moving a scene or section to a different row to keep the grid consistent by closing gaps or making space based on row occupancy so that the overall ordering remains sensible.

**Why this priority**: Cross-row moves are essential for reordering and must maintain predictable row alignment.

**Independent Test**: Move an item from one row to another and verify the correct range of rows shifts and no content is lost.

**Acceptance Scenarios**:

1. **Given** a move from row 4 to row 6 where row 4 becomes empty and row 6 is occupied, **When** the move is applied, **Then** rows between 5 and 6 shift toward row 4 and the moved item lands at row 6.
2. **Given** a move from row 8 to row 5 where row 8 remains occupied by other content, **When** the move is applied, **Then** rows from row 5 shift down by one to make space.

### Edge Cases

- Moving a section (which occupies a full row) should always treat the source row as empty after the move.
- Moving a scene from a row that still has other scenes in other plots should not collapse that row.
- Moving to an empty target row should not shift other rows.
- Moving to an adjacent row should use the same bounded-range shift rules as multi-row moves.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST compute a shift plan for move operations that specifies a range of rows and a shift direction/amount.
- **FR-002**: If the source plot and destination plot are the same and the source row equals the destination row, the system MUST return a no-shift plan.
- **FR-003**: If the destination plot differs but the destination row is the same as the source row and is occupied, the system MUST shift rows starting at the destination row down by one before placing the item.
- **FR-004**: If the destination row differs and the target row is occupied while the source row becomes empty, the system MUST shift rows between the source and destination toward the source row by one.
- **FR-005**: If the destination row differs and the target row is occupied while the source row remains occupied, the system MUST shift rows starting at the destination row down by one.
- **FR-006**: If the destination row differs and the target row is not occupied, the system MUST return a no-shift plan.
- **FR-007**: For section moves, the system MUST treat the source row as empty after the move.
- **FR-008**: For scene moves, the system MUST determine source row emptiness by ignoring the moved scene and checking other plots and sections.
- **FR-009**: The system MUST avoid row overlap between scenes and sections after any move.
- **FR-010**: The system MUST preserve the total count of scenes and sections after applying the shift plan.
- **FR-011**: The system MUST reject move-shift planning when plots are missing or belong to different stories.

### Key Entities _(include if feature involves data)_

- **Story**: The container that holds multiple plots and their shared grid rows.
- **Plot**: A vertical lane within a story that contains scenes aligned to grid rows.
- **Grid Row**: A position in the shared vertical ordering that can be occupied by a section or one or more scenes.
- **Scene**: A plot-specific item positioned at a grid row.
- **Section**: A story-level item that occupies an entire grid row.
- **Move Operation**: A user action that repositions a scene or section from one row to another.
- **Shift Plan**: The computed instruction describing which rows shift and by how much.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: For a defined test suite covering same-row, adjacent-row, and multi-row moves, 100% of moves result in the expected row occupancy.
- **SC-002**: After any move, there are zero instances where a row contains both a section and a scene.
- **SC-003**: After any move, the total count of scenes and sections remains unchanged.
- **SC-004**: Users can complete a move operation without manual cleanup in at least 95% of scripted move scenarios.

## Assumptions

- The destination row is considered occupied if any scene exists in the target plot at that row or a section exists at that row.
- Moves are processed one at a time; concurrent edits are out of scope for this change.
