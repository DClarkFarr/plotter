# Feature Specification: List View

**Feature Branch**: `022-list-view`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Let's create and integrate the 'list view' for the story page. When users click 'list view' in portal view options, render a written-format list with title, avatar, badges, description, and optional todos."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Switch to list view (Priority: P1)

As a writer, I can switch the story page from the plot grid to a list view so I can read scenes in a written format.

**Why this priority**: The list view is the main new capability and must be accessible from the existing view options.

**Independent Test**: Can be fully tested by selecting "list view" and confirming the plot grid is replaced by the list format for a story with multiple scenes.

**Acceptance Scenarios**:

1. **Given** a story page with scenes and the view options menu, **When** I select "list view", **Then** the list view renders instead of the plot grid.
2. **Given** a story page already in list view, **When** I navigate within the story, **Then** the list view remains active for that page visit.

---

### User Story 2 - Read a scene in written format (Priority: P2)

As a writer, I can read each scene with its title, badges, description, and optional todos so I can review the narrative flow.

**Why this priority**: The written layout is the primary user value once list view is selected.

**Independent Test**: Can be tested by comparing a known scene's title, badges, and description to the list view output.

**Acceptance Scenarios**:

1. **Given** a scene with title, character, badges, and description, **When** I view it in list view, **Then** the title is the primary heading, badges appear directly below it, the description renders as rich text, and an edit control is available next to the title.
2. **Given** a scene without badges or description, **When** I view it in list view, **Then** the layout omits those sections without breaking the scene formatting.

---

### User Story 3 - Review scene tasks (Priority: P3)

As a writer, I can see any todo list at the end of a scene so I can track what remains to be done.

**Why this priority**: Todos are a supporting detail, useful but not required for the list view to provide value.

**Independent Test**: Can be tested with a scene that has a mix of completed and incomplete todo items.

**Acceptance Scenarios**:

1. **Given** a scene with todo items, **When** I view it in list view, **Then** the todo list appears after the description with incomplete items first and completed items last with strike-through styling.

---

### User Story 4 - Scan scenes in grid order (Priority: P3)

As a writer, I can read scenes in the same left-to-right order as the plot grid when multiple scenes share a vertical index.

**Why this priority**: Consistent ordering prevents confusion when comparing the list view to the plot grid.

**Independent Test**: Can be tested with multiple plots that share a vertical index and verifying the list order matches the grid's horizontal ordering.

**Acceptance Scenarios**:

1. **Given** two scenes at the same vertical index but on different plots, **When** I view them in list view, **Then** the scenes are ordered by the plot horizontal index from left to right.

---

### Edge Cases

- What happens when a story has zero scenes?
- How does the system handle a scene with a missing character avatar?
- How does the system handle very long titles or descriptions?
- What happens when all todo items are completed?
- What happens when a scene has no matching plot for its ordering metadata?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to select "list view" from the story page view options.
- **FR-002**: Selecting "list view" MUST replace the plot grid with the list view for the current story page.
- **FR-003**: The list view MUST display scenes ordered by `verticalIndex` ascending, then plot `horizontalIndex` ascending.
- **FR-004**: Scenes that share the same vertical index MUST be ordered by their plot horizontal index from left to right.
- **FR-005**: The list view MUST render scenes sequentially without placeholders for missing vertical indices.
- **FR-006**: Each scene MUST display its title as the primary heading.
- **FR-007**: Each scene MUST display an edit control adjacent to the title.
- **FR-008**: Each scene MUST display the character avatar above the title and aligned to the right when an avatar exists.
- **FR-009**: Each scene MUST display badges directly below the title using the same visual treatment as badges in scene cards.
- **FR-010**: Each scene MUST display the description as rich text in the list view.
- **FR-011**: If a scene has a todo list, it MUST appear after the description.
- **FR-012**: Todo items MUST be ordered with incomplete items first and completed items last, with completed items visually struck through.
- **FR-013**: Each list view scene MUST support a display mode for "normal" and "filterExcluded".
- **FR-014**: The list view MUST handle missing optional data (avatar, badges, description, todo list) without breaking layout.
- **FR-015**: When a story has no scenes, the list view MUST show an empty state that explains there are no scenes to display.

### Key Entities _(include if feature involves data)_

- **Story**: The parent collection of scenes shown on the story page.
- **Scene**: A narrative unit with title, description, optional badges, and optional todo items.
- **Character**: The person associated with a scene, including an optional avatar image.
- **Badge**: A label associated with a scene, displayed under the title.
- **Todo Item**: A task tied to a scene, with completion state.
- **Plot**: The horizontal grouping that determines left-to-right ordering for scenes at the same vertical index.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can switch from plot grid to list view in 2 or fewer interactions.
- **SC-002**: For a story with up to 100 scenes, the list view renders within 2 seconds on a typical workstation.
- **SC-003**: 100% of scenes in list view display the title, and any available avatar, badges, description, and todo list in the specified order.
- **SC-004**: In usability review, at least 90% of users report the list view as easier to read than the plot grid for narrative review.

## Assumptions

- The list view selection applies to the current story page session and does not need to persist across sessions unless already supported elsewhere.
- Existing badge styling from scene cards can be reused in the list view.

## Out of Scope

- Changing how scenes are edited or created.
- Modifying the underlying data model for scenes, badges, or todos.
