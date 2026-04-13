# Feature Specification: Soft Delete Story

**Feature Branch**: `038-soft-delete-story`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "I need to be able to delete stories. For now let's add a soft deletedAt date time and then never query deleted stories by default, similar to how to do with scenes. When the user clicks on a story and visits the story page, when the story is in edit mode, there should be a delete button with confirm modal (in the StoryHeading component). Should follow the same 'danger zone' delete UI with confirmation modal that is used for deleting scenes."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Delete a Story via Story Page (Priority: P1)

A user navigating to a story page can, while in edit mode on the story heading, delete the story using a clearly labelled danger-zone section with a confirmation modal. The story is immediately removed from the active dashboard list and the user is redirected away.

**Why this priority**: Core requested behaviour; all other stories depend on the delete mechanism existing.

**Independent Test**: Open any story, enter edit mode on the story heading, click "Delete Story", confirm in the modal — the story disappears from the dashboard and the user is redirected to the dashboard.

**Acceptance Scenarios**:

1. **Given** a story exists and the user is on its story page in edit mode, **When** the user clicks the "Delete Story" button in the Danger Zone section, **Then** a confirmation modal appears describing the action and its permanence.
2. **Given** the confirmation modal is open, **When** the user clicks "Cancel", **Then** the modal closes and the story is unchanged.
3. **Given** the confirmation modal is open, **When** the user clicks "Yes, delete story", **Then** the story is soft-deleted (a `deletedAt` timestamp is recorded), the modal closes, and the user is redirected to the dashboard.
4. **Given** a story has been soft-deleted, **When** the dashboard stories list is loaded, **Then** the deleted story does not appear.

---

### User Story 2 - Deleted Stories Are Excluded from All Queries (Priority: P2)

Soft-deleted stories are invisible throughout the application. No story-level query returns a deleted story unless explicitly requested.

**Why this priority**: Data integrity and correctness; without this, deleted stories would still surface in the UI.

**Independent Test**: Delete a story, then reload the dashboard and any related lists — the story must not appear anywhere.

**Acceptance Scenarios**:

1. **Given** a story has a `deletedAt` timestamp set, **When** any standard stories query executes, **Then** that story is excluded from the results.
2. **Given** a story has no `deletedAt` timestamp, **When** any standard stories query executes, **Then** that story is included normally.

---

### Edge Cases

- What happens when the delete request fails due to a network or server error? The modal should remain open and display an error message; the story must remain intact.
- What happens if the user manually navigates to a deleted story's URL? The application should handle the missing story gracefully (e.g., redirect to dashboard or show a not-found state).
- Can a story be deleted while the save (update) mutation is in flight? The delete button should be disabled while any story mutation is pending to prevent conflicting operations.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `Story` data record MUST support a nullable `deletedAt` date-time field that is `null` by default for all new and existing stories.
- **FR-002**: When a story is deleted, the system MUST record the current date-time in the `deletedAt` field rather than removing the record from storage.
- **FR-003**: All standard story queries MUST exclude records where `deletedAt` is not `null`, consistent with how scenes handle soft deletion.
- **FR-004**: The story page MUST display a "Danger Zone" section inside the `StoryHeading` component when in edit mode, matching the visual style used for scene deletion (rose-bordered panel, uppercase "Danger Zone" label, red delete button).
- **FR-005**: The delete action MUST require explicit user confirmation via a modal before deletion is applied, matching the confirmation modal pattern used for scene deletion.
- **FR-006**: After successful deletion, the user MUST be redirected to the dashboard.
- **FR-007**: The delete button and confirm button MUST be disabled while a delete request is in progress to prevent duplicate submissions.
- **FR-008**: If the delete request fails, the system MUST display an error message and leave the story unchanged.

### Key Entities

- **Story**: Represents a writing project. Gains a `deletedAt` nullable date-time field. When set, the story is considered deleted and excluded from all default queries.

## Assumptions

- Soft-deleted stories are not recoverable through the UI in this iteration; restoration is out of scope.
- No cascading soft-delete of child records (scenes, plots, sections) is required at this stage; hiding the story is sufficient.
- The existing `deletedAt` pattern from scenes (query filter `deletedAt: null`) is the authoritative model to follow for consistency.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can delete a story in two interactions or fewer after entering story edit mode (click Delete, click Confirm).
- **SC-002**: Deleted stories never appear in the story dashboard list after deletion.
- **SC-003**: The delete flow follows the identical visual and interaction pattern as scene deletion, requiring no new design patterns.
- **SC-004**: All existing story queries continue to return correct results for non-deleted stories with no regressions.
