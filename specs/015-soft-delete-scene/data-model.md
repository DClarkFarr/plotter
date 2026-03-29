# Data Model: Soft Delete Scene

## Entities

### Scene

- **Purpose**: Represents a plot unit in the story grid with a soft-delete lifecycle.
- **Key fields**: `id`, `plotId`, `title`, `description`, `tags[]`, `tagVariants[]`, `todo[]`, `verticalIndex`, `pov?`, `deletedAt?`.
- **State**:
  - Active when `deletedAt` is missing or null.
  - Deleted when `deletedAt` is set to a timestamp.

### Story Grid

- **Purpose**: Displays active scenes for each plot in the story.
- **Rule**: Only scenes with `deletedAt` unset are returned for active views.

## Validation & Constraints

- `deletedAt` is set only by the delete workflow and is immutable through standard updates.
- The `(plotId, verticalIndex)` uniqueness constraint applies only to active scenes to avoid collisions with soft-deleted records.
