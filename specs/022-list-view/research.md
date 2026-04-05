# Research: List View

## Decisions

1. **Scene ordering in list view**
   - **Decision**: Flatten all scenes from plots, then sort by `verticalIndex` ascending; when equal, sort by plot `horizontalIndex` ascending; keep a stable tie-breaker by scene `id`.
   - **Rationale**: Mirrors the grid's top-to-bottom ordering while preserving left-to-right plot order for shared rows.
   - **Alternatives considered**: Sorting only by `verticalIndex` (loses left-to-right ordering); sorting by plot first (breaks row flow).

2. **Rich text rendering for scene description**
   - **Decision**: Render `scene.description` as HTML via `dangerouslySetInnerHTML` with the existing `tiptap` class for styling.
   - **Rationale**: Scene descriptions are stored as HTML from the TipTap editor, and `tiptap` styles already exist in the app.
   - **Alternatives considered**: Rendering as plain text (loses formatting), introducing a dedicated renderer component (unnecessary now).

3. **Todo list display order**
   - **Decision**: Display todo items sorted with incomplete items first and completed items last; apply strike-through styling to completed items.
   - **Rationale**: Matches the requested reading order while keeping completed work visible.
   - **Alternatives considered**: Preserving original todo order (does not group completed items).

4. **List view display modes**
   - **Decision**: Implement `ListViewScene` display modes: `normal` renders full content; `filterExcluded` renders only character, title, and tags with a placeholder for description.
   - **Rationale**: Supports upcoming filters without needing a redesign later.
   - **Alternatives considered**: Skipping `filterExcluded` entirely (would require refactor when filters arrive).

5. **Tag badge sizing**
   - **Decision**: Extend `TagBadge` with a `size` prop (default `sm`), add an `lg` size for list view legibility.
   - **Rationale**: Reuses existing badge component and keeps color logic consistent.
   - **Alternatives considered**: Creating a separate badge component (duplication).
