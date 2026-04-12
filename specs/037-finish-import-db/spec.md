# Feature Specification: Finish Import — Database Creation

**Feature Branch**: `037-finish-import-db`  
**Created**: April 11, 2026  
**Status**: Draft  
**Input**: User description: "Now that chapters and acts are implemented in the sections, we're ready to finish the import, creating all the database things."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Approve and persist a full story import (Priority: P1)

As a writer, I want to approve the outline preview from an imported document so that all acts, chapters, scenes, tags, and characters are saved to the database.

**Why this priority**: This is the core deliverable of the import feature. Without persisting the parsed data, the import flow has no effect.

**Independent Test**: Can be fully tested by uploading a conforming document, approving the preview, and then verifying all expected records exist in the story's collections.

**Acceptance Scenarios**:

1. **Given** a valid parsed outline is previewed in the import modal, **When** the user approves, **Then** a new story is created along with all acts, chapters, scenes, sections, tags, and characters derived from the document.
2. **Given** the import completes successfully, **When** the user views the story, **Then** the story's structure matches the approved outline hierarchy.
3. **Given** the import completes successfully, **When** the user navigates to the newly created story, **Then** acts, chapters, and scenes are all accessible and correctly ordered.

---

### User Story 2 - Characters and tags are created and linked to scenes (Priority: P2)

As a writer, I want characters and tags from the document to be created and linked to their corresponding scenes so I don't have to manually re-enter them.

**Why this priority**: Character POV and tag metadata are key to the app's filtering and organization features and must flow in from the import without manual steps.

**Independent Test**: Can be fully tested by importing a document with known character and tag references and verifying they are created and linked to the correct scenes.

**Acceptance Scenarios**:

1. **Given** a document with character POV syntax on scene headings, **When** the import is approved, **Then** character records are created (or matched to existing ones) and linked to the appropriate scenes.
2. **Given** a document with tag syntax in scene headings, **When** the import is approved, **Then** tag records are created (or matched) and linked to the appropriate scenes with the correct variant if present.
3. **Given** a document with highlight color on a tag reference, **When** the import is approved, **Then** the tag's color is preserved on the created record.

---

### User Story 3 - Sections from indented paragraphs are persisted (Priority: P3)

As a writer, I want indented paragraph groups in the document to become section records so the narrative structure I defined is reflected in the database.

**Why this priority**: Sections represent fine-grained structure within chapters and acts. They must be persisted for the import to be structurally complete.

**Independent Test**: Can be fully tested by importing a document with indented paragraphs and verifying the resulting section records.

**Acceptance Scenarios**:

1. **Given** a document with indented paragraph groups under a heading, **When** the import is approved, **Then** section records are created and linked to the parent chapter or act.
2. **Given** multiple indented groups at different positions, **When** the import is approved, **Then** each group becomes a distinct section with the correct vertical index.

---

### User Story 4 - Import failure is handled gracefully (Priority: P4)

As a writer, I want to be informed if the import fails partway through so I can retry without ending up with partial data.

**Why this priority**: Partial data in the database would corrupt the story's structure and is harder to clean up than a clean failure.

**Independent Test**: Can be tested by simulating a failure mid-import and verifying no partial records remain.

**Acceptance Scenarios**:

1. **Given** a failure occurs during database creation, **When** the import is rolled back, **Then** no partial records for the new story exist in any collection.
2. **Given** an import failure, **When** the user is notified, **Then** they can retry by re-uploading or re-approving without any leftover state blocking them.

---

### Edge Cases

- A document references a character that already exists in the database for this story — the existing character is reused, not duplicated.
- A document references a tag that already exists — the existing tag is reused, not duplicated.
- A scene appears without a parent act or chapter — it is placed under a default act.
- A document produces no parseable scenes — the import is rejected and no story record is created.
- Two scenes in the document have identical titles — both are created as distinct records with unique indices.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a new story record as the container for all imported content upon approval.
- **FR-002**: System MUST create act records and link them to the story, preserving document order.
- **FR-003**: System MUST create chapter records nested within the correct act and linked to the story, preserving document order.
- **FR-004**: System MUST create scene records linked to the correct chapter (and act), with ordered vertical indices.
- **FR-005**: System MUST create section records for groups of indented paragraphs and link them to the correct parent act or chapter with the correct vertical index.
- **FR-006**: System MUST create character records for each unique character POV extracted from scene headings, or reuse an existing character with the same name if one already exists in the story.
- **FR-007**: System MUST link each character to the scene where they are referenced.
- **FR-008**: System MUST create tag records for each unique tag reference, or reuse an existing tag with the same name if one exists.
- **FR-009**: System MUST link each tag (and variant if present) to the correct scene.
- **FR-010**: System MUST preserve the highlight color of a tag reference from the document on the created tag record.
- **FR-011**: System MUST execute all database creation within a single atomic operation so that a failure results in no partial data being persisted.
- **FR-012**: System MUST reject the import and create no records if the parsed outline contains no valid scenes.
- **FR-013**: System MUST notify the user of a successful import and provide a way to navigate to the newly created story.
- **FR-014**: System MUST notify the user if the import fails and allow them to retry without leaving partial data.

### Key Entities *(include if feature involves data)*

- **Story**: The top-level container created from the import; linked to all imported structure and metadata.
- **Act**: A top-level narrative division from H1 headings, linked to the story with a vertical index.
- **Chapter**: A narrative subdivision from H2 headings, linked to an act and to the story with a vertical index.
- **Scene**: An individual narrative unit from H4 headings, linked to a chapter and carrying character and tag associations.
- **Section**: A structural grouping record (type: act or section) created from indented paragraph groups, linked to a chapter or act with a vertical index.
- **Character**: An actor referenced in scene headings via POV syntax; linked to one or more scenes.
- **Tag**: A metadata label referenced in scene headings via bracket syntax, optionally with a variant and color; linked to one or more scenes.

## Scope

### In Scope

- Creating all database records (story, acts, chapters, scenes, sections, characters, tags) from an approved import.
- Reusing existing character and tag records when names match within the same story.
- Atomic persistence: all records created or none (rollback on failure).
- Preserving ordering (vertical indices) for all ordered entities.
- Tag variant and highlight color preservation.
- User notification on success (with navigation) and on failure (with retry option).

### Out of Scope

- Editing or updating existing stories via import (import always creates a new story).
- Paragraph body content storage beyond section grouping.
- Importing documents into an existing story.

## Assumptions

- The document parsing and AST conversion (feature 027) and section type model (feature 028) are complete and available.
- The import modal preview flow (feature 026) is complete; this feature only handles what happens after the user approves.
- Character names are matched case-insensitively when checking for duplicates within the same story.
- Tag names are matched case-insensitively when checking for duplicates within the same story.
- A scene without an explicit act parent is placed under a default unnamed act rather than rejected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After approving an import, 100% of acts, chapters, scenes, sections, characters, and tags from the document appear as database records linked to the new story.
- **SC-002**: The entire import creation completes in under 10 seconds for documents with up to 50 scenes.
- **SC-003**: A failed import leaves zero partial records in any collection.
- **SC-004**: Users can navigate to the newly created story immediately after a successful import confirmation.
- **SC-005**: Duplicate character and tag names within the same story are never created; existing records are reused.
