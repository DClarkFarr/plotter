# Feature Specification: Modern Import Syntax Guide

**Feature Branch**: `050-import-syntax-guide`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "as a user, I would like detailed descriptions and examples for modern import syntax, with examples. These examples and syntax should match specs used in the modern outline parser."

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## Overview

Writers currently import story outlines from `.docx` files using a "modern" format supported by the app's modern outline parser. However, there is no in-app reference explaining what that syntax looks like in practice. This feature adds a syntax guide — rendered where the user is most likely to need it (e.g., inside the import modal or a dedicated help surface) — with descriptions and concrete examples for each supported construct.

The modern import syntax is defined by heading levels and a small set of text conventions. The guide must faithfully reflect what the parser actually accepts:

| Construct       | Format                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Act             | Heading 1                                                                                        |
| Chapter         | Heading 2                                                                                        |
| Scene           | Heading 3 — optionally prefixed with POV character (`Character Name: Scene Title`)               |
| Plot            | Heading 4 **or** paragraph/heading whose text starts with a pipe (`\| Plot Name`)                |
| Tag row         | First non-empty paragraph after a scene heading, using `[TagName]` or `[TagName:Variant]` tokens |
| Snippet heading | Heading 5, or any indented paragraph whose text ends with `:`                                    |
| Snippet body    | Indented paragraphs (left-indent ≥ ~600 twips / ~1 cm) following a snippet heading               |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Read the full syntax reference (Priority: P1)

As a writer preparing a `.docx` file for import, I can open a syntax guide that shows every supported construct with a plain-language description and a formatted example, so I can correctly structure my document the first time.

**Why this priority**: Without this reference, users have no reliable way to know which heading levels or text patterns the parser expects. This is the core deliverable.

**Independent Test**: Can be fully tested by opening the guide surface (modal, panel, or help page), confirming that every supported construct has a visible description and at least one example, and verifying the examples match what the parser accepts.

**Acceptance Scenarios**:

1. **Given** I am about to import an outline, **When** I open the syntax guide, **Then** I see a description and example for each supported construct: acts (H1), chapters (H2), scenes (H3), plots (H4 / pipe prefix), tag rows, snippet headings, and snippet body paragraphs.
2. **Given** I am viewing the guide, **When** I read the scene section, **Then** I see a plain-text example showing a scene heading without a POV character and a second example showing the `Character Name: Scene Title` form.
3. **Given** I am viewing the guide, **When** I read the plot section, **Then** I see both the heading-4 form and the pipe-prefix paragraph form shown as separate examples.
4. **Given** I am viewing the guide, **When** I read the tag row section, **Then** I see an example with a bare tag `[Drama]`, a tag with a variant `[Drama:Subplot]`, and a multi-tag row `[Drama] [Romance:Main]`.

---

### User Story 2 - Understand snippet indentation rules (Priority: P2)

As a writer, I can read a clear explanation of how indentation creates snippets, including what qualifies as "enough" indentation and how snippet headings and body paragraphs relate to one another.

**Why this priority**: Snippet indentation is the least intuitive rule; a concrete description with a visual/textual example significantly reduces import errors.

**Independent Test**: Can be fully tested by reviewing the snippet section of the guide, confirming that indentation-level guidance and at least one labelled example are present.

**Acceptance Scenarios**:

1. **Given** I am viewing the guide, **When** I read the snippet section, **Then** I see that body paragraphs must be indented at least ~1 cm (or equivalently ≥ 600 twips) to be treated as snippet content.
2. **Given** I am viewing the guide, **When** I read the snippet section, **Then** I see an example showing a snippet heading (H5 or paragraph ending with `:`) followed by one or more indented body paragraphs.
3. **Given** I am viewing the guide, **When** I read the snippet section, **Then** I see an explanation of what happens to indented paragraphs that appear without a preceding snippet heading (they are grouped into an auto-labelled snippet).

---

### User Story 3 - Understand character and tag color conventions (Priority: P3)

As a writer, I can read guidance about optional color conventions for POV characters, plot headings, and tags, so I can take advantage of color-coded imports when I want to.

