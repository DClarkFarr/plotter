# Feature Specification: Plot Grid Utilities

**Feature Branch**: `029-plot-grid-utils`  
**Created**: April 10, 2026  
**Status**: Draft  
**Input**: User description: "Let's add a new series of util methods to help with the plot grid. When adding an item to a vertical index, before adding the item, we should check scenes and sections to see if any index exists. If it does, shift the whole grid (we have a method for that). Adding scenes only shifts the grid if that plot + vertical index exists. Adding a section shifts if any of the story's plots has something in that vertical index. We also need a method for removing an item from a row. If a scene is removed from a row, if nothing else exists at that vertical index, then we should shift the grid in reverse (moving all greater items down). If a section is removed or moved, the same thing applies."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Collision-aware insert (Priority: P1)

As a story editor, I need insert operations to automatically make room in the plot grid when an index is already occupied, so new scenes or sections do not overwrite existing items.

**Why this priority**: Prevents data conflicts during authoring and preserves existing grid layout.

**Independent Test**: Can be fully tested by inserting a single scene or section into an occupied vertical index and verifying the grid shifts while preserving existing items.

**Acceptance Scenarios**:

1. **Given** a plot has an item at vertical index 4, **When** a scene is added to that same plot at index 4, **Then** the grid shifts to open index 4 and the new scene is inserted.
2. **Given** any plot in a story has an item at vertical index 2, **When** a section is added at index 2, **Then** the grid shifts to open index 2 across the story and the section is inserted.
3. **Given** no items exist at vertical index 6, **When** a scene or section is added at index 6, **Then** the item is inserted without shifting the grid.

---

### User Story 2 - Safe removal and collapse (Priority: P2)

As a story editor, I need removals to close empty space in the plot grid when an index becomes unused, so the grid stays compact and orderly.

**Why this priority**: Keeps the grid readable and prevents empty gaps that slow editing.

**Independent Test**: Can be fully tested by removing a single scene or section and confirming the reverse shift occurs only when the index becomes empty.

**Acceptance Scenarios**:

1. **Given** a plot has a single item at vertical index 5, **When** that scene is removed, **Then** the grid shifts in reverse so higher indices move down.
2. **Given** multiple items share vertical index 3 within the same plot, **When** one scene is removed, **Then** no reverse shift occurs because the index remains occupied.
3. **Given** a section at vertical index 7 is removed or moved and no plot has any item at index 7, **Then** the grid shifts in reverse across the story.

---

### User Story 3 - Consistent order preservation (Priority: P3)

As a story editor, I need grid utilities to preserve the relative ordering of existing items when shifts occur, so the narrative structure does not change unexpectedly.

**Why this priority**: Protects the intended sequence of scenes and sections after maintenance operations.

**Independent Test**: Can be fully tested by shifting a grid with multiple items and verifying their relative order remains unchanged.

**Acceptance Scenarios**:

1. **Given** items exist at indices 1, 2, and 4, **When** an insert causes a shift at index 2, **Then** the items originally at indices 2 and 4 keep their relative order after shifting.

### Edge Cases

- Inserting at the first or last possible vertical index.
- Removing the only remaining item for a story at a given vertical index.
- Moving an item from one index to another where the destination is already occupied.
- Mixed scene and section items sharing a vertical index.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide utilities to add and remove items in a plot grid row using a vertical index.
- **FR-002**: Before inserting a scene, the system MUST check for any scene or section in the same plot at the target index; if one exists, the system MUST shift the grid to open the index.
- **FR-003**: Before inserting a section, the system MUST check for any scene or section in any plot at the target index; if one exists, the system MUST shift the grid to open the index.
- **FR-004**: When a scene is removed, if no remaining scene or section exists at that vertical index in the same plot, the system MUST shift the grid in reverse so higher indices move down by one.
- **FR-005**: When a section is removed or moved, if no remaining scene or section exists at that vertical index in any plot in the story, the system MUST shift the grid in reverse so higher indices move down by one.
- **FR-006**: Grid shifts MUST preserve the relative ordering of existing items beyond the affected index.
- **FR-007**: Insert and removal utilities MUST produce deterministic results for the same input state.

### Key Entities _(include if feature involves data)_

- **Plot Grid**: The structured collection of plot rows and vertical indices for a story.
- **Plot**: A row in the plot grid that can hold scenes and sections.
- **Scene**: A narrative item placed within a plot at a vertical index.
- **Section**: A story-level item that aligns to a vertical index across plots.
- **Vertical Index**: The shared column position used to align items across plots.

### Assumptions

- A vertical index is a discrete integer position shared across all plots in a story.
- A grid shift moves all items at or above a target index by exactly one position in the shift direction.
- A remove operation can also represent a move when the item is deleted from its original index before insertion at the new one.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of insert operations result in no overlapping items at the same plot and vertical index.
- **SC-002**: 100% of remove operations leave no empty vertical index gaps when the index becomes unoccupied.
- **SC-003**: In user testing, editors report that grid insert/remove actions behave predictably in at least 90% of scenarios.
- **SC-004**: Grid updates complete within 1 second for stories with up to 500 items.
