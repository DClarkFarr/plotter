# Feature Specification: Prevent Plot Deletion When Scenes Exist

**Feature Branch**: `052-prevent-plot-delete-with-scenes`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "As a user, I shouldn't be able to delete a plot that has scenes in it. The delete plot confirmation modal should indicate this and be disabled, and the endpoint, should it be hit, should return an error message to this effect"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Prevent Deleting In-Use Plots (Priority: P1)

As a user managing story structure, I can immediately see that a plot with scenes in it cannot be deleted, so I do not accidentally try a destructive action that would break scene organization.

**Why this priority**: This is the core business rule. It protects story structure and prevents accidental data loss or invalid story state.

**Independent Test**: Can be fully tested by opening delete confirmation for a plot that still contains scenes and verifying the modal explains why deletion is unavailable and prevents confirmation.

**Acceptance Scenarios**:

1. **Given** a plot contains one or more scenes, **When** the user opens the delete confirmation modal, **Then** the modal explains that the plot cannot be deleted while scenes are assigned to it.
2. **Given** a plot contains one or more scenes, **When** the delete confirmation modal is shown, **Then** the destructive confirmation action is disabled and cannot be completed.

---

### User Story 2 - Delete Empty Plots Safely (Priority: P2)

As a user cleaning up unused plots, I can still delete a plot that has no scenes, so the new safeguard does not block legitimate cleanup.

**Why this priority**: The primary safeguard should not prevent normal deletion for plots that are safe to remove.

**Independent Test**: Can be fully tested by opening delete confirmation for a plot with no scenes and confirming deletion successfully.

**Acceptance Scenarios**:

1. **Given** a plot has no scenes, **When** the user opens the delete confirmation modal, **Then** the modal presents a normal confirmation flow with an enabled destructive action.
2. **Given** a plot has no scenes, **When** the user confirms deletion, **Then** the plot is removed and no scene data is affected.

---

### User Story 3 - Enforce the Rule Server-Side (Priority: P1)

As a user, I receive a clear error if a delete request is submitted for a plot that still has scenes, so the business rule is enforced even if the request bypasses the normal user interface.

**Why this priority**: Client-side safeguards alone are insufficient for destructive operations. The rule must be enforced where the deletion decision is finalized.

**Independent Test**: Can be fully tested by sending a delete request for a plot that still contains scenes and verifying that deletion is rejected with a clear user-facing error.

**Acceptance Scenarios**:

1. **Given** a plot contains one or more scenes, **When** a delete request is submitted directly, **Then** the system rejects the request and returns an error explaining that the plot cannot be deleted until its scenes are removed or reassigned.
2. **Given** a plot no longer contains scenes, **When** a delete request is submitted, **Then** the system allows deletion to proceed according to normal rules.

### Edge Cases

- A plot becomes empty after the user first opens the blocked delete modal: reopening or refreshing the confirmation state reflects that deletion is now allowed.
- A plot gains a new scene after the user first sees deletion as available: the final delete attempt is rejected and the user receives the same in-use explanation.
- The plot has many scenes: the modal still communicates the rule clearly without requiring the user to inspect individual scene records.
- The plot has already been deleted in another session: the user receives a clear not-available message rather than a misleading in-use warning.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST determine whether a plot currently has one or more scenes before allowing that plot to be deleted.
- **FR-002**: The system MUST prevent users from confirming deletion of a plot that currently has scenes assigned to it.
- **FR-003**: When deletion is blocked, the delete confirmation modal MUST state that the plot cannot be deleted because it still contains scenes.
- **FR-004**: When deletion is blocked, the delete confirmation modal MUST keep the destructive confirmation control visibly unavailable.
- **FR-005**: The system MUST allow users to dismiss the blocked delete confirmation without making any changes.
- **FR-006**: The system MUST continue to allow deletion of plots that do not contain any scenes.
- **FR-007**: If a delete request is submitted for a plot that contains scenes, the system MUST reject the request.
- **FR-008**: When rejecting a delete request for an in-use plot, the system MUST return an error message that clearly states the plot cannot be deleted until its scenes are removed or reassigned.
- **FR-009**: The server-side delete rule MUST be enforced even when the request does not come from the standard user interface.
- **FR-010**: If the plot's scene usage changes between initial confirmation display and delete submission, the final delete decision MUST use the most current plot state.
- **FR-011**: A blocked delete attempt MUST leave the plot and its scenes unchanged.

### Key Entities _(include if feature involves data)_

- **Plot**: A story organization unit that can group zero or more scenes and may be deleted only when no scenes remain assigned to it.
- **Scene**: A story unit that may be associated with a plot and whose presence determines whether that plot is eligible for deletion.
- **Plot Delete Confirmation State**: The user-facing delete state for a plot, including whether deletion is allowed, why it is blocked, and whether the confirmation action is available.
- **Delete Rejection Message**: The explanatory response shown when a delete request is refused because the plot still has scenes.

## Assumptions

- Plot deletion already exists for plots that are otherwise eligible to be deleted.
- Users can remove or reassign scenes through existing workflows before retrying plot deletion.
- The delete confirmation modal is the standard place where destructive plot deletion is communicated to the user.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of delete attempts for plots that contain scenes are blocked from completion in user acceptance testing.
- **SC-002**: 100% of direct delete requests for plots that contain scenes return a rejection response with a human-readable explanation.
- **SC-003**: At least 90% of test users correctly understand why deletion is unavailable for in-use plots after viewing the confirmation modal once.
- **SC-004**: 100% of delete attempts for plots with no scenes continue to complete successfully under existing deletion rules.
