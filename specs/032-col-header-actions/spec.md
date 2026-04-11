# Feature Specification: Col Header Row Actions

**Feature Branch**: `[032-col-header-actions]`  
**Created**: April 11, 2026  
**Status**: Draft  
**Input**: User description: "Let's add button groups and actions to the col-header.

1. All buttons show on hover over the col-header component.
2. In the top right corner is the mdi/arrow-expand-up icon with the tooltip 'insert row above'. Clicking this will shift the grid down on the current index.
3. In the bottom right corner is the mdi/arrow-expand-down icon with the tooltip 'create row blow'. Clicking will shift the grid down at index+1.
4. if the row is empty, a button will appear in the center right with the mdi/delete icon wtih the tooltip 'clear empty row'. Clicking it wills hift the grid down at the current index.
5. On the left, there will be two buttons. 'add act' and 'add chapter'. Clicking them will insert a section at the current index with the type of the button checked and shift the grid down at that index if it isn't empty."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Insert Rows from Header (Priority: P1)

As a plotter, I can insert rows above or below a given row directly from the column header so I can expand the grid without leaving context.

**Why this priority**: Row insertion is the core interaction described and must work before other actions provide value.

**Independent Test**: Can be fully tested by hovering a column header and inserting a row above and below, verifying the grid shifts as expected.

**Acceptance Scenarios**:

1. **Given** a column header is visible, **When** I hover over it, **Then** the top-right "insert row above" control is visible.
2. **Given** the grid has rows, **When** I click "insert row above" for a header at index $i$, **Then** a new row is inserted at index $i$ and existing rows shift down.
3. **Given** the grid has rows, **When** I click "create row below" for a header at index $i$, **Then** a new row is inserted at index $i + 1$ and existing rows shift down.

---

### User Story 2 - Add Acts or Chapters (Priority: P2)

As a plotter, I can add an act or chapter section at a specific row from the column header to organize the story structure quickly.

**Why this priority**: Section insertion is a primary authoring action that depends on row placement behavior.

**Independent Test**: Can be tested by adding an act and a chapter at a chosen header index with both empty and non-empty rows.

**Acceptance Scenarios**:

1. **Given** a column header is visible, **When** I hover over it, **Then** I see the "add act" and "add chapter" controls on the left.
2. **Given** the row at index $i$ is empty, **When** I click "add act", **Then** an act section is inserted at index $i$.
3. **Given** the row at index $i$ is not empty, **When** I click "add chapter", **Then** the grid shifts down at index $i$ and a chapter section is inserted at index $i$.

---

### User Story 3 - Clear Empty Row (Priority: P3)

As a plotter, I can clear an empty row from the column header to keep the grid tidy.

**Why this priority**: This is a secondary action that only applies in a specific state (empty row).

**Independent Test**: Can be tested by hovering a header for an empty row and invoking the clear action, verifying the row state change.

**Acceptance Scenarios**:

1. **Given** the row at index $i$ is empty, **When** I hover over the column header, **Then** I see the "clear empty row" control in the center-right.
2. **Given** the row at index $i$ is not empty, **When** I hover over the column header, **Then** I do not see the "clear empty row" control.
3. **Given** the row at index $i$ is empty, **When** I click "clear empty row", **Then** the empty row is removed and all rows above shift down to lower indices.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Inserting above the first row and below the last row still results in a valid new row.
- Hover controls do not obscure key header content or overlap in a way that makes any action unreachable.
- If a row becomes non-empty while hover controls are visible, the "clear empty row" control disappears without triggering.
- Rapid consecutive clicks on insert actions do not create duplicate rows for a single click.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST reveal all column-header action buttons only on hover of the column-header component.
- **FR-002**: System MUST provide a top-right "insert row above" action with tooltip text "insert row above".
- **FR-003**: Clicking "insert row above" MUST insert a new row at the current header index $i$ and shift existing rows down.
- **FR-004**: System MUST provide a bottom-right "create row below" action with tooltip text "create row below".
- **FR-005**: Clicking "create row below" MUST insert a new row at index $i + 1$ and shift existing rows down.
- **FR-006**: System MUST show a center-right "clear empty row" action only when the current row is empty, with tooltip text "clear empty row".
- **FR-007**: Clicking "clear empty row" MUST remove the empty row and shift all rows above the current index down to lower indices.
- **FR-008**: System MUST provide left-side actions "add act" and "add chapter" on hover.
- **FR-009**: Clicking "add act" or "add chapter" MUST insert a section of that type at index $i$.
- **FR-010**: If the row at index $i$ is not empty, clicking "add act" or "add chapter" MUST shift the grid down at index $i$ before inserting the section.
- **FR-011**: All actions MUST operate on the row index associated with the hovered column header.

### Key Entities _(include if feature involves data)_

- **Column Header**: The header element aligned to a specific row index that exposes row-level actions.
- **Row**: A single grid row identified by index, which may be empty or contain content.
- **Section**: A structured row entry with a type of "act" or "chapter".

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can insert a row above or below a chosen header in 5 seconds or less.
- **SC-002**: Users can add an act or chapter section in 2 clicks from the header.
- **SC-003**: At least 90% of test users correctly identify the purpose of each header action from its tooltip on first try.
- **SC-004**: In a QA run of 50 consecutive insert actions, no unintended row placement errors are observed.

## Assumptions

- The column header is already associated with a row index in the plot grid.
- "Create row below" refers to inserting a new row at index $i + 1$.
