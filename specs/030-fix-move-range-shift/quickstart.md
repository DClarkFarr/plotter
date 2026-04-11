# Quickstart: Fix Move Range Shift Logic

## Prerequisites

- Install dependencies in `express/`.

## Run

1. Start the Express server.
2. Open a story that shows the plot grid.
3. Move a scene within the same plot and same row; confirm no shift occurs.
4. Move a scene to another plot at the same row:
   - When the row is empty, confirm no shift occurs.
   - When the row is occupied, confirm rows shift down by one.
5. Move a scene to an adjacent row and confirm only the bounded range shifts when the target is occupied.
6. Move a scene to a row more than one position away and confirm only the bounded range shifts when the target is occupied.
7. Move a section to a different row and confirm the source row collapses and the target row respects occupancy.

## Expected Result

- No overlapping scenes or sections exist at the same index after any move.
- Same-row moves do not shift the grid.
- Adjacent and multi-row moves only shift the minimal required range.

## Validation Status

- 2026-04-10: Not run (requires manual verification in the UI).
