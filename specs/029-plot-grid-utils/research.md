# Research: Plot Grid Utilities

## Decision: Centralize plot grid shift logic in shared utilities

**Rationale**: Existing scene and section services implement overlapping shift checks. A shared utility reduces duplicated checks and keeps move/add/remove behavior consistent across resources.

**Alternatives considered**: Leave logic in each service (rejected due to divergence risk and repeated checks).

## Decision: Shift-on-insert uses occupancy checks scoped by resource type

**Rationale**: A section occupies the entire row, so any scene or section at the target index should trigger a shift. Scenes can coexist across plots; shifting should occur only when the target plot already has an item at the index and the row is not locked by a section.

**Alternatives considered**: Always shift on scene insert (rejected because it would move rows that are defined by sections and should stay anchored).

## Decision: Shift-on-remove only when the index becomes empty for the relevant scope

**Rationale**: Removing the last resource on an index should collapse the grid, but if another resource remains at the index, shifting would create overlaps. For sections, the index is story-wide; for scenes, the index collapses only when the plot is empty at that index and no section anchors the row.

**Alternatives considered**: Always shift after any removal (rejected because it would move unrelated rows while content still exists at the index).

## Decision: Move operations use bounded range shifts

**Rationale**: Moving between two indices should not trigger two full-grid shifts. A bounded shift preserves ordering and only affects indices between the source and destination:

- Move down (e.g., 3 -> 7): shift items in (4..7) down by 1.
- Move up (e.g., 7 -> 3): shift items in (3..6) up by 1.

**Alternatives considered**: Separate remove+insert shifts (rejected because they cancel out above the destination and unnecessarily update unrelated items).
