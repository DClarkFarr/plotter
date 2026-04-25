# Research: Modern Import Syntax Guide

**Branch**: `050-import-syntax-guide`

---

## Decision 1 — Component Scope: New Component vs. Inline Content

**Decision**: Create a dedicated `ModernImportInstructions` React component in
`ImportOutlineModal.tsx`, replacing the current minimal inline JSX fragment that
shows two bullet-point sections.

**Rationale**: The `LegacyImportInstructions` component already establishes a rich,
two-column layout pattern (description left, dark code-style example block right) that
users are familiar with. The modern variant should follow the same visual contract for
consistency. Encapsulating it in a named component keeps `ImportOutlineModal` readable
and makes the instructions independently maintainable.

**Alternatives considered**:

- Keep the inline JSX and expand it — rejected; the existing fragment is too minimal and
  would become hard to read inline.
- Move to a separate file — not needed for a component this small; co-locating in the same
  file matches the `LegacyImportInstructions` precedent.

---

## Decision 2 — Which Parser Constants to Document

**Decision**: Surface the following parser constants in user-facing prose, derived
directly from `importOutlineModernParser.ts`:

| Constant                      | Value | User-facing description                                   |
| ----------------------------- | ----- | --------------------------------------------------------- |
| `ACT_HEADING_SIZE`            | 1     | H1 headings become acts                                   |
| `CHAPTER_HEADING_SIZE`        | 2     | H2 headings become chapters                               |
| `SCENE_HEADING_SIZE`          | 3     | H3 headings become scenes                                 |
| `PLOT_HEADING_SIZE`           | 4     | H4 headings OR paragraphs starting with `\|` become plots |
| `SNIPPET_HEADING_SIZE`        | 5     | H5 headings become snippet headings                       |
| `snippetIndentThresholdTwips` | 600   | Paragraphs indented ≥ ~1 cm become snippet body           |

**Rationale**: These are already stable exported constants. Documenting them directly
from the source ensures no drift. If constants change, the component and spec must also
update.

---

## Decision 3 — Section Order and Grouping

**Decision**: Follow the same section order as `LegacyImportInstructions`:

1. Document Structure (acts, chapters, scenes) — top-level structure is the anchor
2. Scene POV Character — same syntax as legacy, but in an H3 heading
3. Plots — modern-specific: H4 or `| PlotName` paragraph prefix
4. Tags — bracket token row placed after scene heading (not inline with scene title)
5. Snippets — indented paragraphs with optional H5 / colon-suffix heading

**Rationale**: Mirroring the legacy order lets users who switch from legacy to modern
orient themselves in a familiar sequence. The key difference is the dedicated Plots
section, which appears before Tags because a scene must have a plot before it has tags
in the document flow.

---

## Decision 4 — Color Convention Documentation

**Decision**: Add a brief note in the Plots section and Tags section that the text color
of the `|` character / `[Tag]` bracket token in the source document is preserved on import.
Keep it brief (one sentence per section); it is optional and should not dominate the UI.

**Rationale**: Color-coded imports are a power-user feature. A one-liner is sufficient;
detailed color setup guidance is out of scope.

---

## Decision 5 — No New Dependencies

**Decision**: The `ModernImportInstructions` component uses only Tailwind CSS and inline
JSX — no new npm packages.

**Rationale**: `LegacyImportInstructions` uses no external dependencies beyond Tailwind;
the modern variant follows the same constraint.
