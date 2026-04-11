# Research: Col Header Row Actions

## Decision 1: Use existing grid shift helpers

- **Decision**: Reuse existing grid shift functions for inserting rows above/below and for shifting rows down at a specific index.
- **Rationale**: Maintains consistency with existing grid behavior and reduces implementation risk.
- **Alternatives considered**: New shift logic in the column header component (rejected to avoid duplication).

## Decision 2: Empty-row clear behavior

- **Decision**: Allow "clear empty row" only when the row is empty and remove that row, shifting all rows above down to lower indices.
- **Rationale**: Matches the clarified product behavior and prevents accidental changes to populated rows.
- **Alternatives considered**: Clearing the row without shifting, or inserting a new row at the same index.

## Decision 3: Section defaults and styling

- **Decision**: Create default section names as `Act {index + 1}` or `Chapter {index + 1}` and align the new action button styles with SceneCard buttons.
- **Rationale**: Keeps naming predictable and ensures consistent UI styling across the plot grid.
- **Alternatives considered**: Prompting for names before creation (deferred) or introducing new button styling.

## Decision 4: Story grid shift endpoint

- **Decision**: Add a story grid shift endpoint that accepts a start index and shift direction, returns shifted resources, and validates that downward shifts only occur when the target index is empty.
- **Rationale**: The UI needs a persisted shift to match backend state, and the server is the source of truth for validating empty rows.
- **Alternatives considered**: Client-only shifts (rejected due to missing persistence) or overloading existing scene/section endpoints (rejected to keep intent explicit).

## Decision 5: Render sections in grid

- **Decision**: Render section rows in the plot grid with inline title editing, 4xl text for acts, 2xl text for chapters, and a centered 4px guide line across remaining row space.
- **Rationale**: Makes sections visible in grid context and matches the requested visual hierarchy for acts vs. chapters.
- **Alternatives considered**: Display-only labels (rejected; edit-in-place required) or a separate sections panel (rejected; needs grid alignment).
