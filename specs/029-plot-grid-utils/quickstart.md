# Quickstart: Plot Grid Utilities

## Prerequisites

- Install dependencies in `express/`.

## Run

1. Start the Express server.
2. Open a story in the UI that shows the plot grid.
3. Add a scene to a plot at an occupied index and confirm the grid shifts to make room.
4. Add a section at an occupied index and confirm the grid shifts across the story.
5. Remove a scene from an index with no remaining items and confirm higher indices shift down.
6. Move a scene or section from index 3 to 7 (and 7 to 3) and confirm only the bounded range shifts.

## Expected Result

- No overlapping scenes or sections exist at the same index after any operation.
- Indices collapse only when the index becomes empty for the applicable scope.
- Items outside the move range keep their original order and indices.

## Validation Status

- 2026-04-10: Not run (requires manual verification in the UI).
