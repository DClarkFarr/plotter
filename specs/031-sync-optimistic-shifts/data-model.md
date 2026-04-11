# Data Model: Sync Optimistic Shift Logic

## Entities

### Story

- **Description**: Container for plots and their grid rows.
- **Key Fields**: `id`
- **Relationships**: Has many `Plot`, has many `Section`.

### Plot

- **Description**: A column in a story that contains scenes.
- **Key Fields**: `id`, `storyId`
- **Relationships**: Belongs to `Story`, has many `Scene`.

### Scene

- **Description**: A unit of content placed at a vertical grid index within a plot.
- **Key Fields**: `id`, `plotId`, `verticalIndex`, `title`, `description`, `tags`, `tagVariants`, `todo`, `snippets`, `pov`
- **Relationships**: Belongs to `Plot` and a `Story` through `Plot`.

### Section

- **Description**: A story-level row marker (act or section) that occupies a vertical index across plots.
- **Key Fields**: `id`, `storyId`, `verticalIndex`, `title`, `type`
- **Relationships**: Belongs to `Story`.

### Grid Row

- **Description**: A vertical position shared by scenes (per plot) and sections (story-level).
- **Key Fields**: `verticalIndex`
- **Relationships**: Can contain multiple `Scene` entries (across plots) and at most one `Section`.

### ShiftedResources

- **Description**: Collection of scenes and sections that have updated `verticalIndex` values after a shift.
- **Key Fields**: `scenes[]`, `sections[]`
- **Relationships**: Derived from server-side shift operations.

## State Transitions

- **Scene Create**: Insert at `verticalIndex`, optionally shifting existing rows upward.
- **Scene Delete**: Remove and optionally shift rows downward to close gaps.
- **Scene Move**: Update `plotId` and `verticalIndex`, optionally shifting a bounded range or from a target index.
- **Section Create/Delete/Move**: Updates `verticalIndex` and can trigger story-level shifts of rows.
