# Feature Specification: Import Name Standardization

**Feature Branch**: `049-normalize-import-names`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "as a user, i should be able to import documents with standardized tag and character names that have uppercased words"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Import with standardized names (Priority: P1)

As a writer importing a document, I want tag and character names normalized into one standard format so I do not get duplicate entries caused only by differences in letter case.

**Why this priority**: Import accuracy directly affects story data integrity and prevents manual cleanup of duplicated tags/characters.

**Independent Test**: Can be fully tested by importing a document containing the same names in uppercase, lowercase, and mixed case, then confirming only one standardized name is created per unique name.

**Acceptance Scenarios**:

1. **Given** an import file contains "JOHN DOE", "John Doe", and "john doe" as character names, **When** the user imports the file, **Then** the system stores a single standardized character name and maps all references to it.
2. **Given** an import file contains "BATTLE", "battle", and "Battle" as tag names, **When** the user imports the file, **Then** the system stores a single standardized tag name and maps all references to it.

---

### User Story 2 - Predictable import results (Priority: P2)

As a writer, I want imported names to be standardized consistently every time so that repeated imports do not create new case-variant duplicates.

**Why this priority**: Consistency across imports prevents data drift and keeps filtering and grouping behavior predictable.

**Independent Test**: Can be fully tested by running two separate imports with case-variant names and confirming that the second import reuses existing standardized names.

**Acceptance Scenarios**:

1. **Given** standardized names already exist from a prior import, **When** a new import contains equivalent names in different casing, **Then** no additional duplicate names are created.

---

### User Story 3 - Visibility into normalization outcomes (Priority: P3)

As a writer, I want clear feedback when names are standardized during import so I understand how the system interpreted my source document.

**Why this priority**: Transparent outcomes reduce confusion and improve trust in automated import processing.

**Independent Test**: Can be fully tested by importing a document with case variations and confirming the import result shows which raw names were consolidated into standardized names.

**Acceptance Scenarios**:

1. **Given** case-variant names are present in an import document, **When** import processing completes, **Then** the user can review which input names were standardized into final stored names.

### Edge Cases

- A name appears with extra leading/trailing whitespace plus uppercase words (for example, " JOHN DOE ").
- A name contains acronyms or initialisms (for example, "FBI Agent" or "NASA Liaison") and should remain readable after standardization.
- Two different names become visually similar after standardization but are not actually the same entity (for example, "Ann A" and "Anna").
- The import includes non-letter characters mixed with uppercase words (hyphens, apostrophes, numerals).
- The import file has no tags or no characters; import still completes without normalization errors.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST normalize imported character names to a single standard naming format before persisting imported records.
- **FR-002**: System MUST normalize imported tag names to a single standard naming format before persisting imported records.
- **FR-003**: System MUST treat case-only differences in imported names as equivalent during matching and deduplication.
- **FR-004**: System MUST map all imported references for equivalent case-variant names to one standardized stored name.
- **FR-005**: System MUST avoid creating a new name record when an equivalent standardized name already exists.
- **FR-006**: System MUST preserve user-readable formatting in the resulting standardized names.
- **FR-007**: System MUST provide import outcome feedback that indicates when multiple input name variants were consolidated.
- **FR-008**: Users MUST be able to complete import successfully when the source file contains uppercase words in tag and character names.

### Key Entities _(include if feature involves data)_

- **Imported Name Token**: A raw tag or character name extracted from an import document, including original casing and spacing.
- **Standardized Name**: The canonical stored representation used for matching and display after normalization.
- **Name Consolidation Mapping**: A record of which imported raw names were merged into each standardized name during an import operation.
- **Import Result Summary**: User-visible output describing counts of created, matched, and consolidated names.

### Assumptions

- Name standardization applies only to names identified as tags or characters during import processing.
- Equivalent names are determined case-insensitively after trimming leading/trailing whitespace.
- Existing names in the target story are eligible for reuse if they match the standardized value.
- Users are not required to manually review each normalization decision for import completion.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In validation imports containing only case-variant duplicates, 100% of equivalent tag and character names are consolidated into one stored name per unique value.
- **SC-002**: At least 95% of test users can import a document containing uppercase tag/character names without needing manual name cleanup afterward.
- **SC-003**: Re-importing the same document with case variations results in zero additional case-variant duplicate names in stored data.
- **SC-004**: Import completion feedback clearly reports consolidation outcomes for 100% of imports where case-variant names are detected.
