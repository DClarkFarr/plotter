# Sections API Contract

Base path: `/api`

## GET /stories/:storyId/sections

List sections for a story.

**Response (200)**

```json
{
  "sections": [
    {
      "id": "string",
      "storyId": "string",
      "title": "string",
      "verticalIndex": 0,
      "type": "act"
    }
  ]
}
```

## POST /stories/:storyId/sections

Create a section for a story. If the target vertical index is occupied by any scene in the grid, shift scenes (all plots) and sections upward from that index.

**Request**

```json
{
  "title": "string",
  "verticalIndex": 0,
  "type": "act"
}
```

**Response (201)**

```json
{
  "section": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "verticalIndex": 0,
    "type": "act"
  },
  "scenes": [
    {
      "id": "string",
      "plotId": "string",
      "verticalIndex": 1
    }
  ],
  "sections": [
    {
      "id": "string",
      "storyId": "string",
      "verticalIndex": 1
    }
  ]
}
```

`scenes` and `sections` are optional arrays of shifted resources (empty or omitted when no shift occurs).

## PATCH /stories/:storyId/sections/:sectionId

Update a section. If `verticalIndex` changes to an occupied grid row, shift scenes (all plots) and sections upward from that index.

**Request**

```json
{
  "title": "string",
  "verticalIndex": 2,
  "type": "section"
}
```

**Response (200)**

```json
{
  "section": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "verticalIndex": 2,
    "type": "section"
  },
  "scenes": [
    {
      "id": "string",
      "plotId": "string",
      "verticalIndex": 3
    }
  ],
  "sections": [
    {
      "id": "string",
      "storyId": "string",
      "verticalIndex": 3
    }
  ]
}
```

## Errors

- **400**: Invalid payload (missing title, invalid type, invalid index)
- **401**: Unauthorized
- **403**: Forbidden (no access to story)
- **404**: Story or section not found
