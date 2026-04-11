# Feature Specification: Section Sidebar Editing

**Feature Branch**: `034-section-sidebar-edit`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "I want to add sidebar editing functionality for sections, similar to how we edit scenes. Clicking the hover edit button in SectionRow.tsx should open the sidebar in section editing mode. The user should be able to edit the title, delete the section, and edit the wysiwyg section description."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Open Section Editor from Plot Grid (Priority: P1)

A writer is viewing the plot grid and wants to edit a section (act or chapter divider). They hover over a section row and click the edit button. The sidebar opens and displays the section editing panel, pre-populated with the section's current title and description.

**Why this priority**: This is the core interaction that unlocks all editing capabilities. Without the sidebar opening correctly for sections, no other editing is possible.

**Independent Test**: Can be fully tested by hovering over any section row, clicking the edit icon, and verifying the sidebar opens showing the selected section's data. Delivers the foundational user experience of entering section edit mode.

**Acceptance Scenarios**:

1. **Given** the user is on the story plot grid, **When** they hover over a section row, **Then** an edit button becomes visible.
2. **Given** the edit button is visible, **When** the user clicks it, **Then** the sidebar opens in section editing mode showing that section's title and description.
3. **Given** the sidebar is already open showing a scene, **When** the user clicks the edit button on a section row, **Then** the sidebar switches to section editing mode for the selected section.
4. **Given** the sidebar is open for one section, **When** the user clicks the edit button on a different section row, **Then** the sidebar updates to show the newly selected section.

---

### User Story 2 - Edit Section Title (Priority: P1)

With the section editor open, the writer wants to rename the section. They update the title in the editor and the change is saved to the story.

**Why this priority**: Title editing is the most fundamental data change a user can make to a section and delivers standalone value even without description editing.

**Independent Test**: Can be fully tested by opening the section editor, changing the title field, and confirming the section row in the plot grid reflects the updated name after saving.

**Acceptance Scenarios**:

1. **Given** the section editor is open, **When** the user changes the title field, **Then** the change is persisted and the section row in the grid displays the updated title.
2. **Given** the user has edited the title, **When** they close the sidebar, **Then** the updated title is still visible in the plot grid.
3. **Given** an empty title is entered, **When** the user attempts to save, **Then** saving is prevented and the user is informed the title is required.

---

### User Story 3 - Edit Section Description (Priority: P2)

With the section editor open, the writer wants to add or update a rich-text description for the section — notes, synopsis, or structural commentary. They use the WYSIWYG editor within the sidebar to compose the description, and it is saved.

**Why this priority**: Description editing adds narrative context to structural elements, but is secondary to the title which is always visible in the grid.

**Independent Test**: Can be fully tested independently by opening the section editor, typing rich-text content in the description area, saving, re-opening the editor, and verifying the content persisted.

**Acceptance Scenarios**:

1. **Given** the section editor is open, **When** the user types or formats content in the description editor, **Then** the content is persisted to the section.
2. **Given** a section has an existing description, **When** the section editor is opened, **Then** the description is pre-loaded in the WYSIWYG editor.
3. **Given** the user clears the description entirely, **When** saved, **Then** the section is saved with no description (null/empty is acceptable).

---

### User Story 4 - Delete a Section (Priority: P2)

With the section editor open, the writer wants to remove a section from the story. They click a delete action within the sidebar, confirm the deletion, and the section is removed from the plot grid.

**Why this priority**: Deletion completes the full CRUD lifecycle for sections and is a natural companion to the editing panel, but is lower priority as users can manage without it temporarily.

**Independent Test**: Can be fully tested by opening the section editor for any section, triggering the delete action, confirming, and verifying the section row no longer appears in the grid and the sidebar closes.

**Acceptance Scenarios**:

1. **Given** the section editor is open, **When** the user triggers the delete action, **Then** a confirmation prompt is shown before any data is deleted.
2. **Given** the delete confirmation is shown, **When** the user confirms, **Then** the section is deleted, the sidebar closes, and the section row is removed from the plot grid.
3. **Given** the delete confirmation is shown, **When** the user cancels, **Then** no data is deleted and the section editor remains open.
4. **Given** a section is deleted that had scenes positioned beneath it, **When** the deletion completes, **Then** the plot grid remains consistent (no orphaned or broken rows).

---

### Edge Cases

- What happens when the user opens the section editor and then navigates away from the story page?
- How does the sidebar behave if the section is deleted by another action while the editor is still open?
- What happens if the section title update fails due to a server error — is the in-progress edit preserved in the form?
- How does saving behave when the user edits both title and description in quick succession?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The section row hover buttons MUST include an edit button that, when clicked, opens the sidebar in section editing mode for that section.
- **FR-002**: The sidebar section editing panel MUST display a field for editing the section title, pre-populated with the current title.
- **FR-003**: The sidebar section editing panel MUST include a WYSIWYG rich-text editor for the section description, pre-populated with the current description if one exists.
- **FR-004**: Changes to the section title MUST be persisted; the plot grid MUST reflect the updated title without a full page reload.
- **FR-005**: Changes to the section description MUST be persisted; the content MUST survive closing and re-opening the section editor.
- **FR-006**: The section editing panel MUST include a delete action that requires user confirmation before permanently removing the section.
- **FR-007**: Upon successful deletion, the sidebar MUST close and the section row MUST be removed from the plot grid.
- **FR-008**: The section editing panel MUST be reachable by clicking the edit button on any section row, regardless of section type ("act" or "section").
- **FR-009**: The sidebar MUST be able to switch between section editing mode and other sidebar modes (scene, character, tag) without data corruption.
- **FR-010**: The title field MUST NOT allow saving an empty value; appropriate user feedback MUST be shown when validation fails.
- **FR-011**: The section data model MUST support an optional rich-text description field; sections without a description MUST continue to function normally.

### Key Entities

- **Section**: A structural divider in the story's plot grid (type: "act" or "section"). Has a title, vertical position, and — after this feature — an optional rich-text description.
- **Section Editor Panel**: The sidebar content rendered when a section is selected for editing. Mirrors the role of the Scene Form for scenes.
- **Sidebar**: The slide-in panel on the right side of the dashboard that renders different content panels based on the active view mode.

## Assumptions

- The backend API for sections already supports updating and deleting a section; a `description` field will be added to the section data model as part of this feature.
- Auto-save (debounced) is the preferred save strategy for title and description, consistent with how the scene form works.
- No additional permission checks are required beyond being authenticated on the correct story — section editing follows the same access model as scene editing.
- Both "act" and "section" types use identical editing fields (title + description); no type-specific fields are needed at this time.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A writer can open the section editor sidebar, update the section title, and see the updated title reflected in the plot grid in under 3 seconds.
- **SC-002**: A writer can add or edit a rich-text section description and confirm it persists after closing and re-opening the section editor.
- **SC-003**: A writer can delete a section via the sidebar in no more than 2 steps (trigger + confirm) and the plot grid updates without a full page reload.
- **SC-004**: The section sidebar editing experience is consistent with the scene editing experience — a writer familiar with scene editing requires no additional instruction to use section editing.
- **SC-005**: No data loss occurs when the user opens the section editor on multiple sections in sequence; each editor session shows data for the correct section.
