# Feature Specification: Sections Collection

**Feature Branch**: `028-sections-collection`  
**Created**: April 10, 2026  
**Status**: Draft  
**Input**: User description: "Let's add a new database collection called \"sections\". Sections will have a title, a vertical index, a story Id with a story > has many > collection relationship. Sections will have a type of either 'act' or 'section'."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Define sections for a story (Priority: P1)

As a story creator, I want to define sections for a story so I can organize the narrative structure.

**Why this priority**: Without section records, the story cannot be structured into acts or sections, which blocks downstream workflows.

**Independent Test**: Can be fully tested by creating a story and adding section records to it, then verifying they are stored and linked.

**Acceptance Scenarios**:

1. **Given** a story exists, **When** I add a section with a title, vertical index, and type, **Then** the section is stored and linked to the story.
2. **Given** a story exists, **When** I request the story's sections, **Then** I receive all sections linked to that story.

---

### User Story 2 - Order sections within a story (Priority: P2)

As a story creator, I want sections to have a vertical index so their order is preserved.

**Why this priority**: Consistent ordering is essential for reliable navigation and display of story structure.

**Independent Test**: Can be fully tested by adding multiple sections with different vertical indices and confirming their order when listed.

**Acceptance Scenarios**:

1. **Given** multiple sections are linked to a story, **When** I list them, **Then** they are returned in ascending vertical index order.

---

### User Story 3 - Differentiate section types (Priority: P3)

As a story creator, I want each section to be marked as an act or section so I can distinguish high-level structure from finer breakdowns.

**Why this priority**: Type is required to support workflows that treat acts differently from regular sections.

**Independent Test**: Can be fully tested by creating sections of both types and verifying the stored type value.

**Acceptance Scenarios**:

1. **Given** a story exists, **When** I create a section with type set to act or section, **Then** the section is saved with that exact type value.

### Edge Cases

- What happens when a section is created without a title?
- How does the system handle a section type outside the allowed values?
- What happens when a section is created without a valid story reference?
- How does the system handle duplicate vertical indices within the same story?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST store a section with a title, vertical index, type, and story reference.
- **FR-002**: System MUST restrict section type values to act or section.
- **FR-003**: System MUST associate each section with exactly one story.
- **FR-004**: System MUST allow listing sections for a given story.
- **FR-005**: System MUST return sections for a story in ascending vertical index order.
- **FR-006**: System MUST reject creating a section that references a non-existent story.

### Key Entities _(include if feature involves data)_

- **Story**: Narrative container that can have many sections.
- **Section**: Story subdivision with title, vertical index, type, and a required link to one story.

## Scope

### In Scope

- Create and store sections with required fields.
- Link sections to a single story and list them by story.
- Enforce allowed section types and ordering by vertical index.

### Out of Scope

- UI changes or presentation of sections beyond ordering.
- Bulk import/export of sections.
- Automated generation of sections from other content.

## Dependencies

- An existing story record must exist before a section can be created.

## Assumptions

- Vertical index is an integer used only for ordering within a story.
- Vertical index values are unique per story.
- Section titles are required and non-empty.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of created sections are linked to an existing story.
- **SC-002**: 100% of stored sections have a type value of act or section.
- **SC-003**: Users can create a section and see it listed under a story in under 1 minute.
- **SC-004**: For any story with 5 or more sections, the displayed order matches ascending vertical index in 100% of checks.
