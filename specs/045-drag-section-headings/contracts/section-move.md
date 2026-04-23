# Contracts: Section Move

## Overview

No new endpoints are required. Section moves reuse the existing Update Section endpoint, which already supports `verticalIndex` changes, bounded-range grid shifting, and `shiftedResources` responses.

## Reused Endpoint: Update Section

- **Method**: `PATCH`
- **Path**: `/:storyId/sections/:sectionId`
- **Auth**: Required (userId from session)
- **Body**:
  - `verticalIndex`: number (required for a move operation; must be >= 0)
  - `title?`: string (optional)
  - `type?`: "act" | "chapter" (optional)
  - `description?`: string (optional)
- **Response** (200):
  ```json
  {
    "section": {
      "id": "string",
      "storyId": "string",
      "title": "string",
      "type": "act | chapter",
      "verticalIndex": number
    },
    "shiftedResources?": {
      "scenes": [{ "id": "string", "verticalIndex": number, ... }],
      "sections": [{ "id": "string", "verticalIndex": number, ... }]
    }
  }
  ```
- **Error** (400): `"verticalIndex must be >= 0"` if target index is negative.
- **Error** (400): `"Section verticalIndex is already occupied"` if another section exists at the target index (this is a server-side guard; the UI prevents this via drop-zone disabling).

## Move Shift Semantics

When `verticalIndex` changes from `fromIndex` to `toIndex`, the server:

1. Calls `getMoveRangeShift({ fromIndex, toIndex, resource: { type: "chapter" } })` — produces a bounded range shift.
2. Applies `shiftGridInVerticalIndexRange(storyId, rangeStart, rangeEnd, shift)` — shifts all scenes (across all plots) and all sections within the range.
3. Updates the section's `verticalIndex` to `toIndex`.
4. Returns the updated section and all affected scenes/sections in `shiftedResources`.

### Example: Moving section from row 3 → row 6

- Shift: `{ rangeStart: 4, rangeEnd: 6, shift: -1 }` (rows 4–6 shift up by 1)
- After shift: rows 4→3, 5→4, 6→5
- Section moves to row 6

### Example: Moving section from row 6 → row 3

- Shift: `{ rangeStart: 3, rangeEnd: 5, shift: +1 }` (rows 3–5 shift down by 1)
- After shift: rows 3→4, 4→5, 5→6
- Section moves to row 3

## Client-Side Optimistic Update

The existing `useUpdateSectionMutation` in `web/src/queries/section/section-mutations.ts` already performs:

1. Calls `getMoveRangeShift` with client-side scenes/sections data.
2. Applies `applyOptimisticShiftToState` to the cache.
3. Updates the section's `verticalIndex` optimistically.
4. On success, reconciles with `applyShiftedResources(queryClient, storyId, response.shiftedResources)`.
5. On error, rolls back via stored `context.previous`.

No changes to the mutation function are required.
