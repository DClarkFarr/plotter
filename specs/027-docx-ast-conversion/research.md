# Research: Docx AST Conversion

## Decision 1: Heading-to-structure mapping

**Decision**: Use heading levels to map structure: H1 = act, H2 = chapter, H4 = scene. Paragraphs following an H1 (until the next H1) are stored on the act as HTML strings, preserving inline formatting.

**Rationale**: Heading levels are consistent with authoring workflows and make structure detection deterministic.

**Alternatives considered**: Explicit text markers like "ACT:" / "CHAPTER:" / "SCENE:"; using H3 for scenes instead of H4.

## Decision 2: POV and scene title parsing

**Decision**: Parse the POV from the start of the H4 heading up to the first colon. The remainder of the heading text becomes the scene title (e.g., "Character 1: Chapter 1" -> POV = "Character 1", title = "Chapter 1").

**Rationale**: The format is explicit, human-readable, and allows a consistent way to derive POV and scene title.

**Alternatives considered**: Separate POV markers (e.g., "POV: Character"), a dedicated POV paragraph, or a dedicated metadata table.

## Decision 3: Tag parsing and color preservation

**Decision**: Parse tags from the H4 heading using bracket syntax. `[tag]` creates a normal tag; `[tag:variant]` creates a variant. Capture and preserve the tag highlight color.

**Rationale**: Inline tag markers allow authors to add tags without leaving the heading and the highlight color carries visual metadata for later UI use.

**Alternatives considered**: Inline `#tag` markers, separate tag lines, or a dedicated tag section per scene.

## Decision 4: Snippet detection

**Decision**: Treat paragraphs with a margin-left indent (approximately 0.5 inch) as snippets. Consecutive paragraphs with the same indent are grouped into a single snippet.

**Rationale**: Indentation is a strong signal for snippet blocks and preserves author intent without requiring explicit markers.

**Alternatives considered**: Snippet markers like "SNIPPET:" or a dedicated snippet style.

## Decision 5: Relational tag and character sets

**Decision**: Maintain tag and character sets keyed by normalized name, assign ids, and link scenes to those ids.

**Rationale**: Relational sets prevent duplication and allow cross-scene querying.

**Alternatives considered**: Duplicating tag and character data in each scene or deferring deduplication to a later step.
