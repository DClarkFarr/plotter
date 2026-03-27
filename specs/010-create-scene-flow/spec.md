# Feature Specification: Create Scene Editor Flow

**Feature Branch**: `010-create-scene-flow`  
**Created**: March 27, 2026  
**Status**: Draft  
**Input**: User description: "I want to implement \"create scene\" functionality: When a user clicks the \"create scene\" button in `EmptyCard`, I want to create a scene with a default title of \"Scene [row number] in [plotname]\". Then I want to select that scene and open the dashboard sidebar with the newly-created scene active and ready for editing. I want the form to be \"edit in place\" meaning that the form looks like the display mode, and the inputs are transparent. In other words, the title input should look like the side/weight/font of the heading. There shouldn't be border or obvious input around it. Perhaps a very slight, mostly transparent background that changes on hover + focus. For the description, let's install and use a rich text editor. For the tags, let's display selected tags in an inline list of badges with a small gap. Clicking on any of them will open a modal that shows the selected tags at the top, has a list of all tags, with checkboxes by each. Checking/unchecking each box saves the selected tags and updates the state. Closing the modal does not perform a state change. Let's also implement the \"Todo list\". The list should be vertital items with a checkbox. Checking the box should give them a crossed-out/grayed-out state. Unhecking them should restore the state. These items should be sortable using dnd-kit. For the endpoints, let's add a `sceneRouter` similar to the patterns used in `storyRouter`. Let's also add any needed methods to the `scenes` model or the `sceneService`, following current patterns."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create Scene and Open Editor (Priority: P1)

As a user working in the plot grid, I want to create a scene from an empty slot and immediately edit it in the sidebar so I can continue writing without extra steps.

**Why this priority**: Creating a scene and editing it is the core workflow this feature enables.

**Independent Test**: Can be fully tested by clicking an empty slot and verifying the new scene is created, selected, and editable in the sidebar.

**Acceptance Scenarios**:

1. **Given** an empty slot in a plot row, **When** I click create scene, **Then** a new scene is created with the default title "Scene {row number} in {plot name}" and the sidebar opens with that scene selected.
2. **Given** the create scene control is disabled, **When** I attempt to click it, **Then** no scene is created and the current selection does not change.
3. **Given** a plot with a known name and row index, **When** I create a scene, **Then** the title uses that plot name and the human-readable row number.

---

### User Story 2 - Edit Scene In Place (Priority: P2)

As a user editing a scene, I want the fields to look like the display view so I can edit without a jarring visual switch.

**Why this priority**: In-place editing preserves focus and reduces cognitive load while writing.

**Independent Test**: Can be fully tested by opening the sidebar and editing the title and description with minimal visual change.

**Acceptance Scenarios**:

1. **Given** the sidebar editor is open, **When** I focus the title field, **Then** it visually matches the heading style with no visible border and only a subtle hover or focus background.
2. **Given** the description field, **When** I add formatted text (bold, italics, lists, links), **Then** the formatting is retained in display and edit modes.

---

### User Story 3 - Manage Tags via Modal (Priority: P2)

As a user assigning tags to a scene, I want to see selected tags inline and manage them in a dedicated modal so selection is clear and fast.

**Why this priority**: Tags are a primary organization tool and should be quick to adjust.

**Independent Test**: Can be fully tested by toggling tags in the modal and confirming the inline list updates.

**Acceptance Scenarios**:

1. **Given** a scene with selected tags, **When** I click a tag badge, **Then** a modal opens showing selected tags at the top and all available tags with checkboxes.
2. **Given** the modal is open, **When** I check or uncheck a tag, **Then** the selection updates immediately and the inline badge list reflects the change.
3. **Given** the modal is open, **When** I close it without toggling anything, **Then** no tag state changes occur.

---

### User Story 4 - Manage Todo List (Priority: P3)

As a user tracking tasks in a scene, I want a checklist I can reorder so I can organize work visually.

**Why this priority**: Todo management supports detailed planning but is secondary to creating and editing scenes.

**Independent Test**: Can be fully tested by adding todo items, toggling checkboxes, and reordering them.

**Acceptance Scenarios**:

1. **Given** a todo list, **When** I check an item, **Then** it appears crossed out and muted; when I uncheck it, the normal style returns.
2. **Given** multiple todo items, **When** I drag an item to a new position, **Then** the list order updates and persists.

### Edge Cases

- Plot name is missing or empty when generating the default title.
- A row already contains a scene and the user attempts to create another in the same slot.
- The create scene control is disabled due to permissions or loading.
- Tag list is empty for the story.
- Todo list contains only completed items.
- Reordering is attempted while a save is in progress.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to create a new scene from an empty slot in a plot row.
- **FR-002**: System MUST generate a default scene title in the format "Scene {row number} in {plot name}" at creation time.
- **FR-003**: System MUST select the newly created scene and open the sidebar editor immediately after creation.
- **FR-004**: System MUST present the title field as an in-place editable heading with no visible border and only subtle hover or focus styling.
- **FR-005**: System MUST provide rich text editing for the scene description with common formatting options (bold, italics, lists, links).
- **FR-006**: System MUST display selected tags as an inline list of badges with small spacing.
- **FR-007**: System MUST open a tag selection modal when a tag badge is clicked, showing selected tags at the top and all available tags with checkboxes.
- **FR-008**: System MUST apply tag selection changes immediately when a checkbox is toggled.
- **FR-009**: System MUST leave tag selections unchanged when the modal is closed without toggling any tag.
- **FR-010**: System MUST display todo items as a vertical checklist with checkbox state reflected by crossed-out, muted styling.
- **FR-011**: System MUST allow users to reorder todo items via drag and drop and persist the updated order.
- **FR-012**: System MUST persist scene edits to title, description, tags, todos, and ordering changes.

### Key Entities _(include if feature involves data)_

- **Scene**: A story unit within a plot row, including title, description, tags, todo list, and ordering.
- **Plot**: The parent grouping that provides the plot name and row context for default titles.
- **Tag**: A label available to scenes within the story.
- **Todo Item**: A checklist entry with text, completion state, and order.
- **Sidebar Editor State**: The selected scene and the editor visibility state.

### Assumptions

- Each empty slot maps to a specific plot and row index, and row numbering is 1-based for display.
- If a plot name is missing, the default title uses "Untitled Plot".
- Users creating scenes already have access permissions to edit the story and plot.
- The tag catalog for a story already exists and can be listed for selection.
- The sidebar editor is available and can be opened programmatically.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of create scene actions result in a new scene and open editor within 2 seconds.
- **SC-002**: In usability testing, 90% of users can create a scene and start editing without guidance.
- **SC-003**: 95% of tag selection changes appear in the inline badge list within 1 second and persist after reopening the editor.
- **SC-004**: 95% of todo reorders persist after refresh or reloading the scene.
