# Feature Specification: Import Outline Versions

**Feature Branch**: `046-import-outline-versions`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Let's add import versions. When importing an outline, users can select legacy or current format. Instructions and examples update by selected type. Legacy remains current parsing behavior. Current version must accept exported documents without data loss."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Select Import Version Before Upload (Priority: P1)

As a writer importing an outline, I can choose the outline format version before reading instructions or uploading a file so I can follow the correct format from the start.

**Why this priority**: Correct version selection is the entry point for the entire import flow and prevents avoidable import failures.

**Independent Test**: Open the import modal and verify version selection is visible above instructions, with a default selection and immediate guidance updates when changed.

**Acceptance Scenarios**:

1. **Given** the outline import modal is opened, **When** the modal loads, **Then** a version selector is displayed at the top above instructional content.
2. **Given** the user changes the selected version, **When** the selection changes, **Then** all version-specific guidance in the modal updates to match the selected version.

---

### User Story 2 - Import Legacy Outline Format (Priority: P2)

As a writer with older outline documents, I can select legacy format and import successfully using the same rules currently supported.

**Why this priority**: Backward compatibility protects existing user workflows and prevents regressions for current imports.

**Independent Test**: Select legacy version, import a document that matches current expected outline format, and verify parsed content matches current behavior.

**Acceptance Scenarios**:

1. **Given** legacy version is selected, **When** a valid legacy outline is imported, **Then** the import is accepted and parsed according to existing legacy expectations.
2. **Given** legacy version is selected, **When** the user views examples, **Then** examples reflect legacy formatting rules for each parsed item type.

---

### User Story 3 - Import Modern Exported Outline Without Loss (Priority: P3)

As a writer who exports and later re-imports an outline, I can choose current format and preserve all supported content so export-to-import round trips are reliable.

**Why this priority**: Reliable round-tripping reduces user friction and builds trust in export/import workflows.

**Independent Test**: Export a document, select current version, import the same document, and verify that all supported outline content is preserved.

**Acceptance Scenarios**:

1. **Given** current version is selected, **When** a document produced by the current export flow is imported, **Then** all supported imported content is preserved without loss.
2. **Given** current version is selected, **When** the user views examples, **Then** examples match current exported outline structure for each parsed item type.

### Edge Cases

- User switches version after reviewing guidance but before upload; the guidance must immediately reflect the new selection.
- Uploaded document does not match selected version; user receives clear feedback explaining mismatch and can switch versions and retry.
- Document contains partial or mixed formatting from both versions; system rejects unsupported mixed formats with actionable guidance.
- Document is missing required structure for selected version; system reports which expected parts are missing.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an import version selector in the outline import modal.
- **FR-002**: System MUST position the import version selector above the instructions area in the modal.
- **FR-003**: System MUST provide at least two selectable import versions: legacy outline and current outline.
- **FR-004**: System MUST update instructional text when the selected import version changes.
- **FR-005**: System MUST update all formatting examples for parsed item types when the selected import version changes.
- **FR-006**: System MUST preserve existing legacy parsing behavior when legacy outline is selected.
- **FR-007**: System MUST accept and parse the current exported outline format when current outline is selected.
- **FR-008**: System MUST preserve all supported imported content when importing a document produced by the current export flow.
- **FR-009**: System MUST provide clear user-facing error feedback when an uploaded outline does not match the selected version.
- **FR-010**: Users MUST be able to change import version and retry import without closing and reopening the modal.

### Assumptions

- Only two import versions are in scope for this feature: legacy and current.
- Legacy format definition remains unchanged from today.
- "Without loss" applies to content already supported by the import domain.
- Version-specific examples are shown for each parsed item type currently displayed in the import guidance.

### Dependencies

- Current export output structure remains the source of truth for the current outline import version.
- Existing legacy import rules remain available and testable as a baseline behavior.

### Key Entities _(include if feature involves data)_

- **Import Version**: User-selected outline format mode that determines validation and parsing expectations (legacy or current).
- **Import Guidance**: Version-specific instructional text and examples shown before upload.
- **Parsed Outline Item**: A supported structural element extracted from an uploaded outline document and mapped into story content.
- **Import Attempt**: A user action to upload and process an outline under a selected import version, including success or mismatch feedback.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of users can select a version and begin an import in under 20 seconds after opening the import modal.
- **SC-002**: 100% of valid legacy outlines that currently import successfully continue to import successfully under legacy mode.
- **SC-003**: At least 95% of documents produced by the current export flow import successfully under current mode without supported content loss.
- **SC-004**: Support requests related to "wrong outline format selected" decrease by at least 40% within one release cycle after launch.
