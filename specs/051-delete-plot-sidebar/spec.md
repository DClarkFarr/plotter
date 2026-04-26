# Feature Specification: Plot Sidebar Edit and Delete

**Feature Branch**: `051-delete-plot-sidebar`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "As a user, I should be able to delete a plot. Convert plot editing from in-place header editing to a sidebar pane, and add a danger zone with a delete confirmation modal similar to scenes."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Edit Plot in Sidebar (Priority: P1)

As a user managing story plots, I can open a dedicated sidebar to edit plot details instead of editing directly in the plot header.

**Why this priority**: This is the core workflow change and resolves the immediate usability problem of cramped in-place editing.

**Independent Test**: Can be fully tested by opening edit mode from a plot header and updating plot fields entirely within the sidebar without relying on in-place header form controls.

**Acceptance Scenarios**:

1. **Given** a plot is visible in the grid, **When** the user chooses to edit that plot, **Then** a sidebar opens with the plot's current values loaded into editable fields.
2. **Given** the sidebar is open with valid changes, **When** the user saves, **Then** the plot is updated and the visible plot header reflects the new values.
3. **Given** the sidebar is open with unsaved changes, **When** the user closes the sidebar, **Then** the system prevents accidental loss by requiring explicit confirmation or explicit discard behavior.

---

### User Story 2 - Delete Plot from Danger Zone (Priority: P1)

As a user managing plots, I can delete a plot from a clearly marked danger zone at the bottom of the plot sidebar using a confirmation modal.

**Why this priority**: Users explicitly requested deletion support and this action has high impact, so it needs a deliberate and safe interaction pattern.

**Independent Test**: Can be fully tested by opening a plot in the sidebar, initiating delete from the danger zone, confirming in the modal, and verifying the plot is removed from active views.

**Acceptance Scenarios**:

1. **Given** the plot edit sidebar is open, **When** the user reaches the danger zone, **Then** a delete action is clearly visible and visually distinguished from non-destructive actions.
2. **Given** the user selects delete, **When** the confirmation modal appears, **Then** the modal explains the action and offers clear confirm and cancel choices.
3. **Given** the user confirms deletion, **When** the operation succeeds, **Then** the plot no longer appears in the current story's active plot list and the sidebar closes.
4. **Given** the user cancels deletion, **When** the modal closes, **Then** no plot data is removed and the user remains in the sidebar.

---

### User Story 3 - Preserve Existing Scene-Like Confirmation Experience (Priority: P2)

As a user familiar with existing deletion flows, I experience a deletion confirmation interaction for plots that is consistent with scenes.

**Why this priority**: Consistency lowers user error and learning cost, but this is secondary to enabling sidebar editing and actual deletion.

**Independent Test**: Can be tested by comparing plot delete confirmation behavior and messaging structure to the established scene delete confirmation pattern.

**Acceptance Scenarios**:

1. **Given** a user has previously deleted scenes, **When** they delete a plot, **Then** the confirmation flow follows the same interaction pattern and level of caution.

### Edge Cases

- User attempts to delete a plot that has already been removed in another session: the system informs the user the plot is no longer available and refreshes the view state.
- User loses connection while saving sidebar edits: the system preserves unsaved sidebar input where possible and shows an actionable failure message.
- User loses connection while confirming deletion: the system does not remove the plot in the UI until deletion is confirmed by the backend.
- User opens edit for one plot, then quickly attempts to edit a different plot: the system prevents mixed data by clearly scoping sidebar contents to one selected plot at a time.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST open plot editing in a dedicated sidebar pane when the user initiates plot edit from the plot header actions.
- **FR-002**: The system MUST populate the sidebar with the selected plot's current editable values.
- **FR-003**: The system MUST allow users to update plot information from the sidebar and persist changes when saved.
- **FR-004**: The system MUST keep non-editing plot header layout stable while sidebar editing is active (no in-place form expansion in the header).
- **FR-005**: The system MUST include a visually distinct danger zone at the bottom of the sidebar for destructive actions.
- **FR-006**: Users MUST be able to initiate plot deletion only through the danger zone delete action.
- **FR-007**: The system MUST require explicit confirmation in a modal before deleting a plot.
- **FR-008**: The delete confirmation modal MUST provide both confirm and cancel actions, with cancel as a non-destructive default.
- **FR-009**: On confirmed deletion success, the system MUST remove the plot from active plot displays for the current story context.
- **FR-010**: On delete cancellation, the system MUST make no data changes and return focus to the sidebar.
- **FR-011**: The delete confirmation experience for plots MUST follow the same interaction pattern used for scene deletion.
- **FR-012**: If save or delete fails, the system MUST show a clear error state and keep the user in control of retrying or exiting.

### Key Entities _(include if feature involves data)_

- **Plot**: A story planning item that contains user-editable metadata and appears in plot views.
- **Plot Sidebar Session**: The active editing context for one selected plot, including current values, unsaved changes, and available actions.
- **Delete Confirmation**: A user decision state that captures intent to proceed with or cancel a destructive plot deletion.

## Assumptions

- Plot deletion follows the project's existing deletion semantics for similar entities (for example, whether deletion is soft or hard is governed by existing project rules).
- Only users with existing permissions to edit plots can access sidebar editing and deletion actions.
- The sidebar supports the same set of plot fields that are currently editable through the in-place edit flow.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users can locate and open plot editing in 10 seconds or less from a plot header action.
- **SC-002**: 95% of successful plot edit updates are completed in under 60 seconds from opening the sidebar.
- **SC-003**: 100% of plot deletions require an explicit confirmation action before data is removed.
- **SC-004**: At least 90% of users in usability testing report that plot editing feels clearer and less cramped than the previous in-place workflow.
- **SC-005**: Post-release support requests related to accidental plot deletion remain at or below the baseline rate observed for scene deletion flows.
