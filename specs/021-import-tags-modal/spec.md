# Feature Specification: Import Tags Modal

**Feature Branch**: `021-import-tags-modal`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Add import tags functionality in ManageTagsPanel with a modal to select tags from another story and import them."

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

### User Story 1 - Import tags from another story (Priority: P1)

As a writer, I want to import tags from another story so I can reuse consistent tagging without manual re-entry.

**Why this priority**: This is the core value of the feature and unlocks immediate time savings.

**Independent Test**: Can be fully tested by importing at least one tag from a different story and confirming it appears in the current story after success.

**Acceptance Scenarios**:

1. **Given** the tag manager is open, **When** I open the import modal and import selected tags, **Then** the selected tags are added to the current story and the modal closes.
2. **Given** the import is in progress, **When** I click import, **Then** I see a loading state and a success or error toast after completion.

---

### User Story 2 - Compare tags before importing (Priority: P2)

As a writer, I want to compare tags from another story with my current story so I can avoid duplicating existing tags.

**Why this priority**: Visual comparison prevents accidental duplicates and builds confidence in the import.

**Independent Test**: Can be tested by selecting a story that has at least one tag matching the current story and confirming the matching tag is visually de-emphasized.

**Acceptance Scenarios**:

1. **Given** I select a story to import from, **When** the comparison view is shown, **Then** tags with matching names in the current story are visually de-emphasized on the current story side.

---

### User Story 3 - Select tags to import (Priority: P3)

As a writer, I want to select specific tags to import so I can control what is added to my current story.

**Why this priority**: Selection enables targeted imports and avoids unwanted tags.

**Independent Test**: Can be tested by selecting and deselecting tag rows and verifying the selection styling and resulting import set.

**Acceptance Scenarios**:

1. **Given** the comparison view is open, **When** I click a tag row on the import side, **Then** it toggles selection and its styling changes to indicate selection.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- No other stories are available to import from.
- Selected story has no tags to import.
- All tags in the selected story already exist in the current story.
- Import fails due to a transient error and the modal should remain open with an error message.
- Large tag lists require clear row alignment between the two columns.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide an "Import tags" entry point in the tag management panel with a tooltip describing its purpose.
- **FR-002**: System MUST open an import modal that lists all available stories with an action to view their tags.
- **FR-003**: System MUST allow selecting a story to display a comparison view showing tags from the selected story and tags from the current story side by side in aligned rows.
- **FR-004**: System MUST visually de-emphasize current-story tags that match selected-story tags by name.
- **FR-005**: System MUST allow users to select and deselect tags to import, with a clear selected state indicator on the import side.
- **FR-006**: System MUST allow users to initiate the import and show a loading state during the operation.
- **FR-007**: System MUST confirm success or failure with a toast message.
- **FR-008**: System MUST close the modal after a successful import and keep it open after a failed import.
- **FR-009**: System MUST avoid importing tags that already exist in the current story by name.

### Key Entities _(include if feature involves data)_

- **Story**: A writing project that owns a set of tags and can serve as an import source.
- **Tag**: A named label associated with a story.
- **Tag Import Selection**: The set of tag names chosen for import from a source story.
- **Import Result**: Outcome of an import attempt, including success or failure state and any messages.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can complete a tag import from another story in under 2 minutes.
- **SC-002**: 90% of users successfully import tags on the first attempt without external help.
- **SC-003**: Imports of up to 100 tags complete within 5 seconds.
- **SC-004**: Support requests about duplicate tags decrease by 30% after release.

## Assumptions

- Users have permission to view tags for stories shown in the list.
- Story names are available to identify sources in the list view.
- Tag matching is based on exact name equality.
