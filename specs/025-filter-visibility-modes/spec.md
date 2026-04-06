# Feature Specification: Filter Visibility Modes

**Feature Branch**: `025-filter-visibility-modes`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "We need to apply changes to the UI based on selected filters. 1) On the story page, in the top bar portal options, add another button to the \"filter\" button. This button will toggle \"hide filtered scenes\" and \"minify filtered scenes\". The quoted text should be in a tooltip. For hide, use the mdi/eye-remove icon. For the minify button, use mdi/eye-minus icon. 2) In the PlotGrid, we need to apply filters to the scenes shown. If the mode is hide, then the scene card should just be a small line with a hidden icon on it. If the mode is minify, then only the title should be shown. 3) In the story list, if the mode is \"hide\" then filter excluded scenes shouldn't be rendered at all. Maybe with just an hr line and small text \"filter hidden\". If the mode is \"Minify\" then just show the title in smaller text, and a UI indication that the scene isn't included in the filtered results."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Toggle visibility modes (Priority: P1)

As a writer reviewing filtered results, I can toggle how excluded scenes are displayed so the view stays readable without losing awareness of hidden content.

**Why this priority**: It controls the primary interaction for the feature and directly impacts how users interpret filtered results.

**Independent Test**: Can be fully tested by toggling the mode and confirming the UI state changes persist within the session.

**Acceptance Scenarios**:

1. **Given** filters are active, **When** I toggle the visibility control, **Then** the mode switches between Hide and Minify and the control reflects the active mode.
2. **Given** filters are active, **When** I hover the control, **Then** I can read the tooltip text that explains the mode.

---

### User Story 2 - Plot grid respects visibility mode (Priority: P1)

As a writer using the plot grid, I can see excluded scenes represented consistently based on the selected visibility mode.

**Why this priority**: The plot grid is the primary planning view and must reflect filter intent correctly.

**Independent Test**: Can be fully tested by toggling modes and verifying the scene card presentation for excluded scenes.

**Acceptance Scenarios**:

1. **Given** a scene is excluded by the filters, **When** mode is Hide, **Then** the scene is shown as a minimal line with a hidden indicator.
2. **Given** a scene is excluded by the filters, **When** mode is Minify, **Then** the scene shows only the title with a clear indication it is excluded.

---

### User Story 3 - Story list respects visibility mode (Priority: P2)

As a writer scanning the story list, I can either omit excluded scenes or see them minimized depending on the active mode.

**Why this priority**: The list view supports quick scanning and must match the filtering behavior without cluttering the list.

**Independent Test**: Can be fully tested by changing modes and verifying list items for excluded scenes.

**Acceptance Scenarios**:

1. **Given** mode is Hide, **When** a scene is excluded, **Then** it is not rendered as a full list item and a minimal placeholder text may appear instead.
2. **Given** mode is Minify, **When** a scene is excluded, **Then** it appears as a reduced text entry with an excluded indicator.

### Edge Cases

- What happens when all scenes are excluded by filters?
- How does the UI behave when filters are cleared while a visibility mode is set?
- What happens when there are no excluded scenes but the mode is set to Hide or Minify?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a visibility toggle adjacent to the filter control that switches between Hide and Minify modes.
- **FR-002**: System MUST display a tooltip that clearly states the meaning of the current visibility mode.
- **FR-003**: System MUST represent excluded scenes in the plot grid according to the active mode (Hide shows minimal line with hidden indicator; Minify shows title only with excluded indicator).
- **FR-004**: System MUST represent excluded scenes in the story list according to the active mode (Hide omits full list item and may show a minimal placeholder; Minify shows title-only entry with excluded indicator).
- **FR-005**: System MUST apply the selected visibility mode consistently across the plot grid and story list while filters remain active.
- **FR-006**: System MUST preserve the visibility mode selection during the current session when users navigate within the story page.

### Key Entities _(include if feature involves data)_

- **Filter Visibility Mode**: The user's selected display mode for excluded scenes (Hide or Minify).
- **Excluded Scene**: A scene that does not match the active filters and is subject to visibility mode rules.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can toggle between Hide and Minify within 2 seconds without leaving the story page.
- **SC-002**: 95% of excluded scenes in the plot grid match the active visibility mode on first render after a toggle.
- **SC-003**: 95% of excluded scenes in the story list match the active visibility mode on first render after a toggle.
- **SC-004**: At least 90% of users report that they can understand whether a scene is excluded when Minify mode is active.

## Assumptions

- The visibility mode applies only when filters are active; when no filters are set, scenes render normally.
- The toggle cycles between two states (Hide and Minify) without a third "off" state.
- The minimal placeholder for Hide mode in the story list is acceptable as a single line with short text.
