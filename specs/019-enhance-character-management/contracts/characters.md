# Contracts: Character Management

## Endpoints

### GET /stories/:storyId/characters

**Response**

```json
{
  "characters": [
    {
      "id": "string",
      "storyId": "string",
      "title": "string",
      "description": "string | null",
      "imageUrl": "string | null",
      "characteristics": {
        "description": "string",
        "history": "string",
        "height": "string",
        "weight": "string",
        "age": "string",
        "hair": "string",
        "eyeColor": "string",
        "mantra": "string",
        "skinColor": "string",
        "build": "string"
      },
      "customCharacteristics": [{ "label": "string", "value": "string" }],
      "lists": [
        { "label": "strengths", "items": ["string"] },
        { "label": "weaknesses", "items": ["string"] }
      ]
    }
  ]
}
```

### POST /stories/:storyId/characters

**Request**

```json
{
  "title": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "characteristics": {
    "description": "string",
    "history": "string",
    "height": "string",
    "weight": "string",
    "age": "string",
    "hair": "string",
    "eyeColor": "string",
    "mantra": "string",
    "skinColor": "string",
    "build": "string"
  },
  "customCharacteristics": [{ "label": "string", "value": "string" }],
  "lists": [{ "label": "strengths", "items": ["string"] }]
}
```

**Response**

```json
{
  "character": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "description": "string | null",
    "imageUrl": "string | null",
    "characteristics": { "description": "string" },
    "customCharacteristics": [],
    "lists": []
  }
}
```

### PATCH /stories/:storyId/characters/:characterId

**Request**

```json
{
  "title": "string",
  "description": "string | null",
  "imageUrl": "string | null",
  "characteristics": { "height": "string" },
  "customCharacteristics": [{ "label": "string", "value": "string" }],
  "lists": [{ "label": "weaknesses", "items": ["string"] }]
}
```

**Response**

```json
{
  "character": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "description": "string | null",
    "imageUrl": "string | null",
    "characteristics": { "height": "string" },
    "customCharacteristics": [],
    "lists": []
  }
}
```

## Notes

- Omitted fields are not updated; clients should exclude optional fields rather than sending `null`.
- Custom characteristics and lists are saved as ordered arrays, allowing UI sort order to persist.
