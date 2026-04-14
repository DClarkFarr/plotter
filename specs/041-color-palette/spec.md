# Feature Specification: Color Palette System

**Feature Branch**: `041-color-palette`  
**Created**: April 13, 2026  
**Status**: Draft  
**Input**: User description: "let's add a color palette. 1) Have a default list of ten colors 2) In the story > portal > assets, add a color palette option that opens the sidebar in color edit mode 3) The color pane in the sidebar is a sortable list of colors with a handle icon on the left, the clickable color circle / color input, and a text input with the hex color. Changing the color in the color picker or the text input, and an ignore checkbox on the far right. 4) the user cannot add more colors or remove them, but the user can check the ignore box. 5) Create a new color palette dropdown that shows all the colors, in order, but also contains a color picker. On select a color, the dropdown closes. 6) replace anywhere that currently has an input of type color with the color palette, including: 6.1: tag panel > color 6.2: Plot header > color 6.3: Import modal > plot item color picker"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Manage Story Color Palette (Priority: P1)

A user opens a story, navigates to the portal's Assets section, and clicks "Color Palette." The sidebar opens in palette-edit mode displaying the story's ten colors as a sortable list. For each color the user sees a drag handle, a clickable color circle that opens a native color picker, a hex text input, and an ignore checkbox. The user can reorder colors by dragging, change any color via the picker or by typing a hex value, or mark a color as ignored. The user cannot add new colors or delete existing ones. Changes are saved as they are made.

**Why this priority**: This story establishes the palette data model and the management UI that all other stories depend on.

**Independent Test**: Open a story, click Color Palette in Assets, verify ten colors appear in a sortable list. Drag to reorder, change a color via the picker, type a hex value, check the ignore box — then close and reopen to confirm persistence.

**Acceptance Scenarios**:

1. **Given** a story with no previously saved palette, **When** the user opens the Color Palette panel, **Then** ten default colors are shown in a fixed default order.
2. **Given** the Color Palette panel is open, **When** the user drags a color row to a new position, **Then** the list reorders immediately and the new order persists after a page refresh.
3. **Given** the Color Palette panel is open, **When** the user clicks the color circle for a row, **Then** the native color picker opens and selecting a color updates both the circle and the hex input.
4. **Given** the Color Palette panel is open, **When** the user types a valid 6-digit hex value into the text input, **Then** the color circle updates to reflect the new value and the change is saved.
5. **Given** the Color Palette panel is open, **When** the user types an invalid hex value, **Then** the input shows a validation error and the color is not updated.
6. **Given** the Color Palette panel is open, **When** the user checks the ignore box for a color, **Then** that color is marked as ignored and will not appear in any color palette dropdown across the app.
7. **Given** a color is marked ignored, **When** the user unchecks the ignore box, **Then** the color becomes available again in palette dropdowns.
8. **Given** the Color Palette panel is open, **Then** no "Add color" or "Delete color" controls are visible or accessible.

---

### User Story 2 — Select Color via Palette Dropdown (Priority: P2)

Wherever the app currently shows a plain color input, it instead shows a palette dropdown. The dropdown lists the story's non-ignored palette colors as clickable swatches in their saved order. At the bottom of the dropdown there is also a custom color picker for freehand color entry. Selecting any swatch or picking a custom color closes the dropdown and applies the selection.

**Why this priority**: This is the core consumer of the palette — it unifies color selection across the app and depends on the palette data established in P1.

**Independent Test**: Navigate to any of the three replacement sites (tag form, plot header edit, import modal plot row), open the color dropdown, select a swatch, and confirm the color is applied and the dropdown closes.

**Acceptance Scenarios**:

1. **Given** a story palette with ten colors (some ignored), **When** the user opens the palette dropdown in any context, **Then** only non-ignored colors appear as swatches, in their saved order.
2. **Given** the palette dropdown is open, **When** the user clicks a color swatch, **Then** the dropdown closes and the selected color is applied to the associated field.
3. **Given** the palette dropdown is open, **When** the user opens the custom color picker at the bottom and selects a color, **Then** the dropdown closes and the custom color is applied.
4. **Given** the palette dropdown is open, **When** the user clicks outside the dropdown, **Then** the dropdown closes without changing the current color.
5. **Given** a field already has a saved color, **When** the user opens the palette dropdown, **Then** the currently saved color is visually indicated (e.g., highlighted or checked swatch).

---

### User Story 3 — Tag Panel Color Uses Palette Dropdown (Priority: P3)

In the Manage Tags panel, when creating or editing a tag, the color field is replaced by the palette dropdown rather than a plain color input.

**Why this priority**: One of three replacement sites; depends on P2, delivers consistent color selection for tag creation.

**Independent Test**: Open Manage Tags, start creating a tag, click the color control, verify the palette dropdown appears with story palette swatches and a custom picker.

**Acceptance Scenarios**:

1. **Given** the tag creation form, **When** the user clicks the color field, **Then** the palette dropdown opens showing non-ignored palette colors.
2. **Given** the user selects a swatch, **When** the form is submitted, **Then** the tag is created with the selected color.
3. **Given** the user picks a custom color from the built-in picker, **When** the form is submitted, **Then** the tag is created with the custom color.

---

### User Story 4 — Plot Header Color Uses Palette Dropdown (Priority: P3)

In the plot column header's edit mode, the color field is replaced by the palette dropdown.

**Why this priority**: Second replacement site; depends on P2.

