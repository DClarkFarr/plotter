# Feature Specification: Scene Snippets

**Feature Branch**: `023-scene-snippets`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Let's add snippets functionality to scenes. When a user opens the Tasks sidebar, below the todo list should be a list of snippets. Snippets have a label, and then full rich text wysiwyg editor. By default, they are collapsed with a label with the title text. Clicking the label opens the editable title and wysiwyg. User can click an add snippet button, which opens an add snippet modal, which explains that snippets are to put ideas or actual text. Submitting the modal adds the new snippet to the list. Snippets are rendered in list view extra horizontal margins and maybe a typewriter font."

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

### User Story 1 - Review and edit snippets (Priority: P1)

A writer opens the Tasks sidebar for a scene and reviews snippets, expanding a snippet to edit its title and rich text content.

**Why this priority**: This enables the core value of capturing and refining ideas tied to a scene.

**Independent Test**: Can be fully tested by opening a scene with existing snippets and editing one snippet end-to-end.

**Acceptance Scenarios**:

1. **Given** a scene with snippets, **When** the Tasks sidebar opens, **Then** the snippet list appears below the todo list with each snippet collapsed to its title label.
2. **Given** a collapsed snippet, **When** the user clicks its label, **Then** the title and rich text editor open for editing.
3. **Given** the snippets list is visible, **When** it renders in list view, **Then** each snippet shows extra horizontal margins and a typewriter-like visual style.

---

### User Story 2 - Add a new snippet (Priority: P2)

A writer adds a new snippet from the Tasks sidebar using a guided modal that explains the purpose of snippets.

**Why this priority**: Adding snippets is the primary way users capture ideas and draft text for a scene.

**Independent Test**: Can be fully tested by adding a snippet from an empty list and confirming it appears in the list.

**Acceptance Scenarios**:

1. **Given** the Tasks sidebar is open, **When** the user selects "add snippet", **Then** a modal opens that explains snippets are for ideas or actual text.
2. **Given** the add snippet modal, **When** the user submits a new snippet, **Then** the snippet appears in the list below the todo items.
3. **Given** existing snippets in the list, **When** a new snippet is added, **Then** it appears in a consistent list order after the existing items.

---

---

### Edge Cases

- No snippets exist yet; the list area still shows a clear empty state and the add snippet action.
- A snippet title is blank or very long; the label remains readable and does not break the layout.
- The user opens a snippet and then collapses it without changes; the view returns to the collapsed label.
- The user cancels the add snippet modal; no new snippet is created.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST show a snippets section below the todo list when the Tasks sidebar is open for a scene.
- **FR-002**: The system MUST display each snippet in a collapsed state by default, showing a title label.
- **FR-003**: Clicking a snippet label MUST expand the snippet to show an editable title and rich text content.
- **FR-004**: Users MUST be able to edit a snippet title and its rich text content within the expanded view.
- **FR-005**: The system MUST provide an "add snippet" action within the snippets section.
- **FR-006**: The "add snippet" action MUST open a modal that explains snippets are for ideas or actual text.
- **FR-007**: Submitting the add snippet modal MUST add the new snippet to the list below the todo items.
- **FR-008**: Snippets in list view MUST render with extra horizontal margins and a typewriter-like visual style.
- **FR-009**: The system MUST preserve the order of snippets as shown in the list for a given scene.

### Key Entities _(include if feature involves data)_

- **Snippet**: A note tied to a scene, with a title label, rich text content, and a list order.
- **Scene**: The parent context that owns a list of snippets in its Tasks sidebar.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of users can add a snippet in under 60 seconds after opening the Tasks sidebar.
- **SC-002**: At least 95% of snippet edits are saved without users needing to retry or refresh.
- **SC-003**: The snippet list becomes visible within 2 seconds of opening the Tasks sidebar in typical usage.
- **SC-004**: User-reported usefulness of snippets for capturing ideas scores at least 4 out of 5 in feedback surveys.

## Assumptions

- Snippets are ordered by creation time unless a user reorders them in a separate feature.
- The typewriter-like style is applied consistently across list view snippets.
- Snippets are scoped to a single scene and are not shared across scenes in this feature.
