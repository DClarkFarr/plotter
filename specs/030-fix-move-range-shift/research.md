# Research: Fix Move Range Shift Logic

## Decision: Use move-range rules from `getMoveRangeShift` notes

**Rationale**: The existing inline notes define how to shift for same-row, adjacent-row, and multi-row moves, including occupancy checks that differ by resource type. Implementing directly from these notes keeps behavior consistent with intended grid semantics.

**Alternatives considered**: Reusing the prior two-step remove/insert shift (rejected because it causes larger-than-needed shifts and conflicts with the documented notes).

## Decision: Base row-emptiness on resource type

**Rationale**: Sections occupy full rows; moving a section always frees the source row. Scenes only free the source row if no other plots have a scene at that index. This distinction is necessary for accurate shift decisions.

**Alternatives considered**: Treat all resource moves as emptying the source row (rejected because it collapses rows that still contain scenes in other plots).

## Decision: Return a bounded shift plan or null

**Rationale**: The shift plan is produced only when the target row is occupied. When the source row becomes empty, the shift is bounded to the range between indices and moves toward the source row; otherwise, rows shift downward from the target index to make space. Returning `null` for unoccupied targets keeps callers simple and avoids applying unnecessary shifts.

**Alternatives considered**: Always return a plan with `shift: 0` (rejected because it complicates downstream shift checks and violates existing usage patterns).
