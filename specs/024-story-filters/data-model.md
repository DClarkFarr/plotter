# Data Model: Story Filters

## Entities

### Filter

Represents an active constraint on the story page.

- **type**: One of `tag`, `plot`, `character`, `search` (custom text)
- **value1**: Primary value for the filter
  - Tag: tag identifier or label
  - Plot: plot identifier or label
  - Character: character identifier or label
  - Search: user-entered text
- **value2**: Optional secondary value
  - Tag: variant identifier or an All indicator
  - Plot: unused
  - Character: unused
  - Search: unused

### Filter Set

A collection of active filters displayed in the filters bar. The set is ordered for display and supports removing individual filters or clearing all.

## Relationships and Rules

- A filter set can contain multiple filters across different types.
- Filters are unique by the combination of `type`, `value1`, and `value2`.
- Selecting a different variant (or All) for the same tag replaces the prior tag filter.
- The filters bar renders only when at least one filter is active.
