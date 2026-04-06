# Feature Specification: Story Filters

**Feature Branch**: `024-story-filters`  
**Created**: April 5, 2026  
**Status**: Draft  
**Input**: User description: "Let's add the filters functionality. From the story page, when a user clicks on the filter icon in the top bar portal content, the filter options menu should show. The filter droptown menu should: F1) Have an option to select tags. Clicking the tags option should open another dropdown with all the story's tags. There should be a \"search\" input at the top of the tags selection menu. If the tag does not have variants, selecting a tag should add it to the filters. If the tag has variants, then instead selecting a tag should show another dropdown with the variant options. In addition to the variants there should be an \"All\" option. After making the variant or \"all\" selection then applies the filter. F2) Have an option to select plot. The functionality is the same as tags, with the search input and displaying the story's plots. F3) Have an option to select character. The functionality is the same as tags, with a search input and displaying the story's characters. F4) have an option to filter by \"custom text\". Selecting \"custom text\" should open a modal with a text input. Submitting the modal applies the filter. Creating the new filters bar. B1) The filters bar should appear at the top of the page. It should contain a wrapping group of badges/filters that display the filter type and filter value. There should be an X after each filter to clear it. B2) There should be a \"clear all\" button on the far right of the bar. B3) The filter bar should only appear when one filter is active"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Apply structured filters (Priority: P1)

As a story viewer, I can open the filters menu and add tag, plot, or character filters (with search and variant selection) to narrow what I see on the story page.

**Why this priority**: This is the core filtering workflow and the primary user value of the feature.

**Independent Test**: Can be fully tested by opening the filter menu and adding a tag, plot, or character filter to see that the filter is active.

**Acceptance Scenarios**:

1. **Given** the story page is open, **When** the user opens the filter menu and selects a tag without variants, **Then** the tag filter is applied.
2. **Given** the story page is open and a tag has variants, **When** the user selects the tag and then selects a variant or the All option, **Then** the selected variant or All option is applied as a filter.
3. **Given** the story page is open, **When** the user searches within tags, plots, or characters, **Then** the list is narrowed to matching items.

---

### User Story 2 - Apply custom text filter (Priority: P2)

As a story viewer, I can enter a custom text filter so I can narrow results using a free-form phrase.

**Why this priority**: Custom text filtering supports cases that are not covered by structured tags, plots, or characters.

**Independent Test**: Can be fully tested by opening the custom text modal, entering text, and confirming a new filter appears as active.

**Acceptance Scenarios**:

1. **Given** the filter menu is open, **When** the user selects custom text and submits a non-empty value, **Then** the custom text filter is applied.
2. **Given** the custom text modal is open, **When** the user cancels or closes the modal, **Then** no custom text filter is applied.

---

### User Story 3 - Manage active filters (Priority: P3)

As a story viewer, I can see all active filters in a filters bar and remove individual filters or clear them all at once.

**Why this priority**: Users must be able to understand and quickly manage the filters they have applied.

**Independent Test**: Can be fully tested by applying two filters, removing one, and then clearing all.

**Acceptance Scenarios**:

1. **Given** at least one filter is active, **When** the user views the top of the page, **Then** a filters bar shows the active filters with remove actions.
2. **Given** a filter is active, **When** the user removes it, **Then** that filter is no longer active.
3. **Given** multiple filters are active, **When** the user selects clear all, **Then** all filters are removed and the filters bar disappears.

---

### Edge Cases

- What happens when the story has no tags, plots, or characters available?
- What happens when a search yields no results?
- What happens when the user selects a tag with variants and then switches between All and a specific variant?
- What happens when the last active filter is removed?
- How does the system handle a custom text input that is only whitespace?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST show a filter options menu when the user selects the filter icon on the story page.
- **FR-002**: The filter options menu MUST include options for tags, plots, characters, and custom text.
- **FR-003**: The tags, plots, and characters options MUST each open a selection menu with a search input and a list of available items for the story.
- **FR-004**: Selecting a tag, plot, or character without variants MUST apply a filter for that item.
- **FR-005**: If a tag has variants, selecting the tag MUST open a variant selection menu that includes an All option and all variants for that tag.
- **FR-006**: Selecting a tag variant or the All option MUST apply the tag filter using the selected scope.
- **FR-007**: Selecting custom text MUST open a modal with a text input, and submitting a non-empty value MUST apply a custom text filter.
- **FR-008**: The filters bar MUST appear at the top of the story page only when at least one filter is active.
- **FR-009**: Each active filter in the filters bar MUST display its filter type and filter value.
- **FR-010**: Each active filter MUST have a remove action that clears only that filter.
- **FR-011**: The filters bar MUST provide a clear all action that removes all active filters at once.
- **FR-012**: The system MUST prevent duplicate filters for the same filter type and value from appearing more than once.

### Key Entities _(include if feature involves data)_

- **Filter**: An active constraint applied on the story page, defined by type and value.
- **Filter Type**: The category of the filter (tag, plot, character, custom text).
- **Tag**: A story tag that may optionally include variants.
- **Tag Variant**: A specific variant associated with a tag.
- **Plot**: A plot item associated with the story.
- **Character**: A character associated with the story.
- **Custom Text Query**: A user-provided text value used as a filter.

## Assumptions

- Users can apply multiple filters across different types during the same session on the story page.
- Selecting a different variant (or All) for the same tag replaces the previous variant selection for that tag.
- A custom text filter requires at least one non-whitespace character to be applied.
- Users can dismiss the custom text modal without applying a filter.

## Dependencies

- The story page provides the current lists of tags, plots, characters, and tag variants for filtering.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 90% of users can apply a tag, plot, or character filter within 15 seconds of opening the filter menu.
- **SC-002**: Users can clear all active filters in a single action and see the filters bar disappear immediately afterward.
- **SC-003**: 95% of filter applications update the visible story results within 2 seconds of the user action.
- **SC-004**: At least 80% of users rate the filters as easy to understand in post-task feedback.
