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

Create a section for a story.

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
  }
}
```

## PATCH /stories/:storyId/sections/:sectionId

Update a section.

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
  }
}
```

## Errors

- **400**: Invalid payload (missing title, invalid type, invalid index)
- **401**: Unauthorized
- **403**: Forbidden (no access to story)
- **404**: Story or section not found
