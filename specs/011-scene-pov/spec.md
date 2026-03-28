# Feature Specification: Scene POV Selection

**Feature Branch**: `[011-scene-pov]`  
**Created**: March 27, 2026  
**Status**: Draft  
**Input**: User description: "Add \"pov\" column to the scene model. When a scene is clicked and the sidebar opens with the SceneForm, there will be an option to select a pov (character name) directly underneath the title. The select option will load characters for the story, show avatar imagery (with a generated color when missing), allow adding a new character inline, and display the pov on the SceneCard."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## Clarifications

### Session 2026-03-27

- Q: Which fields are required when adding a character inline from the POV selector? → A: Name only (required).
- Q: How should users clear the POV selection? → A: Clearable control (remove selection).
- Q: How should the POV character list be ordered? → A: Alphabetical by character name.
- Q: What should the scene card display for POV? → A: Avatar + name.

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

### User Story 1 - Assign POV to a Scene (Priority: P1)

As a writer, I want to select a POV character while editing a scene so that the scene clearly reflects who the perspective belongs to.

**Why this priority**: It directly ties POV to the scene during core editing, which is the primary workflow.

**Independent Test**: Can be fully tested by selecting a POV in the scene sidebar and confirming it persists when reopening the scene.

**Acceptance Scenarios**:

1. **Given** a scene is open in the sidebar, **When** I choose a POV character, **Then** the selection is saved with the scene.
2. **Given** a scene has a saved POV, **When** I reopen the scene, **Then** the POV selection is prefilled.
3. **Given** a scene has a saved POV, **When** I clear the selection, **Then** the scene no longer has a POV assigned.

---

### User Story 2 - Add a New Character Inline (Priority: P2)

As a writer, I want to add a new character from the POV selector so I do not have to leave the scene I am editing.

**Why this priority**: It reduces workflow disruption by keeping character creation inside the POV selection flow.

**Independent Test**: Can be fully tested by creating a character in the POV selector and seeing it selected immediately.

**Acceptance Scenarios**:

1. **Given** I am editing a scene, **When** I choose to add a new character and save, **Then** the character is created and selected as the POV.
2. **Given** I start adding a new character, **When** I cancel, **Then** no character is created and the selector returns to its prior state.

---

### User Story 3 - See POV on Scene Cards (Priority: P3)

As a writer, I want to see the POV character on each scene card so I can scan scenes by perspective.

**Why this priority**: It supports quick visual scanning but depends on POV assignment being available.

**Independent Test**: Can be fully tested by assigning a POV and verifying it appears on the scene card.

**Acceptance Scenarios**:

1. **Given** a scene has a POV character, **When** I view the scene card, **Then** the POV avatar and name appear on the card.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- No characters exist yet for the story when the selector loads.
- A character has no image, so a generated color avatar is shown instead.
- Character creation fails or is rejected; the scene remains unchanged and the user is notified.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow a scene to store a POV character reference.
- **FR-002**: The POV selection control MUST appear directly beneath the scene title in the scene sidebar.
- **FR-003**: The POV selector MUST display all characters available for the current story.
- **FR-004**: Each character option MUST show the character name and an avatar image when available.
- **FR-005**: When a character has no image, the selector MUST show a colored avatar generated from the character name.
- **FR-006**: Users MUST be able to add a new character from the POV selector without leaving the scene.
- **FR-007**: After creating a new character, the selector MUST close the add form and auto-select the new character as the POV.
- **FR-008**: The POV avatar and name MUST appear on the top-right of each scene card when a POV is set.
- **FR-009**: If a scene has no POV, the scene card MUST not show a POV avatar or name.
- **FR-010**: Clearing the POV selection MUST remove the POV from the scene.
- **FR-011**: The POV selector MUST provide a clearable control to remove the selection.
- **FR-012**: The POV selector MUST order characters alphabetically by name.
- **FR-013**: Scene cards MUST show the POV avatar and name when a POV is set.

### Key Entities _(include if feature involves data)_

- **Scene**: Story unit with a title and optional POV character reference.
- **Character**: Story character with a name, optional description, and optional image.
- **Story**: The container that owns scenes and characters.

### Assumptions

- POV is optional for a scene.
- Inline character creation requires only a name; other details are optional.
- Permissions for editing scenes also apply to assigning or creating POV characters.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 90% of POV assignments are completed in under 20 seconds from opening the scene sidebar.
- **SC-002**: 95% of scenes with a POV show the avatar and name on the scene card without manual refresh.
- **SC-003**: 90% of new character creations from the POV selector complete in under 60 seconds.
- **SC-004**: At least 80% of active stories have POV set on one or more scenes within two weeks of release.
