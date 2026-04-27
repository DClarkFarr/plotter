# Data Model: Change Scene Plot Without Dragging

## Entities

### Story

- **Description**: Container for plots, scenes, and sections that define one grid.
- **Key Fields**: `id`
- **Relationships**: Has many `Plot`, `Scene` (through plots), and `Section`.

### Plot

- **Description**: A story column that contains scenes ordered by `verticalIndex`.
- **Key Fields**: `id`, `storyId`, `horizontalIndex`, `title`
- **Relationships**: Belongs to `Story`; has many `Scene`.

### Scene

- **Description**: A story unit displayed in a plot at a specific grid row.
- **Key Fields**: `id`, `plotId`, `verticalIndex`, `title`, `description`, `pov`, `tags`, `tagVariants`, `todo`, `snippets`
- **Relationships**: Belongs to `Plot`; belongs to `Story` via `Plot`.

### Section

- **Description**: Story-level row marker that occupies a row across the grid.
- **Key Fields**: `id`, `storyId`, `verticalIndex`, `title`, `type`
- **Relationships**: Belongs to `Story`.

### ScenePlotChangeRequest

- **Description**: Mutation request describing one scene move between plot positions.
- **Key Fields**: `storyId`, `sceneId`, `fromPlotId`, `toPlotId`, `fromIndex`, `toIndex`
- **Relationships**: References one `Scene`, source and destination `Plot`, and implicitly affects `Section` rows through grid shifts.

### ShiftedResources

- **Description**: Server-provided set of resources whose `verticalIndex` changed as part of move conflict resolution.
- **Key Fields**: `scenes[]`, `sections[]`
- **Relationships**: Derived from shift operations; applied by client for reconciliation.

## Validation Rules

- `toIndex` and `fromIndex` are non-negative integers.
- Scene must exist and belong to an accessible story.
- Destination collision rule: if destination plot already has a scene at `toIndex`, shift grid rows downward from `toIndex` before moving scene.
- No scene overwrite is allowed at destination.
- Selecting same plot and same index is a no-op.

## State Transitions

### Scene Plot Change (Non-Drag Entry Points)

1. User selects a destination plot from scene actions or scene form.
2. Client computes optimistic shift range (if any) from existing shift logic.
3. Client applies optimistic shifted rows and optimistic scene placement.
4. Server validates request and computes authoritative shifts.
5. Server applies shifts first when destination collision exists.
6. Server updates scene `plotId` and `verticalIndex`.
7. Server returns moved scene and `shiftedResources`.
8. Client reconciles cache with server response.

### Rollback on Failure

1. If request fails, client restores previous scenes/sections snapshot from mutation context.
2. UI returns to pre-move state with no partial shifts retained.
