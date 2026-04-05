# Feature Specification: Create Tag Form Reuse

**Feature Branch**: `020-tag-create-form`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Add create tag form to ManageTagsPanel and reuse in SceneTagsModal"

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

### User Story 1 - Create a Tag While Managing (Priority: P1)

As a story owner, I want to create a new tag from the tag management view so I can organize my story without leaving the management context.

**Why this priority**: This is the primary workflow for maintaining tag taxonomy.

**Independent Test**: Can be fully tested by creating a tag from the management view and verifying it appears in the tag list.

**Acceptance Scenarios**:

1. **Given** I am on the tag management view, **When** I submit a tag name and color, **Then** a new tag is created and listed.
2. **Given** I submit an empty tag name, **When** I attempt to create the tag, **Then** the system prevents creation and informs me.
3. **Given** the system cannot create a tag, **When** I submit the form, **Then** I see a clear error message and no tag is added.

---

### User Story 2 - Create a Tag While Assigning (Priority: P2)

As a story owner, I want to create a new tag from the scene tagging view so I can add missing tags while assigning them.

**Why this priority**: It reduces context switching when tagging scenes.

**Independent Test**: Can be fully tested by creating a tag from the scene tagging view and selecting it for a scene.

**Acceptance Scenarios**:

1. **Given** I am tagging a scene, **When** I create a new tag, **Then** it becomes available for selection in the tagging list.
2. **Given** I open the create tag form in either view, **When** I compare the fields, **Then** the same name and color inputs are available.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when a user submits a name that already exists?
- How does the system handle a create request failure?
- What happens when the user closes the view mid-creation?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Users MUST be able to create a new tag with a name and color from the tag management view.
- **FR-002**: Users MUST be able to create a new tag with a name and color from the scene tagging view.
- **FR-003**: System MUST prevent creating tags with empty or whitespace-only names.
- **FR-004**: System MUST provide a default tag color while allowing users to change it.
- **FR-005**: System MUST display newly created tags in the relevant tag list without requiring a page reload.
- **FR-006**: System MUST surface a user-friendly error message when tag creation fails.
- **FR-007**: The create-tag experience MUST be consistent across both views.

### Key Entities _(include if feature involves data)_

- **Tag**: A label with a name and color that can be assigned to scenes.
- **Tag Variant**: An optional named variation that belongs to a tag.

### Assumptions

- Tag names are unique within a story.
- Default tag color is preselected and can be changed before creation.

### Dependencies

- Existing capability to create tags for a story.
- Tag lists are visible in both the tag management and scene tagging views.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can create a tag from either view in under 30 seconds.
- **SC-002**: 95% of tag creation attempts succeed without validation errors.
- **SC-003**: Newly created tags appear in the tag list within 2 seconds.