**Independent Test**: Enter plot header edit mode, click the color field, verify the palette dropdown appears.

**Acceptance Scenarios**:

1. **Given** the plot header is in edit mode, **When** the user clicks the color field, **Then** the palette dropdown opens.
2. **Given** the user selects a palette swatch or custom color, **Then** the plot's color updates immediately (with debounce if applicable) and the dropdown closes.

---

### User Story 5 — Import Modal Plot Row Color Uses Palette Dropdown (Priority: P3)

In the import outline modal's Plots tab, each plot row's color input is replaced by the palette dropdown.

**Why this priority**: Third replacement site; depends on P2.

**Independent Test**: Open the import modal, navigate to the Plots tab, find a plot row's color field, verify the palette dropdown appears.

**Acceptance Scenarios**:

1. **Given** the import modal is open on the Plots tab, **When** the user clicks a plot row's color field, **Then** the palette dropdown opens showing palette swatches.
2. **Given** the user selects a color, **Then** the plot row's color swatch updates and the dropdown closes.
3. **Given** new plots are auto-assigned a color during import parsing, **When** the Plots tab is shown, **Then** auto-assigned colors are drawn from the default palette in cycle order (as the app currently does, but using the story palette rather than hardcoded values).

---

### Edge Cases

- What happens when a story has no saved palette (first open)? → Display the ten default colors.
- What happens if all ten colors are ignored? → The dropdown shows only the custom color picker with no swatches (no empty-state error).
- What happens if the user types a 3-digit shorthand hex (e.g., `#abc`)? → Treat as valid; expand to 6-digit form.
- What happens if the user types a hex value with no leading `#`? → Auto-prepend `#` and validate.
- What happens in contexts without a story palette (e.g., a context where no story is loaded)? → Fall back to the custom color picker only, with no palette swatches.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST maintain a per-story color palette of exactly ten colors.
- **FR-002**: The system MUST provide a set of ten visually distinct default colors applied to any story that has not yet saved a custom palette.
- **FR-003**: The story Assets section MUST include a "Color Palette" entry that opens the sidebar in palette-edit mode.
- **FR-004**: The palette-edit sidebar panel MUST render the ten palette colors as a vertically sortable list.
- **FR-005**: Each palette row MUST contain: a drag handle, a clickable color swatch that opens a color picker, a hex text input showing the current color value, and an ignore checkbox.
- **FR-006**: Changing a color via the color picker MUST update the hex input and persist the change.
- **FR-007**: Changing a color via the hex input MUST update the color swatch; the input MUST validate the value and only persist valid hex colors.
- **FR-008**: Reordering rows via drag-and-drop MUST persist the new order.
- **FR-009**: Checking the ignore box for a color MUST exclude that color from all palette dropdowns across the app; unchecking MUST restore it.
- **FR-010**: The palette panel MUST NOT provide any controls to add or remove colors.
- **FR-011**: The system MUST provide a reusable color palette dropdown component usable in any color selection context.
- **FR-012**: The palette dropdown MUST show all non-ignored palette colors as swatches in their saved order.
- **FR-013**: The palette dropdown MUST include a built-in freehand color picker (accessible within the dropdown) for selecting colors outside the palette.
- **FR-014**: Selecting any swatch or custom color in the palette dropdown MUST close the dropdown and apply the selected color to the associated field.
- **FR-015**: The palette dropdown MUST visually indicate the currently active color when opened.
- **FR-016**: The native color input in the tag creation/edit form MUST be replaced by the palette dropdown component.
- **FR-017**: The native color input in the plot column header edit mode MUST be replaced by the palette dropdown component.
- **FR-018**: The native color input per plot row in the import modal's Plots tab MUST be replaced by the palette dropdown component.
- **FR-019**: Auto-assigned colors during import parsing MUST cycle through the story's palette colors (non-ignored, in order) rather than hardcoded values.

### Key Entities

- **Story Color Palette**: A per-story ordered list of exactly ten color entries. Each entry has: a hex color value, a sort position (integer), and an ignored flag (boolean).
- **Palette Color Entry**: An individual slot in the palette. Attributes: `color` (hex string), `position` (order index), `ignored` (boolean). Not deletable or user-addable.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can open the Color Palette panel and reorder, change, or ignore any of the ten colors in under 30 seconds per action.
- **SC-002**: The palette dropdown opens in under 200ms in all three replacement contexts (tag form, plot header, import modal).
- **SC-003**: All three native color inputs are replaced — zero native color inputs remain in those three locations.
- **SC-004**: Ignored colors are reliably absent from the palette dropdown in all contexts; no ignored color can be selected from the swatch list.
- **SC-005**: Palette order and color values persist across page refresh in 100% of cases once saved.
- **SC-006**: Auto-assigned import colors use the story palette rather than hardcoded values, visually matching the story's defined color set.

## Assumptions

- The color palette is per-story (not global or per-user). Stories share no palette data.
- Palette data is stored server-side alongside the story record.
- The ten default colors will be visually diverse and usable; exact values will be chosen during implementation.
- In contexts where no story palette is available, the palette dropdown degrades gracefully to show only the custom picker.
- "Persist as changes are made" means optimistic save with no explicit Save button in the palette panel — consistent with how other sidebar panels in the app behave.
- The ignore flag is per-palette-entry, not a global palette-level concept.
- Position 1 through 10 are fixed slots; reordering swaps positions rather than inserting/removing.
