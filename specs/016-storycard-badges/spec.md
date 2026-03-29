# Feature Specification: Story Card Count Badges

**Feature Branch**: `016-storycard-badges`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "To the dashboard StoryGrid > StryCard, let's add a badge for \"characters\", and \"tags\" in addition plots and scenes.

This will require updates to the endpoint / query"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - See full story counts at a glance (Priority: P1)

As a dashboard user, I want each story card to show counts for plots, scenes, characters, and tags so I can understand story scope at a glance.

**Why this priority**: This is the core visible change and the primary user value of the feature.

**Independent Test**: Open the dashboard with seeded stories and verify the four badges appear with correct counts per story.

**Acceptance Scenarios**:

1. **Given** a story with plots, scenes, characters, and tags, **When** I view the dashboard, **Then** the story card shows four badges with the correct counts.
2. **Given** a story with zero characters or tags, **When** I view the dashboard, **Then** the story card shows badges with a count of 0 for those categories.
3. **Given** story count data changes, **When** the dashboard data refreshes, **Then** the story card badges update to the new counts.

---

### User Story 2 - Compare story scope across the grid (Priority: P2)

As a dashboard user, I want consistent badges on every story card so I can compare stories without opening them.

**Why this priority**: Supports quick triage and comparison once the badges exist.

**Independent Test**: Load a grid of multiple stories and confirm all story cards display the four count badges.

**Acceptance Scenarios**:

1. **Given** a dashboard grid with multiple stories, **When** I scan the story cards, **Then** each card shows plots, scenes, characters, and tags counts in a consistent layout.

### Edge Cases

- Story count data is missing or unavailable for a story.
- Story has very large counts (e.g., 1,000+), and badges still display the full count.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display badges for characters and tags on each story card alongside plots and scenes.
- **FR-002**: System MUST provide character and tag counts for each story in the dashboard story list data.
- **FR-003**: System MUST show a numeric count for each badge, including zero.
- **FR-004**: Badge counts MUST match the underlying story data presented to the user.
- **FR-005**: Story cards MUST update their badge counts when the dashboard data refreshes.

### Key Entities _(include if feature involves data)_

- **Story Summary**: A dashboard-friendly view of a story including title, description, and a set of count metrics.
- **Story Counts**: A collection of counts for plots, scenes, characters, and tags associated with a story.

### Assumptions

- The dashboard already displays plots and scenes counts per story.
- Users with access to the dashboard can view all four counts for each story.
- When count data is unavailable, the system defaults to 0 to keep badges consistent.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In a test dataset of at least 50 stories, 100% of story cards show four count badges.
- **SC-002**: For a sampled set of stories, badge counts match the source data with 0 mismatches.
- **SC-003**: 90% of tested users can identify character and tag counts for a story in under 10 seconds.
- **SC-004**: The dashboard renders a grid of 50 story cards with all four badges visible in under 2 seconds on a standard workstation.