**Why this priority**: Color extraction is a bonus feature; users who want it need to know that coloring a token in the source document carries that color through on import.

**Independent Test**: Can be fully tested by locating the color notes in the guide and confirming the expected behavior (color of the text/highlight of a token is captured on import) is described.

**Acceptance Scenarios**:

1. **Given** I am viewing the guide, **When** I read the plot section, **Then** I see a note that the text color of the `|` character in a pipe-prefix plot heading determines the plot's color on import.
2. **Given** I am viewing the guide, **When** I read the tag row section, **Then** I see a note that the text or highlight color of a `[Tag]` token is preserved as the tag's color on import.

---

### Edge Cases

- Guide content is read-only; no user input or state is required.
- The guide must remain accurate if parser constants (heading levels, indent threshold) change — the guide content should be sourced from or linked to a single authoritative definition so it cannot drift from the parser.
- If a user creates a document that mixes modern and legacy syntax, the guide should note that the modern parser is the active one and does not support legacy constructs (e.g., H4 scenes).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app MUST display a syntax reference that covers all construct types recognized by the modern outline parser: acts, chapters, scenes (with and without POV), plots (H4 and pipe-prefix forms), tag rows, snippet headings, and snippet body paragraphs.
- **FR-002**: Each construct entry MUST include a plain-language description of what the construct represents in the story structure.
- **FR-003**: Each construct entry MUST include at least one concrete example that a user could copy into a word processor to reproduce the expected behavior.
- **FR-004**: Scene examples MUST show both the bare form (`Scene Title`) and the POV-prefixed form (`Character Name: Scene Title`).
- **FR-005**: Plot examples MUST show both the Heading 4 form and the pipe-prefix paragraph form (`| Plot Name`).
- **FR-006**: Tag row examples MUST show a single bare tag, a tag with a variant (`[Name:Variant]`), and a row containing multiple tags.
- **FR-007**: The snippet section MUST state the minimum indentation required (~1 cm / ≥ 600 twips) for a paragraph to be treated as snippet content.
- **FR-008**: The guide MUST include a note that the text or background color applied to a `[Tag]` token or `|` plot prefix in the source document is carried over as the entity's color on import.
- **FR-009**: The guide content MUST be accessible from within the import flow (e.g., visible in or linked from the import modal) so users can consult it without leaving the import context.
- **FR-010**: The guide MUST be rendered in a way that preserves monospace or clearly formatted example blocks so readers can distinguish example text from descriptive prose.

### Key Entities _(optional)_

- **Syntax Guide Entry**: A single construct description comprising a title, plain-language explanation, and one or more formatted examples.
- **Modern Outline Parser Constants**: The set of heading-level and indentation values the parser uses (e.g., H1=act, H2=chapter, H3=scene, H4=plot, H5=snippet, indent threshold ≥ 600 twips). The guide must reflect these values exactly.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every supported modern import construct (7 types: act, chapter, scene, plot, tag row, snippet heading, snippet body) has a corresponding entry in the guide; 0 constructs are undocumented.
- **SC-002**: Each entry includes at least one example that can be typed verbatim into a word processor and produce the expected import result when tested against the parser.
- **SC-003**: Users who read the guide before importing can prepare a valid `.docx` file without consulting source code or external documentation.
- **SC-004**: The guide is reachable within 2 clicks from the import entry point on the dashboard.
- **SC-005**: No entry in the guide describes behavior that the modern parser does not actually implement (zero inaccurate entries).

## Assumptions

- The modern outline parser is the only active parser; the guide does not need to cover legacy syntax.
- Heading levels used by the parser (H1–H5) are stable and will not change without a corresponding guide update.
- The indent threshold of 600 twips (~1 cm in standard Word/LibreOffice settings) is a known constant that can be stated in user-facing documentation.
- Color is an optional enhancement; the guide describes it but does not imply it is required for a valid import.
- The import modal or its surrounding UI already exists (from spec 026) and the guide content will be added to or linked from that surface.
