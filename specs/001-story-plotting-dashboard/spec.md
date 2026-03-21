# Feature Specification: Story Plotting Dashboard

**Feature Branch**: `001-story-plotting-dashboard`  
**Created**: March 21, 2026  
**Status**: Draft  
**Input**: User description: "Story plotting app dashboard with plots, scenes, tags, filters, and alignment rules"

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

### User Story 1 - Access and Manage Stories (Priority: P1)

As a logged-in writer, I can reach a dashboard that lists my stories and create a new story so I can start or continue work in one place.

**Why this priority**: It is the entry point to all plotting work and unlocks the rest of the feature.

**Independent Test**: Can be fully tested by logging in, opening the dashboard, and creating a story that appears in the list.

**Acceptance Scenarios**:

1. **Given** a logged-in user with no stories, **When** they open the dashboard and create a story, **Then** the new story appears in the list and is selectable.
2. **Given** a logged-in user with existing stories, **When** they open the dashboard, **Then** they see a list of their stories and can open one.

---

### User Story 2 - Build and Align Plot Threads (Priority: P2)

As a writer, I can view plots side by side, add scenes, and rearrange scenes across plots while the system keeps row alignment and placeholders consistent.

**Why this priority**: This is the core plotting experience that differentiates the product.

**Independent Test**: Can be tested by creating a story with two plots, adding scenes, and verifying alignment rules when reordering and moving scenes.

**Acceptance Scenarios**:

1. **Given** a story with multiple plots, **When** a scene is added at index 0 in one plot, **Then** other plots show placeholders at index 0.
2. **Given** aligned plots, **When** a scene is dragged from index 50 to index 25, **Then** a placeholder remains at index 50 and rows after 25 shift down by one across all plots.
3. **Given** a plot column, **When** a scene is dragged between two scenes with no placeholder, **Then** placeholders are created at the same index in the other plots.

---

### User Story 3 - Filter and View Story Structure (Priority: P3)

As a writer, I can filter scenes by tags or plots, switch between grid and timeline views, and edit scene details in a sidebar to focus on what matters.

**Why this priority**: It enables discovery and navigation in large stories and supports different working styles.

**Independent Test**: Can be tested by applying filters, toggling view modes, and editing a scene, verifying that results and layout match expected behavior.

**Acceptance Scenarios**:

1. **Given** a story with tagged scenes, **When** I filter by a tag variant, **Then** only matching scenes are shown with filter badges visible and dismissible.
2. **Given** multiple plots, **When** I switch to timeline mode, **Then** scenes appear in index order with ties ordered by plot order.
3. **Given** a scene card, **When** I open the details sidebar and edit its title and tags, **Then** the updated values are reflected on the card and in filters.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Filtering returns no matches; the UI should show an empty state while keeping filters and badges visible.
- A tag has no variants; selecting the tag applies immediately without a second selection step.
- Multiple scenes share the same index across plots; ordering within a row follows plot order and remains stable.
- A scene is dropped onto a placeholder; the placeholder is removed and alignment is preserved.
- A section/date marker sits at index 25 and a new scene is inserted before it; the marker shifts to keep its relative position.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow a logged-in user to access a dashboard listing their stories.
- **FR-002**: The system MUST allow a user to create a new story from the dashboard.
- **FR-003**: The system MUST allow each story to contain multiple plots and scenes.
- **FR-004**: The system MUST display plots side by side with scenes stacked vertically in index order.
- **FR-005**: The system MUST maintain aligned scene indices across plots using placeholders for missing scenes.
- **FR-006**: The system MUST support multiple scenes sharing the same index across plots.
- **FR-007**: The system MUST allow drag-and-drop reordering within a plot column.
- **FR-008**: The system MUST allow dragging a scene from one plot to another while preserving index alignment rules.
- **FR-009**: The system MUST insert placeholders across other plots when a scene is dropped into a new index without an existing placeholder.
- **FR-010**: The system MUST keep placeholders at the original index when a scene is moved to a different index.
- **FR-011**: The system MUST provide a scene details sidebar with editable title, tags, description, and additional text blocks.
- **FR-012**: The system MUST support many-to-many tagging between scenes and tags.
- **FR-013**: The system MUST support tag variants (base tag plus sub-value) and apply filters by variant.
- **FR-014**: The system MUST provide a topbar with filter controls for search, sort, filters, and view mode toggle.
- **FR-015**: The system MUST show active filter badges with dismiss actions when filters are applied.
- **FR-016**: The system MUST provide display modes for grid (small, medium, large) and timeline views.
- **FR-017**: The system MUST show a combined timeline ordered by scene index, breaking ties by plot order.
- **FR-018**: The system MUST support a visual filter mode where non-matching scenes are shown in a reduced detail state.
- **FR-019**: The system MUST support story sections and dates placed at indices, shifting with insertions to maintain alignment.

### Key Entities _(include if feature involves data)_

- **User**: Person who owns stories and can access the dashboard.
- **Story**: A collection of plots, scenes, tags, sections, and dates.
- **Plot**: A named thread within a story that contains ordered scenes.
- **Scene**: A unit of narrative with title, description, optional text blocks, tags, and an index position.
- **Tag**: A label scoped to a story, optionally with variants, applied to scenes.
- **Tag Variant**: A sub-value for a tag (base + variant) used in filtering and labeling.
- **Section**: A story marker at a specific index (for example, acts) that visually divides the timeline.
- **Date Marker**: A smaller story marker at a specific index used for time cues.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 90% of users can create a story with two plots and three scenes in under 5 minutes.
- **SC-002**: 95% of drag-and-drop moves complete with correct alignment and placeholder behavior on the first attempt.
- **SC-003**: Users can find a specific scene using filters in under 2 minutes in a story with up to 200 scenes.
- **SC-004**: 90% of users report that grid and timeline views are easy to understand and consistent.

## Assumptions

- Each story is owned by a single user; collaboration is out of scope for this feature.
- Tags are scoped to a story and are shared across its plots and scenes.
- Scene search and filters apply within the active story only.
- Scenes have a single primary index; multiple scenes can share an index.

## Out of Scope

- Real-time multi-user editing or commenting.
- Import/export to external writing tools.
- Automatic scene generation or AI drafting.

## Dependencies

- User authentication and basic story persistence exist or are provided by another feature.
