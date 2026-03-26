# Feature Specification: Plot Header Grid Enhancements

**Feature Branch**: `008-plot-header-grid`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Let's create the grid plot header and functionality. UI and the component PlotHeaderCreate has already been stubbed out for rows where no plot has yet been created. The grid will always render at least 1 column to the right, further than has been created. And will always render a few cells farther than have been created, so the user only needs to type in something and click create. However, there are changes and additional functionality to the Plot header components, that are missing: - the create button should be hidden, and should fade in when the text of the input changes. (I.e, on dirty state) - scenes need an additional prop to trigger a disabled state for rows that don't have a plot object. (If the scene create card already has the plot object, it can just see if it's 'undefined'). Create scene cards should have an obvious disabled state, such that it should not be possible to create a scene in a row where the header has not been created first. Next, we need to add a PlotHeader component for rows where the plot has been created. Similar to the heading component, this component will display View only mode by default. There will be a p-6 of padding on it. On hover, a toolbar will fade in, in the top/right corner, with such actions as move right/left (when the component isn't the right-most or left-most column, respectively). It will also have an edit button. Editing will switch the component into form mode. It will have a text input for the title, a textarea for the description and a color picker (will need to find an install one) for the color. As well as a cancel button and save button at the bottom. Cancel should revert the changes and switch back to view mode. Optimistic updates: Creating and updating plot objects should optimistically udpate the query cache. We also need to create the endpoints for creating/editing plots, if they don't exist. Otherwise, we need to use them."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a plot header (Priority: P1)

Writers can add a new plot column from the grid header without navigating away, so they can start writing scenes immediately.

**Why this priority**: Creating plot columns unlocks the rest of the grid, including scene creation.

**Independent Test**: Can be fully tested by creating one plot header in an empty column and confirming the column becomes active for scenes.

**Acceptance Scenarios**:

1. **Given** the grid shows at least one empty plot column, **When** the user types a plot title, **Then** the create action becomes visible and actionable.
2. **Given** the user submits a new plot header, **When** the request is in progress, **Then** the new plot header appears immediately and scenes in that column become enabled.
3. **Given** the create request fails, **When** the failure is returned, **Then** the optimistic header is removed and the user sees a clear failure state.

---

### User Story 2 - Edit and move existing plot headers (Priority: P2)

Writers can update plot header details and reorder plots to match the story flow without leaving the grid.

**Why this priority**: Editing and reordering are essential for maintaining plot structure as the story evolves.

**Independent Test**: Can be tested by editing a plot title/description/color and moving a plot column left or right.

**Acceptance Scenarios**:

1. **Given** a plot header in view mode, **When** the user hovers over it, **Then** the toolbar appears with available actions.
2. **Given** the user enters edit mode, **When** they change values and choose cancel, **Then** the header returns to view mode with original values restored.
3. **Given** the user saves edits, **When** the save succeeds, **Then** the header shows the updated values without a full refresh.
4. **Given** a plot column is not at the far left or right, **When** the user selects move left/right, **Then** the column order updates immediately and persists.

---

### User Story 3 - Prevent scene creation before plots exist (Priority: P3)

Writers cannot create scenes in columns that do not yet have a plot header, preventing orphaned content.

**Why this priority**: It preserves data integrity and avoids confusion for users.

**Independent Test**: Can be tested by attempting to create a scene in a column without a plot header.

**Acceptance Scenarios**:

1. **Given** a grid column with no plot header, **When** the user views the scene creation card, **Then** it is visually disabled and cannot be used.
2. **Given** a plot header is created in that column, **When** the grid re-renders, **Then** the scene creation card becomes enabled.

---

### Edge Cases

- A user attempts to create a scene in a plotless column via keyboard or other direct interactions.
- A save fails after an optimistic update (create, edit, or move) and must roll back cleanly.
- The user attempts to move the left-most or right-most plot column.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The grid MUST always render at least one extra plot column beyond existing plots and multiple extra rows beyond existing scenes.
- **FR-002**: The plot creation action MUST be hidden until the user changes the input, and it MUST fade in when the input becomes dirty.
- **FR-003**: The system MUST allow users to create a new plot header from an empty column using a title input.
- **FR-004**: The system MUST show a disabled, non-interactive scene creation state for columns without a plot header.
- **FR-005**: When a plot header exists, the header MUST display a view-only mode with padding around the content.
- **FR-006**: The plot header toolbar MUST appear on hover in the top-right corner and include move left/right actions only when applicable and an edit action.
- **FR-007**: Edit mode MUST provide inputs for title, description, and color, plus cancel and save actions.
- **FR-008**: Cancel MUST revert unsaved edits and return the header to view mode.
- **FR-009**: Save MUST persist changes and immediately reflect updates in the grid without a full refresh.
- **FR-010**: Move left/right MUST reorder plot columns and keep each plot’s scenes attached to the moved plot.
- **FR-011**: Create and update actions MUST provide immediate UI feedback while the change is being saved and roll back on failure with an error state.
- **FR-012**: The system MUST expose or reuse plot create and plot update operations required for this feature.

### Acceptance Coverage

- **FR-001**: Covered by User Story 1, Scenario 1 (empty columns present and actionable).
- **FR-002**: Covered by User Story 1, Scenario 1 (create action appears on dirty input).
- **FR-003**: Covered by User Story 1, Scenarios 1-2 (create from empty column and becomes active).
- **FR-004**: Covered by User Story 3, Scenario 1 (disabled state) and Scenario 2 (enables after header created).
- **FR-005**: Covered by User Story 2, Scenario 1 (view mode presentation).
- **FR-006**: Covered by User Story 2, Scenario 1 (toolbar appears with applicable actions).
- **FR-007**: Covered by User Story 2, Scenario 2 (edit mode inputs and actions).
- **FR-008**: Covered by User Story 2, Scenario 2 (cancel reverts values).
- **FR-009**: Covered by User Story 2, Scenario 3 (save reflects updates).
- **FR-010**: Covered by User Story 2, Scenario 4 (move updates order).
- **FR-011**: Covered by User Story 1, Scenario 3 and Edge Cases (rollback on failure).
- **FR-012**: Covered by User Story 1, Scenario 2 and User Story 2, Scenario 3 (create/update operations succeed).

### Key Entities _(include if feature involves data)_

- **Plot**: Represents a plot column with title, description, color, and position within a story.
- **Scene**: Represents a scene tied to a plot column and row position in the grid.
- **Plot Header State**: Represents view/edit mode state and pending changes for a plot header.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a new plot header in under 30 seconds from the grid without leaving the page.
- **SC-002**: 95% of plot create and edit actions show immediate visual updates within 1 second.
- **SC-003**: 100% of attempts to create a scene in a plotless column are blocked with a visible disabled state.
- **SC-004**: At least 90% of users can successfully edit a plot header on the first attempt without help.

## Assumptions

- Only users with existing story edit access can create, edit, or move plot headers.
- Plot title is required; description and color are optional with sensible defaults when not provided.
- Moving a plot column reorders plots within the story and retains the plot’s scenes.

## Out of Scope

- Deleting plot headers.
- Bulk editing of multiple plot headers.
