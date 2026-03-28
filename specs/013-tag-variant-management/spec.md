# Feature Specification: Tag Variant Management

**Feature Branch**: `013-tag-variant-management`  
**Created**: 2026-03-28  
**Status**: Draft  
**Input**: User description: "Add variant functionality to tags management in SceneTagsModal."

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

### User Story 1 - Convert a tag into a variant (Priority: P1)

As a user managing scene tags, I can mark an existing tag as a variant so it changes to the variant state in the list.

**Why this priority**: This enables the core workflow for creating variant tags and is required before variant management can happen.

**Independent Test**: Can be fully tested by toggling a non-variant tag to variant and verifying the row updates to the variant state.

**Acceptance Scenarios**:

1. **Given** a tag that is not a variant, **When** I select the variant action, **Then** the tag is marked as a variant and its row updates to the variant state.
2. **Given** a tag that is not a variant, **When** the system cannot update the variant state, **Then** the tag remains unchanged and I see a clear error message.

---

### User Story 2 - Expand a variant tag to manage variants (Priority: P2)

As a user, I can expand a variant tag row to see its variants and manage them.

**Why this priority**: Once a tag is a variant, the user needs access to view and manage its variants.

**Independent Test**: Can be fully tested by expanding a variant tag and verifying the variants list and actions appear.

**Acceptance Scenarios**:

1. **Given** a tag already marked as a variant, **When** I expand the row, **Then** I see a list of its variants and actions for each variant.
2. **Given** a variant tag with no variants, **When** I expand the row, **Then** I see an empty state that still offers the ability to add a variant.

---

### User Story 3 - Add and remove variants (Priority: P3)

As a user, I can add a new variant and delete an existing variant from the expanded view.

**Why this priority**: Variant lifecycle actions complete the workflow for maintaining variants under a tag.

**Independent Test**: Can be fully tested by adding a new variant and deleting an existing variant from the expanded list.

**Acceptance Scenarios**:

1. **Given** an expanded variant tag, **When** I add a new variant, **Then** it appears in the list with its actions available.
2. **Given** an expanded variant tag with variants, **When** I delete a variant, **Then** it is removed from the list and no longer available.
3. **Given** an expanded variant tag, **When** I try to add a variant with a duplicate name, **Then** the system rejects it and explains the conflict.
4. **Given** an expanded variant tag, **When** an add or delete action fails, **Then** the list remains unchanged and I see a clear error message.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Expanding a variant tag while another tag is expanded does not cause UI overlap or loss of state.
- Attempting to add a variant with a duplicate name is rejected with a clear message.
- A failed add or delete action leaves the list unchanged and communicates the error.
- A tag that loses variant status collapses any expanded view and hides variant actions.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Users MUST be able to mark a non-variant tag as a variant from the tag row action.
- **FR-002**: When a tag becomes a variant, the row MUST update to the variant state without requiring a manual refresh.
- **FR-003**: Users MUST be able to expand and collapse a variant tag row to show or hide its variants.
- **FR-004**: Expanded variant rows MUST show a list of variants with a delete action for each variant.
- **FR-005**: Expanded variant rows MUST provide an action to add a new variant.
- **FR-006**: The system MUST prevent adding variants with duplicate names under the same parent tag.
- **FR-007**: The system MUST communicate failures for variant conversion, add, or delete actions without changing the visible list state.

### Key Entities

- **Tag**: A label applied to scenes, which can optionally be a variant parent.
- **Variant**: A sub-tag associated with a parent tag, managed within the parent’s expanded view.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can convert a tag to a variant in under 10 seconds in 95% of attempts.
- **SC-002**: Expanded variant lists render and become usable in under 1 second for up to 50 variants.
- **SC-003**: At least 90% of add/delete variant actions complete successfully on the first attempt.
- **SC-004**: User-reported confusion about variant tagging decreases by 30% after release.

## Assumptions

- Variant status is a single toggle per tag, and a tag is either a variant parent or not.
- Variant names are unique within a single parent tag.
- The user can manage variants wherever they can already manage tags.
