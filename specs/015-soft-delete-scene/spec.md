# Feature Specification: Soft Delete Scene

**Feature Branch**: `015-soft-delete-scene`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Add soft delete logic for active scenes in the story grid. Include a destructive delete section at the bottom of the scene form with a confirmation prompt. On confirm, delete the scene, close the sidebar, clear selection, refresh visible data, and show an error alert if deletion fails."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Remove an active scene (Priority: P1)

As a writer, I want to remove an active scene from the story grid so I can keep my outline focused on current work.

**Why this priority**: This is the primary workflow requested and directly affects the main grid experience.

**Independent Test**: Can be fully tested by deleting one scene and verifying it no longer appears in the grid or sidebar.

**Acceptance Scenarios**:

1. **Given** an active scene is selected in the story grid, **When** I confirm deletion, **Then** the scene is removed from the active grid and the sidebar closes.
2. **Given** an active scene is selected, **When** I confirm deletion, **Then** the current selection is cleared and no scene remains selected.

---

### User Story 2 - Confirm before deleting (Priority: P2)

As a writer, I want a confirmation prompt before deleting so I can avoid accidental removal.

**Why this priority**: Prevents data loss from accidental clicks and is a standard safety expectation.

**Independent Test**: Can be fully tested by opening the delete prompt and canceling without any data changes.

**Acceptance Scenarios**:

1. **Given** I click the delete button, **When** the confirmation prompt appears and I cancel, **Then** the scene remains unchanged and still visible.

---

### User Story 3 - See clear failure feedback (Priority: P3)

As a writer, I want a clear error message if deletion fails so I can try again or adjust my action.

**Why this priority**: Ensures the user understands failure states and does not assume the scene was deleted.

**Independent Test**: Can be fully tested by simulating a delete failure and checking that an error message is shown.

**Acceptance Scenarios**:

1. **Given** I confirm deletion and the system cannot complete it, **When** the attempt fails, **Then** I see a clear error message and the scene remains visible.

### Edge Cases

- What happens when a scene is already deleted but the user attempts to delete again?
- How does the system handle a deletion attempt when the scene is not currently in the active grid?
- What happens if the delete action fails after the confirmation is accepted?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The scene detail view MUST display a clearly marked delete section at the bottom with a destructive action button.
- **FR-002**: The system MUST prompt for confirmation before a deletion is executed.
- **FR-003**: Users MUST be able to cancel deletion without any changes to the scene.
- **FR-004**: Upon confirmed deletion, the system MUST remove the scene from the active story grid.
- **FR-005**: Upon confirmed deletion, the system MUST close the scene detail panel and clear the current scene selection.
- **FR-006**: The system MUST keep deleted scenes out of active scene results unless explicitly restored in a separate feature.
- **FR-007**: If deletion fails, the system MUST show a clear error message and leave the scene unchanged.

### Key Entities _(include if feature involves data)_

- **Scene**: A story element with a visible active state and a deleted state.
- **Story Grid**: The active set of scenes shown to the user for the current story.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of delete confirmations result in the scene being removed from the active grid within 3 seconds.
- **SC-002**: 100% of canceled confirmations leave the scene unchanged and still visible.
- **SC-003**: 95% of users who confirm deletion do not see the deleted scene in the active grid afterward.
- **SC-004**: Error states display a clear message in 100% of failed deletion attempts.

## Assumptions

- Soft deletion means the scene is hidden from the active grid but retained for potential recovery in a future feature.
- There is no restore or “trash” interface included in this change.
