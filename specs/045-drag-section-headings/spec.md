# Feature Specification: Drag Section Headings

**Feature Branch**: `045-drag-section-headings`  
**Created**: April 23, 2026  
**Status**: Draft  
**Input**: User description: "as a user, I should be able to drag and drop action headings and chapter headings on the plot grid. A user should be able to hover over the chapter or act, see the actions, including a drag handle. When dragging an act, dropzones / section spacers should animate into existence similar to how SceneActionsCard is rendered between cards, except the section drop zones will take up all the columns"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Drag a Section to a New Position (Priority: P1)

As a story plotter, I can pick up an Act or Chapter heading and drag it to a new row position in the grid so that I can reorganize the structure of my story without deleting and recreating sections.

**Why this priority**: This is the core interaction of the feature. All other affordances (hover actions, drop zones) exist to support this.

**Independent Test**: Can be fully tested by having a grid with at least two section headings and some scene rows, dragging one heading to a different row index, and confirming it lands at the target row with the correct title and type.

**Acceptance Scenarios**:

1. **Given** a section heading exists in the grid, **When** I hover over it, **Then** a drag handle button becomes visible on the section row.
2. **Given** I am hovering a section heading and the drag handle is visible, **When** I press and hold the drag handle and begin dragging, **Then** the section row scales down to indicate it is being dragged.
3. **Given** I am actively dragging a section heading, **When** the drag begins, **Then** full-width drop zones animate into existence between every eligible row gap in the grid.
4. **Given** full-width drop zones are visible, **When** I hover over one, **Then** it highlights to indicate it will accept the drop.
5. **Given** I am hovering over a valid drop zone, **When** I release, **Then** the section moves to that row index and the grid re-orders accordingly.
6. **Given** I drop the section onto the same row it came from, **When** the drop completes, **Then** the grid remains unchanged.

---

### User Story 2 - Hover Actions on Section Headings (Priority: P2)

As a story plotter, I can hover over a section heading and see a set of quick actions—including the drag handle and an edit button—so that I always know what I can do with that section.

**Why this priority**: Discoverability of the drag handle and actions is important for usability; without visible affordances, users may not discover drag-and-drop at all.

**Independent Test**: Can be fully tested by hovering each of act and chapter rows and confirming that the drag handle and edit action are both visible and accessible.

**Acceptance Scenarios**:

1. **Given** a section row is in the grid, **When** I am not hovering it, **Then** no action buttons are visible.
2. **Given** a section row is in the grid, **When** I hover over it, **Then** the drag handle button and the edit button become visible.
3. **Given** I click the edit button on a section heading, **Then** the section editor sidebar opens (existing behaviour is preserved).

---

### User Story 3 - Drop Zone Spans All Columns (Priority: P2)

As a story plotter, when I drag a section, the drop zones must span the entire horizontal width of the grid (all plot columns), not just a single column, so that the drop target is always easy to hit regardless of how many plots exist.

**Why this priority**: Section headings span the full grid width, so their drop targets must mirror that span to be intuitive and accessible.

**Independent Test**: Can be tested by dragging a section on a story with 3+ plots and confirming that the drop zone visually spans all plot columns end-to-end.

**Acceptance Scenarios**:

1. **Given** the grid has multiple plot columns, **When** I start dragging a section, **Then** each drop zone spans the full width of all plot columns (mirroring the section row span).
2. **Given** a full-width drop zone is highlighted, **When** I release the section, **Then** the section is placed at the target row index regardless of which part of the drop zone I released over.

---

### Edge Cases

- What happens when the user drags a section onto its current position? The grid remains unchanged.
- What happens when a section is dragged to a row that already contains another section? That adjacent row gap is still a valid drop target; sections can be placed next to each other.
- What happens if there are no eligible rows to drop onto below a section? Drop zones still appear at every other row index, including those above the section.
- What happens when there is only one section in the entire grid? Drop zones appear at all other rows, allowing it to be repositioned freely.
- What happens if the user cancels the drag (e.g., presses Escape or releases outside a drop zone)? The section returns to its original position with no changes persisted.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Section rows MUST show a drag handle affordance only when the user hovers over the section row.
- **FR-002**: The drag handle MUST be the mechanism for initiating a section drag; the drag starts only from the handle, not from the row body.
- **FR-003**: When a section drag starts, the grid MUST render full-width drop zones at each eligible row gap to indicate valid drop targets.
- **FR-004**: Each section drop zone MUST span all plot columns horizontally (matching the full width of a section row, i.e. `gridColumn: "2 / -1"`).
- **FR-005**: Section drop zones MUST animate into existence when dragging starts and animate out when dragging ends, consistent with the existing scene drop zone animation pattern.
- **FR-006**: A section drop zone MUST highlight visually when the dragged section is positioned over it.
- **FR-007**: Releasing a section over a drop zone MUST move that section to the corresponding row index.
- **FR-008**: When a section is moved to a new row index, the system MUST update the section's `verticalIndex` so no two grid entities share the same index after the operation.
- **FR-009**: Dropping a section onto its current row MUST be a no-op — no mutation is called and the grid is unchanged.
- **FR-010**: The edit button on a section heading MUST remain accessible on hover (existing sidebar open behaviour is preserved).
- **FR-011**: The drag handle and edit button MUST be invisible when the user is not hovering the section row.
- **FR-012**: Section drag-and-drop MUST NOT interfere with the existing scene drag-and-drop behaviour.

### Key Entities

- **Section**: An act or chapter heading in the grid identified by a unique ID and a `verticalIndex` that determines its row position.
- **Section Drop Zone**: A full-width interactive row-gap area that appears between rows during a section drag and accepts the dragged section.
- **Vertical Index**: An integer representing the row position of a section, scene, or empty cell. Moving a section updates its vertical index and may require re-indexing of neighbouring rows.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can drag an act or chapter heading to a new position in under 5 seconds from first hover to completed drop.
- **SC-002**: Drop zones appear within 100 ms of initiating a drag, providing immediate visual feedback.
- **SC-003**: 100% of drop operations correctly place the section at the intended row with no index conflicts (verified by 20 consecutive drag operations in QA).
- **SC-004**: Drop zones span the full grid width on stories with 1, 3, and 5+ plots without visual overflow or clipping.
- **SC-005**: The drag handle and edit button are discoverable on first hover without additional instruction for 90% of test users.
- **SC-006**: Cancelling a drag leaves the grid in its original state in 100% of tested cases.

## Assumptions

- The section row already registers `type: "section"` with the drag-and-drop system — this feature adds the corresponding drop zone receivers on top of that foundation.
- Sections may be moved to any row index not occupied by another section; scenes at the target row are shifted to accommodate.
- The grid shift / re-index logic used by existing row operations (insert above/below) can be reused or extended to handle section moves.
- A section cannot be moved to row 0 (the plot header row).
- Act and chapter headings share the same drag-and-drop mechanics; only their visual size (text scale) differs.
