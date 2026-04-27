# Quickstart: Change Scene Plot Without Dragging

## Goal

Verify users can change a scene's plot from two non-drag UI paths and that optimistic updates match final server shift behavior.

## Prerequisites

- API server running from `express/`
- Web app running from `web/`
- A story with at least two plots
- Seed rows where at least one destination row is occupied

## Manual Verification Steps

1. **Scene Action Menu Move**
   - Open a story grid and hover/focus a scene action area.
   - Open `Change Plot` and choose a different plot.
   - Confirm the scene moves immediately (optimistic) and remains in the target plot after response.

2. **Scene Form Selector Move**
   - Open the same scene in sidebar form.
   - Use the new plot selector above scene title to choose a different plot.
   - Confirm immediate move and persisted final placement after response.

3. **Occupied Destination Collision Shift**
   - Choose a destination plot where the destination `verticalIndex` already has a scene.
   - Trigger plot change from scene actions.
   - Confirm rows shift downward from that index before/while the moved scene is placed.
   - Repeat from scene form selector and confirm identical behavior.

4. **Optimistic-Server Parity**
   - During a collision move, observe optimistic layout.
   - After server response, confirm no additional unexpected jump occurs and final layout matches optimistic intent.

5. **No-op and Error Handling**
   - Select current plot as destination and confirm no duplicate move is applied.
   - Simulate or trigger a failing move request and confirm scenes/sections rollback to pre-move positions.

6. **Regression Check for Drag Flow**
   - Perform existing drag-and-drop scene move in the same story.
   - Confirm drag behavior still works and remains consistent with non-drag move semantics.
