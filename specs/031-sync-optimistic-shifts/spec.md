# Feature Specification: Sync Optimistic Shift Logic

**Feature Branch**: `031-sync-optimistic-shifts`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "The logic for #sym:getMoveRangeShift has changed. Please check the implementation of optimistic updates for mutations and cell shifting to make sure it has the same logic.

These mutations include:

1. Creating a scene
2. Deleting a scene
3. Moving a scene
4. Creating, Deleting, Moving sections - if implemented"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Accurate row shifting while moving scenes (Priority: P1)

As a writer rearranging scenes, I see the grid shift in a way that matches the final saved layout, so I can trust the grid while I drag and drop.

**Why this priority**: Moving scenes is a core workflow and incorrect shifts create immediate confusion or data loss fear.

**Independent Test**: Can be fully tested by moving a scene within a story and verifying the grid layout before and after save remains consistent.

**Acceptance Scenarios**:

1. **Given** a story grid with occupied rows, **When** I move a scene to another row, **Then** the grid shifts immediately to the same positions that appear after the move completes.
2. **Given** a scene moved to a row that already has content, **When** the move occurs, **Then** the grid clears the destination row using the same shifting outcome as the final saved state.

---

### User Story 2 - Reliable shifts for scene creation and deletion (Priority: P2)

As a writer adding or removing scenes, I see the grid update instantly and correctly, so I can continue editing without waiting or second-guessing.

**Why this priority**: Creation and deletion are frequent actions and must not leave the grid in an inconsistent state.

**Independent Test**: Can be fully tested by creating a scene and deleting a scene in occupied rows and confirming the layout matches the final saved grid each time.

**Acceptance Scenarios**:

1. **Given** a partially filled grid, **When** I create a scene in an occupied row, **Then** the grid shifts to make space in a way that matches the final saved layout.
2. **Given** a row that becomes empty after a scene deletion, **When** the deletion completes, **Then** the grid shifts to close the gap exactly as the final saved layout shows.

---

### User Story 3 - Consistent shifts for section actions (Priority: P3)

As a writer managing sections, I see section-related shifts behave the same way as scenes, so the grid remains predictable across content types.

**Why this priority**: Section moves can affect many rows; consistency prevents layout surprises.

**Independent Test**: Can be fully tested by creating, moving, and deleting sections and confirming the grid layout matches the final saved state.

**Acceptance Scenarios**:

1. **Given** a section is moved to a row with existing content, **When** the move occurs, **Then** the grid shifts to match the final saved layout.

---

### Edge Cases

- Moving a scene to the same row but a different plot within the same story.
- Moving a scene to a row that has a section but no scene in the target plot.
- Deleting a scene from a row that also contains a section.
- Moving a section to a row that already has a section.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST update the grid immediately after create, delete, or move actions so the layout matches the final saved layout for the same action.
- **FR-002**: The system MUST apply a single, consistent set of row-shift outcomes across scene creation, deletion, and movement.
- **FR-003**: The system MUST apply the same row-shift outcomes for section create, delete, and move actions when those actions are available.
- **FR-004**: The system MUST avoid temporary duplicate or overlapping content in the same grid row during immediate updates.
- **FR-005**: The system MUST preserve the order of unaffected rows during immediate updates.
- **FR-006**: The system MUST apply the same row-shift outcomes when moving between plots within the same story as when moving within a single plot.

### Key Entities _(include if feature involves data)_

- **Story**: A container that groups plots and their grid rows.
- **Plot**: A column or track within a story that holds scenes on specific rows.
- **Scene**: A unit of content placed on a plot at a specific row.
- **Section**: A story-level divider that occupies a row across plots.
- **Grid Row**: A vertical position used to align scenes and sections.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In QA validation of at least 30 actions per mutation type, 100% of immediate grid updates match the final saved layout.
- **SC-002**: At least 99% of user actions show the final layout within 2 seconds of the action completing.
- **SC-003**: Zero occurrences of duplicate or overlapping items in a grid row are observed during acceptance testing.
- **SC-004**: At least 90% of usability test participants report the grid behavior as predictable during create, delete, and move actions.

## Assumptions

- All plot moves in scope occur within a single story.
- Section create, delete, and move actions are available or can be enabled for testing.
- The expected row-shift outcomes are already defined by existing business rules.

## Out of Scope

- Redefining or changing the underlying shift rules themselves.
- New UI controls unrelated to create, delete, or move workflows.
