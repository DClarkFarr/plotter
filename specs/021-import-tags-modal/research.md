# Research

## Decision 1: Import tags endpoint

- Decision: Add a story-scoped import endpoint at `POST /stories/:toStoryId/tags/import` that accepts `fromStoryId` and `tagIds`.
- Rationale: Aligns with existing story tag routes and keeps access checks in one place.
- Alternatives considered: A global `/tags/import` endpoint (rejected to keep story scope consistent).

## Decision 2: Tag comparison table alignment

- Decision: Build aligned rows by grouping tags by the first letter and sorting each group alphabetically; render rows for the union of group sizes, inserting empty cells as needed.
- Rationale: Keeps visual alignment across columns and fulfills the requirement to line up letter groups.
- Alternatives considered: Simple side-by-side lists (rejected because rows would not align).

## Decision 3: Selection UX

- Decision: Make the full left-column row clickable; toggle selection with a bold border + background state.
- Rationale: Large click target and clear state improves usability.
- Alternatives considered: Checkbox-only selection (rejected as less discoverable).
