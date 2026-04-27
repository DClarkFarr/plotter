# Feature Specification: Change Scene Plot Without Dragging

**Feature Branch**: `053-change-scene-plot`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "As a user, I should be able to change a scene's plot without dragging and dropping it from scene actions and from the scene form, with the same optimistic behavior and collision shifting rules."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Change Plot From Scene Actions (Priority: P1)

As a writer working in the story grid, I can move a scene to a different plot from the scene's action controls without dragging, so I can quickly reorganize scenes with fewer gestures.

**Why this priority**: This is the fastest in-context action for most grid editing workflows and directly replaces drag/drop for frequent moves.

**Independent Test**: Can be fully tested by opening a scene's action controls, selecting Change Plot, choosing a target plot, and verifying immediate visual reposition plus persisted update after reload.

**Acceptance Scenarios**:

1. **Given** a scene is visible in the grid with available action controls, **When** the user opens actions and selects Change Plot, **Then** the system shows a selectable list of all plots in the story.
2. **Given** the Change Plot list is open, **When** the user selects a different plot, **Then** the scene appears in the new plot immediately and the change is persisted.
3. **Given** the user selects the scene's current plot, **When** the action is submitted, **Then** no duplicate move occurs and the user sees a stable unchanged result.

---

### User Story 2 - Change Plot From Scene Form (Priority: P2)

As a writer editing scene details in the sidebar, I can choose a plot from a selector near the top of the form so that plot assignment can be changed while editing scene metadata.

**Why this priority**: This supports users who primarily edit through forms and need plot changes in the same context as other scene attributes.

**Independent Test**: Can be fully tested by opening a scene in the sidebar, changing the plot using the new selector above the scene title, and verifying immediate grid update plus persisted update after refresh.

**Acceptance Scenarios**:

1. **Given** a scene form is open in the sidebar, **When** the user views the top of the form, **Then** a plot selector is available above the scene title.
2. **Given** the user changes plot in the scene form selector, **When** the selection is confirmed, **Then** the scene moves to the selected plot immediately and the same persistence behavior used elsewhere is applied.

---

### User Story 3 - Preserve Grid Ordering During Target Collisions (Priority: P3)

As a writer moving scenes between plots, I need existing scenes in the target plot to shift down when needed so no scene is overwritten and ordering remains predictable.

**Why this priority**: Correct collision behavior protects data integrity and keeps the grid understandable during non-drag moves.

**Independent Test**: Can be fully tested by moving a scene to a plot/vertical position already occupied and confirming the target plot shifts existing scenes down from that vertical index while preserving all scenes.

**Acceptance Scenarios**:

1. **Given** a scene is moved to a target plot and the same vertical position is occupied, **When** the move is applied, **Then** existing scenes at that position and below shift down to create space and no scene is lost.
2. **Given** a scene is moved to a target plot where that vertical position is empty, **When** the move is applied, **Then** the scene is placed without shifting unrelated scenes.

### Edge Cases

- Target plot list is empty or unavailable when the user opens Change Plot.
- User triggers multiple plot changes for the same scene before the previous update completes.
- Persisted update fails after optimistic move and the UI must return to the last confirmed state.
- Scene is deleted or no longer accessible before the user confirms a new plot selection.
- Moving to an occupied vertical index causes a multi-row cascade in dense plots.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a Change Plot action in each scene's action controls.
- **FR-002**: System MUST present all available plots for the current story when Change Plot is opened.
- **FR-003**: System MUST allow selecting a target plot from scene actions and apply the same scene-move workflow used by drag/drop moves.
- **FR-004**: System MUST provide a plot selector in the scene form sidebar positioned above the scene title.
- **FR-005**: System MUST apply the same scene-move workflow when plot is changed from the scene form selector.
- **FR-006**: System MUST update the grid optimistically when a plot change is submitted from either entry point.
- **FR-007**: System MUST persist the plot change to the server after optimistic update.
- **FR-008**: System MUST reconcile optimistic state with the persisted result and rollback to the prior confirmed state if persistence fails.
- **FR-009**: System MUST, when moving to an occupied vertical index in the target plot, shift existing scenes down from that index to create space for the moved scene.
- **FR-010**: System MUST preserve relative order of shifted scenes during collision handling.
- **FR-011**: System MUST avoid duplicate or no-op moves when the selected target plot is the same as the scene's current plot.
- **FR-012**: System MUST keep behavior consistent regardless of whether the change was initiated from scene actions or scene form.

### Key Entities _(include if feature involves data)_

- **Scene**: A story unit displayed in the grid and editable in the sidebar; includes identifiers, assigned plot, and vertical position.
- **Plot**: A lane/category within a story that can contain multiple scenes ordered by vertical position.
- **Scene Plot Move Request**: A user-initiated change describing source scene, destination plot, and intended vertical index.
- **Grid Position Conflict**: A condition where destination plot already has a scene at the target vertical index and requires downward shift handling.

### Assumptions

- The system already supports drag/drop scene moves with optimistic and persisted update behavior that can be reused.
- Plot selection options are scoped to the current story context.
- Users can only move scenes they are authorized to edit.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In usability validation, at least 90% of users can move a scene to a different plot from scene actions in under 10 seconds without guidance.
- **SC-002**: In usability validation, at least 90% of users can move a scene to a different plot from the scene form selector in under 15 seconds without guidance.
- **SC-003**: In test runs covering occupied-target scenarios, 100% of moves preserve all existing scenes and create space by shifting from the target vertical index.
- **SC-004**: Across all plot-change attempts from both entry points, at least 99% of successful submissions show the moved scene in the correct final plot after persistence completes.
