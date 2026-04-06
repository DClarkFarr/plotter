# Feature Specification: Docx AST Conversion

**Feature Branch**: `027-docx-ast-conversion`  
**Created**: 2026-04-06  
**Status**: Draft  
**Input**: User description: "Convert an uploaded docx into a parseable document tree and map it into the story data model with acts, chapters, scenes, tags, and characters."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Import a docx into story structure (Priority: P1)

As a story editor, I want an uploaded docx to be converted into a structured story format so I can work with acts, chapters, scenes, tags, and characters without manual re-entry.

**Why this priority**: This enables the core value of the import flow and unlocks all downstream story tooling.

**Independent Test**: Can be fully tested by importing a conforming docx and verifying that all story elements are created and ordered correctly.

**Acceptance Scenarios**:

1. **Given** a conforming docx, **When** I run the import, **Then** I get a structured story with acts, chapters, scenes, tags, and characters populated.
2. **Given** a conforming docx with multiple acts and chapters, **When** I run the import, **Then** the structure preserves the intended hierarchy and order.

---

### User Story 2 - Understand and resolve import issues (Priority: P2)

As a story editor, I want clear import feedback so I can fix formatting issues and re-import successfully.

**Why this priority**: Imports will fail without visible diagnostics, blocking adoption.

**Independent Test**: Can be tested by importing a malformed docx and verifying that actionable issues are reported.

**Acceptance Scenarios**:

1. **Given** a docx missing required structure, **When** I run the import, **Then** I see a list of issues that identifies what must be corrected.

---

### User Story 3 - Preserve tags and character references (Priority: P3)

As a story editor, I want tags and character references in the docx to be represented in the resulting story so I do not lose metadata.

**Why this priority**: Metadata is critical for filtering and organization after import.

**Independent Test**: Can be tested by importing a docx with known tag and character references and verifying their presence in the output structure.

**Acceptance Scenarios**:

1. **Given** a docx that includes tag and character references, **When** I run the import, **Then** tags and characters are created and linked to the correct scenes.

---

### Edge Cases

- What happens when the docx is empty or contains no recognizable story structure?
- How does the system handle duplicate tags or characters that differ only by case or spacing?
- What happens when a scene appears outside an act or chapter?
- How does the system handle inline references to unknown tags or characters?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST parse an uploaded docx into an internal document tree representation.
- **FR-002**: System MUST convert the document tree into a story structure consisting of acts, chapters, scenes, tags, and characters.
- **FR-003**: System MUST create acts and chapters in the story structure when they are represented in the docx.
- **FR-004**: System MUST preserve the ordering of acts, chapters, and scenes as represented in the docx.
- **FR-005**: System MUST link tags and characters to the scenes where they are referenced.
- **FR-006**: System MUST report import issues with enough detail for a user to correct the docx and retry.
- **FR-007**: System MUST reject or flag documents that do not meet the minimum required structure for a story import.
- **FR-008**: System MUST produce a single, consistent import result for the same input file.
- **FR-009**: System MUST store the converted story structure in a format equivalent to the existing story collection model.
- **FR-010**: System MUST define how headings or markers in the docx map to acts, chapters, and scenes. H1 = act, h2 = chapter, h4 = scene, paragraphs are basic text content.
- **FR-011**: System MUST define how tag and character references are recognized in the docx. Characters are parsed from the H4 text. Format is `CharacterName`:{...resetOfTitle}. The syntax for a tag without a variant in the "rest of title" is `[tag]`. The syntax for a tag with a variant is `[tag:variant]`. The highlight color of the tag in the document should also be captured and preserved.

### Key Entities _(include if feature involves data)_

- **Document Node**: A unit of the parsed document tree with text content, type, and ordering.
- **Import Result**: The outcome of a docx conversion, including created story elements and any issues.
- **Act**: A top-level structural grouping in the story that contains chapters.
- **Chapter**: A mid-level structural grouping that contains scenes.
- **Scene**: A narrative unit with content and metadata such as tags and characters.
- **Tag**: A reusable label associated with scenes.
- **Character**: A reusable entity referenced by scenes.
- **Import Issue**: A validation or parsing problem that blocks or degrades import.

### Assumptions

- Uploaded docx files follow a consistent, documented formatting convention.
- The import uses the latest uploaded version of the file.
- The story data model for acts, chapters, scenes, tags, and characters already exists and can accept imported data.

### Dependencies

- A user-facing flow exists to upload docx files before import.
- The story management system can accept imported acts, chapters, scenes, tags, and characters.
- Users have access to guidance on the docx formatting convention.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A conforming docx up to 200 pages imports into a structured story in under 2 minutes.
- **SC-002**: At least 95% of conforming docx files import without manual correction.
- **SC-003**: At least 90% of users can complete an import on the first attempt without support.
- **SC-004**: Import issues are reported with enough detail that a user can resolve them without developer assistance in 80% of cases.
