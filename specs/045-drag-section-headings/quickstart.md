# Quickstart: Drag Section Headings

## Goal

Verify that act and chapter headings can be dragged to new row positions in the plot grid, that full-width drop zones appear during drag, and that the grid shift logic keeps scenes and sections in the correct relative order.

## Prerequisites

- Web app running from `web/` (`npm run dev`)
- Express server running from `express/` (`npm run dev`)
- A story open with at least two plots, one act section, one chapter section, and several scene cards spread across multiple rows

## Manual Verification Steps

### 1. Hover actions are visible

- Hover over an act heading in the grid.
- Confirm the drag handle button (`mdi/arrow-all`) and edit button (`mdi/lead-pencil`) appear.
- Move the mouse away and confirm the buttons disappear.
- Repeat for a chapter heading.

### 2. Drop zones appear on drag start

- Click and hold the drag handle on an act heading.
- Before releasing, confirm that full-width drop zone strips animate into existence between rows (spanning all plot columns, not just one).
- Confirm that the dragged section row scales down (`scale-80`) to indicate it is being dragged.
- Confirm NO drop zone appears at the dragged section's own row position.
- Confirm NO drop zone appears at any OTHER section's row position.

### 3. Drop zone highlight on hover

- While dragging the act heading, hover over a drop zone.
- Confirm the drop zone changes colour to indicate it will accept the drop.
- Move away from the drop zone; confirm it returns to its inactive state.

### 4. Section moves down (row increases)

- Story state: act section at row 2, scenes at rows 3–5.
- Drag the act from row 2 and drop on the drop zone at row 5.
- Expected result: act section is now at row 5; scenes previously at rows 3–5 shift up (rows 3→2, 4→3, 5→4); grid has no gaps.
- Confirm in the network panel that `PATCH /:storyId/sections/:sectionId` was called with `{ verticalIndex: 5 }`.
- Confirm `shiftedResources` in the response includes the shifted scenes.

### 5. Section moves up (row decreases)

- Story state: act section at row 5, scenes at rows 2–4.
- Drag the act from row 5 and drop on the drop zone at row 2.
- Expected result: act section is now at row 2; scenes previously at rows 2–4 shift down (rows 2→3, 3→4, 4→5); grid has no gaps.

### 6. Drop on same position is a no-op

- Drag the act heading and drop on the drop zone at the row immediately adjacent but equivalent to its current position.
- Confirm no network request is made and the grid is unchanged.

### 7. Cancel drag

- Start dragging a section.
- Press Escape or release outside any drop zone.
- Confirm the section returns to its original position and no network request is made.

### 8. Multiple sections coexist

- Story has an act at row 2 and a chapter at row 6.
- Drag the act from row 2.
- Confirm the drop zone at row 6 (chapter's row) does NOT appear/accept drops.
- Drop the act on row 4.
- Confirm act is at row 4, chapter is still at row 6, and scenes in rows 3–4 shifted correctly.

### 9. Scene drag still works

- After completing a section drag, verify that dragging a scene card between plot columns still works as before and no visual regressions are visible.

### 10. Optimistic rollback on error

- Temporarily break the section update endpoint (e.g., force a 500 response).
- Drag a section to a new position.
- Confirm the grid optimistically shows the move.
- Confirm after the error response the grid rolls back to the original layout.
