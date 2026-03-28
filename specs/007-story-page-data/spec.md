# Feature Specification: Story Page Data Hookup

**Feature Branch**: `007-story-page-data`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: User description: "Build the story page basic structure and hook up the endpoints, queries, and state. Fetch the story object, story tag objects, and plot objects (with scenes). Use the story id from the URL. Show a loader/skeleton while loading. Replace the hard-coded title with the real title. Make the title its own component with view/edit mode, editable title and description, and cancel/save actions that update state and refresh data."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Story Details (Priority: P1)

A user opens a story page and sees the story title, description, tags, and plots once loading finishes.

**Why this priority**: This is the core page purpose; without it, the story page has no value.

**Independent Test**: Can be fully tested by loading a story page with a known id and verifying the rendered data matches the story record.

**Acceptance Scenarios**:

1. **Given** a valid story id in the page URL, **When** the story page loads, **Then** a loading indicator appears until all required data is fetched.
2. **Given** data is fetched successfully, **When** the loading state ends, **Then** the story title, description, tags, and plots (including their scenes) are displayed.

---

### User Story 2 - Edit Story Heading (Priority: P2)

A user toggles the story heading into edit mode, changes the title and description, and saves the updates.

**Why this priority**: Story metadata changes are a common task and should be fast and reliable.

**Independent Test**: Can be fully tested by editing the title and description on a single story and verifying the UI updates immediately and shows the new values after save.

**Acceptance Scenarios**:

1. **Given** the story heading is in view mode, **When** the user clicks the edit icon, **Then** the heading switches to edit mode with editable title and description inputs.
2. **Given** the heading is in edit mode, **When** the user saves, **Then** the UI updates immediately to the new values and returns to view mode.
3. **Given** the heading is in edit mode, **When** the user clicks cancel, **Then** the heading returns to view mode with the original values intact.

---

### User Story 3 - Handle Loading and Missing Data (Priority: P3)

A user can still navigate the story page safely when data is missing, delayed, or fails to load.

**Why this priority**: Defensive behavior prevents broken UI states and support issues.

**Independent Test**: Can be tested by simulating slow responses and partial failures and observing consistent loading and error messaging.

**Acceptance Scenarios**:

1. **Given** a slow data response, **When** the page loads, **Then** a skeleton or loader remains visible until data is complete.
2. **Given** one or more data requests fail, **When** loading ends, **Then** the page shows a clear error state and does not display stale or misleading data.

### Edge Cases

- What happens when the story id in the URL does not match any story?
- How does the page behave if tags or plots are empty while the story exists?
- What happens if the user saves an empty title or description?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST derive the story id from the page URL parameter.
- **FR-002**: The system MUST fetch the story data for the given story id.
- **FR-003**: The system MUST fetch the story tags for the given story id.
- **FR-004**: The system MUST fetch the plots for the given story id, with each plot including its scenes.
- **FR-005**: The system MUST show a loader or skeleton state until all required data is ready for display.
- **FR-006**: The story title display MUST use the fetched story title rather than a hard-coded value.
- **FR-007**: The story heading MUST be its own component with view and edit modes.
- **FR-008**: Clicking the edit icon MUST switch the story heading component into edit mode.
- **FR-009**: Edit mode MUST allow updating both title and description.
- **FR-010**: Clicking cancel MUST exit edit mode and restore the original values without saving.
- **FR-011**: Clicking save MUST update the in-page state immediately, trigger a refresh of story data, and return to view mode.
- **FR-012**: If any required data fetch fails, the page MUST display a clear error state and avoid showing stale values.

### Data Access Organization

- Queries and mutations are organized by model so data access is discoverable and consistent.
- Query keys are defined through shared helper methods to keep caching and invalidation aligned.
- This structure reduces ambiguity as the data surface grows and avoids inconsistent cache identifiers.

### Key Entities _(include if feature involves data)_

- **Story**: Represents the story metadata, including title and description.
- **Tag**: Represents a label associated with a story.
- **Plot**: Represents a plot item associated with a story.
- **Scene**: Represents a scene contained within a plot.

### Assumptions

- The story page has access to a valid story id via the URL when the user navigates to it.
- Story, tags, and plots (with scenes) can be retrieved independently and are all required to render the page.
- Editing the story heading is permitted for the current user when the edit icon is shown.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of story page loads display the full story, tags, and plots within 2 seconds under normal network conditions.
- **SC-002**: Users can update the story title and description in under 1 minute from entering edit mode to seeing the updated view mode.
- **SC-003**: At least 90% of users who open the story page can view story details without encountering an error state.
- **SC-004**: In usability testing, at least 80% of users can locate and use the edit icon without assistance.
