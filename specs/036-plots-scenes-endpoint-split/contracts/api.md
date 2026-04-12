# API Contracts: Plots & Scenes Endpoint Split

**Feature**: 036-plots-scenes-endpoint-split  
**Date**: 2026-04-11

---

## Existing endpoints — changed payloads

### `GET /stories/:storyId/plots`

Returns plot metadata for all plots in a story. **Breaking change**: `scenes` field removed from each plot object.

**Response** `200 OK`:

```json
{
  "plots": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "color": "string",
      "storyId": "string",
      "horizontalIndex": "number"
    }
  ]
}
```

---

### `POST /stories/:storyId/plots`

Creates a new plot. **Breaking change**: response no longer includes `scenes` field.

**Request body**:

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "color": "string (optional, default #94A3B8)",
  "horizontalIndex": "number (required)"
}
```

**Response** `201 Created`:

```json
{
  "plot": {
    "id": "string",
    "title": "string",
    "description": "string",
    "color": "string",
    "storyId": "string",
    "horizontalIndex": "number"
  }
}
```

---

### `PATCH /stories/:storyId/plots/:plotId`

Updates a plot. **Breaking change**: response no longer includes `scenes` field. Previously re-fetched the plot with all nested scenes; now returns updated metadata only.

**Request body** (all fields optional, at least one required):

```json
{
  "title": "string",
  "description": "string",
  "color": "string",
  "horizontalIndex": "number"
}
```

**Response** `200 OK`:

```json
{
  "plot": {
    "id": "string",
    "title": "string",
    "description": "string",
    "color": "string",
    "storyId": "string",
    "horizontalIndex": "number"
  }
}
```

**Error responses** (unchanged):

- `400 Bad Request` — update payload is empty
- `404 Not Found` — plot not found for this story

---

## New endpoint

### `GET /stories/:storyId/scenes`

Returns all scenes for a story as a flat array.

**Path parameters**:

- `storyId` — the story ID

**Access control**: The requesting user must have access to the story. Returns `403 Forbidden` if not.

**Response** `200 OK`:

```json
{
  "scenes": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "plotId": "string",
      "tags": ["string"],
      "tagVariants": [{ "tagId": "string", "variant": "string" }],
      "todo": [{ "text": "string", "isDone": "boolean" }],
      "snippets": [{ "label": "string", "text": "string" }],
      "verticalIndex": "number",
      "pov": "string | null"
    }
  ]
}
```

**Notes**:

- Returns an empty `scenes` array if the story has no scenes — never returns an error for empty data.
- Scene objects are identical in shape to scene objects returned by existing CRUD endpoints.
- Scenes are not sorted server-side; the client sorts by `verticalIndex` as needed.

**Error responses**:

- `401 Unauthorized` — no valid session
- `403 Forbidden` — user does not have access to the story
- `404 Not Found` — story not found

---

## Unchanged endpoints

All scene CRUD endpoints remain unchanged in path, method, request body, and response shape:

| Method   | Path                                                 | Notes     |
| -------- | ---------------------------------------------------- | --------- |
| `POST`   | `/stories/:storyId/plots/:plotId/scenes`             | Unchanged |
| `PATCH`  | `/stories/:storyId/scenes/:sceneId`                  | Unchanged |
| `DELETE` | `/stories/:storyId/scenes/:sceneId`                  | Unchanged |
| `POST`   | `/stories/:storyId/scenes/:sceneId/move-within-plot` | Unchanged |
| `POST`   | `/stories/:storyId/grid-shift`                       | Unchanged |
