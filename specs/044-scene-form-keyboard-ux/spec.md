# Feature Specification: Scene Form Keyboard UX Improvements

**Feature Branch**: `044-scene-form-keyboard-ux`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Add keyboard convenience interactions to SceneForm: tab from title to description wysiwyg, enter to submit todo item, tab from snippet title to snippet text wysiwyg"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tab from Title to Description (Priority: P1)

A user editing a scene opens the sidebar, clicks the title field, types or edits the title, and presses Tab. The description rich-text editor immediately receives focus and is ready for the user to start typing — no mouse click required.

**Why this priority**: This is the most common editing flow. Authors naturally move from title to body content, and removing the need to reach for the mouse reduces friction on every scene edit.

**Independent Test**: Open a scene in the sidebar, focus the title input, press Tab. Verify the cursor lands inside the description editor body (not on a toolbar button or other element).

**Acceptance Scenarios**:

1. **Given** the scene title input is focused, **When** the user presses Tab, **Then** focus moves to the description editor's editable content area.
2. **Given** the description editor is focused after tabbing, **When** the user starts typing, **Then** text is entered directly into the description without any additional interaction.
3. **Given** the user is on the description editor, **When** Shift+Tab is pressed, **Then** focus returns to the title input.

---

### User Story 2 - Enter Key Submits Todo Item (Priority: P2)

A user adding a todo item to a scene types text into the "add todo" input field and presses Enter. The item is immediately added to the list — no button click needed.

**Why this priority**: Todo entry is a repetitive action; submitting multiple items in sequence benefits greatly from keyboard-only flow. This is also a widely expected interaction pattern for list inputs.

**Independent Test**: Focus the add-todo text input, type "Write the opening line", press Enter. Verify the item appears in the todo list and the input is cleared and ready for the next entry.

**Acceptance Scenarios**:

1. **Given** the todo input contains text, **When** the user presses Enter, **Then** the item is added to the todo list and the input is cleared.
2. **Given** the todo input is empty, **When** the user presses Enter, **Then** no item is added and no error is shown.
3. **Given** an item has just been submitted via Enter, **When** the list updates, **Then** focus remains on the todo input so the user can immediately add another item.

---

### User Story 3 - Tab from Snippet Title to Snippet Text Editor (Priority: P3)

A user adding a new snippet via the "Add snippet" modal types the snippet title, then presses Tab. Focus moves directly to the snippet text rich-text editor's editable area — skipping any toolbar buttons — so the user can immediately begin writing.

**Why this priority**: The snippet creation flow is a secondary action, but the same tab-to-editor pattern should be consistent across all title → body pairs in the UI.

**Independent Test**: Open the Add Snippet modal, type a title, press Tab. Verify focus lands in the snippet text editor body (not a toolbar button or the Cancel/Add button row).

**Acceptance Scenarios**:

1. **Given** the snippet title input is focused in the Add Snippet modal, **When** the user presses Tab, **Then** focus moves to the snippet text editor's editable content area.
2. **Given** the snippet text editor is focused after tabbing, **When** the user starts typing, **Then** text is entered directly into the editor.
3. **Given** an expanded existing snippet is being edited, **When** the user focuses the inline snippet title input and presses Tab, **Then** focus moves to that snippet's text editor body.

---

### Edge Cases

- What happens if the description or snippet text editor fails to mount before Tab is pressed? Focus should fall through to the next naturally focusable element without throwing an error.
- How does the system handle Tab when the rich-text editor toolbar contains focusable buttons? Focus must skip toolbar controls and land on the editable area.
- What happens if the todo input receives Enter while a mutation is still pending? The item should still be submitted; duplicate submissions are prevented by existing debounce logic, not by blocking the Enter key.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The scene title input MUST move focus to the description editor's editable content area when Tab is pressed.
- **FR-002**: The description editor MUST accept Tab-in focus without the user needing to interact with toolbar buttons.
- **FR-003**: The scene todo-item text input MUST submit the current item when the Enter key is pressed.
- **FR-004**: After an Enter-key submission, the todo input MUST be cleared and retain focus for consecutive entries.
- **FR-005**: Pressing Enter on an empty todo input MUST NOT add an empty item or trigger an error.
- **FR-006**: In the Add Snippet modal, the snippet title input MUST move focus to the snippet text editor's editable content area when Tab is pressed.
- **FR-007**: Tab-in focus on any rich-text editor in this form MUST land on the editable body, bypassing toolbar buttons, so the user can type immediately.
- **FR-008**: The same Tab-to-editor behaviour MUST apply when editing an existing expanded snippet's inline title field.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can fill in a scene title and move to writing the description using only the Tab key, with zero mouse interactions required.
- **SC-002**: A user can add three consecutive todo items using only the keyboard (type, Enter, type, Enter, type, Enter) without any mouse interaction.
- **SC-003**: A user can fill in a snippet title and begin typing snippet content using only the Tab key to transition between fields.
- **SC-004**: No keyboard interaction regression is introduced — existing Tab order for all other fields in the form remains unchanged.
