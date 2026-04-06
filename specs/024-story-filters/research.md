# Research: Story Filters

## Decision 1: Filter state shape in story store

**Decision**: Represent active filters as an ordered array of objects with `type`, `value1`, and `value2` fields, stored in `storyStore`.
**Rationale**: This structure supports tag variants via `value2`, aligns with requirements for multiple filter types, and keeps a single source of truth for the filters bar.
**Alternatives considered**:

- Separate arrays per filter type (rejected: harder to render a unified filters bar and enforce unique filters).
- Map keyed by type/value (rejected: loses order and complicates multiple filters of the same type).

## Decision 2: Menu closing rules

**Decision**: Close the filters dropdown once a filter is applied, and also close it immediately when opening the custom text modal.
**Rationale**: Prevents overlapping overlays and matches the desired interaction flow.
**Alternatives considered**:

- Keep the menu open after applying a filter (rejected: leads to stale context and stacked menus).

## Decision 3: Tag variant selection behavior

**Decision**: Tag selection opens a variant submenu when variants exist, offering an All option plus each variant. Selection applies the filter using `value2` to capture the variant or All scope.
**Rationale**: Provides explicit control over tag scope without forcing separate tag or variant filters.
**Alternatives considered**:

- Auto-apply the first variant (rejected: hides intent and makes All selection unclear).

## Decision 4: Duplicate filter handling

**Decision**: Prevent duplicate filters with the same `type`, `value1`, and `value2` from being added; replace existing entries when a user selects a different variant for the same tag.
**Rationale**: Keeps the filters bar legible and avoids redundant constraints.
**Alternatives considered**:

- Allow duplicates (rejected: creates confusing filter states).
