# Contract: Story Stats in Dashboard Responses

## Endpoint: GET /stories

### Response (200)

```json
{
  "stories": [
    {
      "id": "string",
      "title": "string",
      "description": "string|null",
      "ownerId": "string",
      "stats": {
        "plots": 0,
        "scenes": 0,
        "characters": 0,
        "tags": 0
      },
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601|null"
    }
  ]
}
```

## Endpoint: GET /stories/:storyId

### Response (200)

```json
{
  "story": {
    "id": "string",
    "title": "string",
    "description": "string|null",
    "ownerId": "string",
    "stats": {
      "plots": 0,
      "scenes": 0,
      "characters": 0,
      "tags": 0
    },
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601|null"
  }
}
```

## Notes

- `stats.characters` and `stats.tags` are required fields and default to 0 when no records exist.
