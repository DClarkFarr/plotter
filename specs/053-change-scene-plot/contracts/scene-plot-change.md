# Contracts: Scene Plot Change (Non-Drag Entry Points)

## Overview

Non-drag plot changes must reuse the existing scene move contract so drag and non-drag behavior remain identical.

## Endpoint (Reused)

- **Method**: `POST`
- **Path**: `/stories/:storyId/scenes/:sceneId/move-within-plot`
- **Auth**: Required

## Request Body

```json
{
  "fromPlotId": "plot_source_id",
  "toPlotId": "plot_target_id",
  "fromIndex": 7,
  "toIndex": 7
}
```

Notes:

- `toIndex` is typically the current scene `verticalIndex` for plot-only reassignment.
- Both scene-action and scene-form flows submit this same shape.

## Success Response (200)

```json
{
  "scene": {
    "id": "scene_id",
    "plotId": "plot_target_id",
    "verticalIndex": 7
  },
  "shiftedResources": {
    "scenes": [{ "id": "scene_a", "plotId": "plot_x", "verticalIndex": 8 }],
    "sections": [{ "id": "section_a", "verticalIndex": 8 }]
  }
}
```

- `shiftedResources` is optional when no shift is needed.
- `scene` is the moved scene payload after final persisted update.

## Collision Shift Semantics

### Rule

If the destination plot already contains a scene at `toIndex`, the system shifts rows downward from `toIndex` before placing the moved scene.

### Expected Outcome

- No destination scene is overwritten.
- Existing scenes and sections at or below `toIndex` are shifted according to server shift rules.
- Moved scene is then persisted to destination plot at `toIndex`.

## Client Optimistic Contract

- Client optimistic updates must use the same move-range shift logic as server semantics.
- On success, client must reconcile with server `shiftedResources` and moved `scene` payload.
- On error, client must restore the previous scenes/sections snapshot.

## Error Responses

- `400`: invalid/missing request fields
- `404`: story or scene not found in authorized scope
- `401/403`: unauthorized access
- `5xx`: server error

Response payload uses existing API error shape (`error` and/or `message` as currently handled by client normalizer).
