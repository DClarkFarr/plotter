# Quickstart: Sync Optimistic Shift Logic

## Goal

Verify that optimistic updates for scene and section mutations match server shift behavior.

## Prerequisites

- API server running from `express/`
- Web app running from `web/`
- Access to a story with multiple plots, scenes, and sections

## Manual Verification Steps

1. **Create Scene (occupied row)**
   - Create a scene in a row that already contains a scene in the same plot.
   - Confirm the grid shifts immediately and the final saved layout matches the optimistic layout.

2. **Delete Scene (row becomes empty)**
   - Delete a scene where the row becomes empty across all plots and sections.
   - Confirm rows shift downward immediately and remain consistent after the server response.

3. **Move Scene within story**
   - Move a scene to a new row that already has content.
   - Confirm the target row is cleared with the same shift outcome as the server.
   - If the source row becomes empty, confirm only the bounded range shifts (not the full grid).

4. **Move Scene between plots (same row)**
   - Move a scene to a different plot at the same row.
   - Confirm shift behavior matches the server response (especially when the target row is occupied).
   - Repeat with an empty target row and confirm no shift occurs.

5. **Section create/delete/move (if enabled)**
   - Create, delete, and move sections to occupied rows.
   - Confirm the shifts match server results.
   - When moving a section to an occupied row, confirm only the bounded range shifts.
