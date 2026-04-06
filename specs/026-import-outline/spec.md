# Feature Specification: Import Outline Modal

**Feature Branch**: `026-import-outline`  
**Created**: 2026-04-06  
**Status**: Draft  
**Input**: User description: "Time to add imports to this app. 1) On the dashboard page, the user should be able to click \"an import\" button. The import button should be in / near the create story button. 2) This should open the import outline modal. This modal should contain text with instructions for uploading .docx documents. H1s will be act separators. H2 will be chapter breaks. And h4 will be scenes. As well as syntax for character pov syntax and tag syntax. If the paragraph/section has a left indent, that group of paragraphs will become a section. 3) After uploading a docx file, the modal should return an outline summary of what will be created. Then the user approves and the import happens."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Start an outline import (Priority: P1)

As a writer, I can open an import flow from the dashboard so I can bring a document outline into the app.

**Why this priority**: This is the entry point for the entire feature and enables document-based story setup.

**Independent Test**: Can be fully tested by opening the dashboard, clicking the import button, and seeing the import modal.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I click the import button near create story, **Then** the import outline modal opens.
2. **Given** the modal is open, **When** I close it, **Then** I return to the dashboard without changes.

---

### User Story 2 - Understand document formatting rules (Priority: P2)

As a writer, I can read clear formatting instructions so I can prepare a document that imports correctly.

**Why this priority**: Clear guidance reduces failed imports and rework.

**Independent Test**: Can be fully tested by opening the modal and verifying the instructional content is present.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** I view the instructions, **Then** I see how headings and indentation map to acts, chapters, scenes, and sections.
2. **Given** the modal is open, **When** I view the instructions, **Then** I see examples of character POV syntax and tag syntax.

---

### User Story 3 - Preview and approve an import (Priority: P3)

As a writer, I can upload a .docx file, review an outline summary, and approve the import so I know what will be created.

**Why this priority**: A preview step builds trust and prevents unintended data creation.

**Independent Test**: Can be fully tested by uploading a sample .docx, viewing a summary, and confirming the import.

**Acceptance Scenarios**:

1. **Given** a valid .docx file, **When** I upload it, **Then** I see an outline summary of the acts, chapters, scenes, and sections that will be created.
2. **Given** the summary is visible, **When** I approve the import, **Then** the outline is created and the modal confirms completion.
3. **Given** the summary is visible, **When** I cancel, **Then** no new content is created.

### Edge Cases

- Uploading a non-.docx file shows a clear error and no preview is generated.
- A .docx with missing headings still produces a summary that explains what could and could not be interpreted.
- Indented paragraphs without a parent heading are grouped as sections under the nearest valid heading.
- Very large outlines provide a summary without blocking the user from canceling.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The dashboard MUST provide an import button placed near the create story control.
- **FR-002**: Selecting the import button MUST open an import outline modal.
- **FR-003**: The modal MUST include instructions for .docx uploads and describe heading-to-outline mapping: H1 as acts, H2 as chapters, and H4 as scenes.
- **FR-004**: The modal MUST explain that left-indented paragraph groups are interpreted as sections.
- **FR-005**: The modal MUST include examples of character POV syntax and tag syntax used by the app.
- **FR-006**: Users MUST be able to upload a .docx file from the modal.
- **FR-007**: After upload, the system MUST present an outline summary of items that will be created before any creation occurs.
- **FR-008**: Users MUST be able to approve or cancel the import from the summary view.
- **FR-009**: If a user cancels, the system MUST ensure no new outline content is created.
- **FR-010**: If the upload is invalid or cannot be parsed, the system MUST display a user-friendly error and allow retry.

### Key Entities _(include if feature involves data)_

- **Import Instruction Set**: The instructional content shown in the modal that explains formatting rules and syntax.
- **Import Upload**: The user-provided .docx file submitted for processing.
- **Parsed Outline Summary**: The structured preview of acts, chapters, scenes, sections, POV markers, and tags that would be created.
- **Import Decision**: The user approval or cancellation action tied to the summary.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users who open the modal can locate and read the formatting instructions without leaving the flow.
- **SC-002**: 90% of valid .docx uploads generate a preview summary without user retries.
- **SC-003**: 100% of imports require explicit user approval before any content is created.
- **SC-004**: Users can complete the upload-and-approve flow in under 3 minutes for a typical outline document.

## Assumptions

- The app already has defined POV and tag syntax that can be presented as examples in the modal.
- A "typical outline document" is a document with fewer than 200 scenes.

## Out of Scope

- Importing from non-.docx formats.
- Editing or reordering the parsed outline within the preview.
