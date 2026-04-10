# Research: Sections Collection

## Decisions

### Sections data modeling

- **Decision**: Add a dedicated `sections` MongoDB collection keyed by `storyId` with `verticalIndex`, `title`, and `type` fields.
- **Rationale**: Matches existing model patterns in express/src/models and keeps story/plot/scene data normalized.
- **Alternatives considered**: Embedding sections in stories; rejected to avoid large story documents and to keep indexing/ordering consistent with scenes.

### Grid shift behavior

- **Decision**: Treat sections as grid entities alongside scenes. When inserting at a vertical index, shift scenes for all plots and shift sections for the story starting at the target index.
- **Rationale**: Aligns with existing `shiftGridUpwardOnIndex` semantics and ensures consistent grid rows across plots and sections.
- **Alternatives considered**: Shifting only within the target plot; rejected because sections are global to the story grid.

### Client cache updates

- **Decision**: Add section queries and update the TanStack Query cache when shifts occur, similar to scene move flows.
- **Rationale**: Preserves UI responsiveness and avoids full invalidations for common grid interactions.
- **Alternatives considered**: Always invalidating and refetching story data; rejected due to slower UX for frequent grid operations.
