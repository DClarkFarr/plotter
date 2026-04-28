# Feature Specification: Matched Results Only Filter Mode

**Feature Branch**: `054-add-matched-scenes-filter`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "as a user, i should be able to search/filter and see only the matched results.

Right now the filter toggle button minifies or hides scenes. Let's a a third state 'show only matched scenes'. Excluded scenes are removed entirely and not rendered in any way. Plots that aren't matched don't even render (in grid mode)."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Show only matched scenes (Priority: P1)

As a user filtering scenes, I can switch to a third filter display state that shows only matched scenes so I can focus on relevant results without visual clutter.

**Why this priority**: This is the core business need and primary user value of the request.

**Independent Test**: Can be fully tested by applying a filter with mixed matched and excluded scenes, selecting the new mode, and verifying only matched scenes remain visible.

**Acceptance Scenarios**:

1. **Given** a filtered story with matched and excluded scenes, **When** the user selects "show only matched scenes", **Then** only matched scenes are visible in the active view.
2. **Given** the user is in "show only matched scenes" mode, **When** the filter query changes, **Then** the visible scenes update to show only the currently matched scenes.

---

### User Story 2 - Remove excluded content from rendering (Priority: P2)

As a user, excluded scenes should be fully removed from presentation in "show only matched scenes" mode so the interface does not show collapsed placeholders or hidden remnants.

**Why this priority**: Prevents ambiguity and reduces cognitive load while scanning filtered results.

**Independent Test**: Can be tested by enabling the mode and confirming excluded scenes are neither visible nor represented by placeholders in list and grid presentations.

**Acceptance Scenarios**:

1. **Given** excluded scenes exist, **When** "show only matched scenes" mode is active, **Then** excluded scenes are not rendered in any visible form.
2. **Given** excluded scenes were previously minified or hidden in other modes, **When** the mode switches to "show only matched scenes", **Then** no collapsed or hidden scene shells remain in the layout.

---

### User Story 3 - Hide non-matching plots in grid mode (Priority: P3)

As a user in grid mode, I only see plots that contain matched scenes while "show only matched scenes" mode is active.

**Why this priority**: Keeps the grid concise and aligned with the expectation of "show only matched" behavior.

**Independent Test**: Can be tested by filtering to matches that exist in only some plots and verifying unmatched plots are fully absent in grid mode.

**Acceptance Scenarios**:

1. **Given** grid mode and a filter that matches scenes in some plots only, **When** "show only matched scenes" mode is active, **Then** plots without matched scenes are not rendered.
2. **Given** grid mode in "show only matched scenes", **When** a previously unmatched plot gains at least one matched scene after filter changes, **Then** that plot appears in the grid.

### Edge Cases

- What happens when the filter returns zero matched scenes: no scenes are rendered, and the user sees an explicit empty-results state.
- What happens when all scenes match: behavior is equivalent to displaying the full dataset, with no content removed.
- What happens when users switch between all three filter display modes rapidly: each mode applies correctly without stale scenes from prior states.
- How does system handle clearing the filter while in "show only matched scenes": all scenes and plots return according to the default unfiltered view.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide three filter display states: existing state A, existing state B, and a new state labeled "show only matched scenes".
- **FR-002**: In "show only matched scenes" state, the system MUST render only scenes currently matched by active search/filter criteria.
- **FR-003**: In "show only matched scenes" state, the system MUST exclude unmatched scenes from rendering entirely, including removal of placeholders, collapsed cards, or hidden scene shells.
- **FR-004**: In grid mode, while "show only matched scenes" is active, the system MUST render only plots that contain at least one currently matched scene.
- **FR-005**: In grid mode, while "show only matched scenes" is active, the system MUST exclude plots with zero matched scenes from rendering entirely.
- **FR-006**: When the user updates filter/search criteria while "show only matched scenes" is active, the rendered scenes and plots MUST update to reflect the new match set.
- **FR-007**: When the user switches from "show only matched scenes" to another display state, the system MUST restore rendering behavior defined for the selected state.
- **FR-008**: The system MUST display a clear empty-results state when no scenes match while "show only matched scenes" is active.

### Key Entities _(include if feature involves data)_

- **Filter Display Mode**: Represents the currently selected filter presentation state, including the new "show only matched scenes" value.
- **Scene Match Result**: Represents whether a scene satisfies current search/filter criteria.
- **Plot Match Group**: Represents a plot and the set of matched scenes within it, used to determine whether the plot is rendered in grid mode.

### Assumptions

- Existing two filter display states remain available and unchanged in intent.
- "Matched" is determined by the same search/filter rules already used in current filtering behavior.
- The new state applies wherever filtered scene results are shown, with explicit plot-level removal required in grid mode.

### Dependencies

- Existing scene search/filter computation remains available and continues to produce reliable matched/unmatched results.
- Existing mode-toggle interaction supports adding one additional user-selectable display state.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In usability testing, 95% of users can switch to "show only matched scenes" and identify only relevant scenes on first attempt.
- **SC-002**: For test datasets with mixed matches, 100% of unmatched scenes are absent from the rendered result in "show only matched scenes" mode.
- **SC-003**: In grid mode test cases, 100% of plots without matched scenes are absent while "show only matched scenes" mode is active.
- **SC-004**: In at least 90% of observed sessions using filtered results, users report reduced visual clutter compared with existing minified/hidden behavior.
