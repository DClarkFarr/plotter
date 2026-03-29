# API Contracts: Assets Management

## Characters

### List characters

- **Method**: GET
- **Path**: `/stories/:storyId/characters`
- **Response 200**:

```json
{
  "characters": [
    {
      "id": "string",
      "storyId": "string",
      "title": "string",
      "description": "string | null",
      "imageUrl": "string | null"
    }
  ]
}
```

### Create character

- **Method**: POST
- **Path**: `/stories/:storyId/characters`
- **Body**:

```json
{
  "title": "string",
  "description": "string (optional)",
  "imageUrl": "string (optional, relative)"
}
```

- **Response 201**:

```json
{
  "character": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "description": "string | null",
    "imageUrl": "string | null"
  }
}
```

### Update character

- **Method**: PATCH
- **Path**: `/stories/:storyId/characters/:characterId`
- **Body** (at least one field required):

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "imageUrl": "string (optional, relative)"
}
```

- **Response 200**:

```json
{
  "character": {
    "id": "string",
    "storyId": "string",
    "title": "string",
    "description": "string | null",
    "imageUrl": "string | null"
  }
}
```

- **Response 400**: `{ "error": "Update payload is empty" }`
- **Response 404**: `{ "error": "Character not found" }`

### Delete character

- **Method**: DELETE
- **Path**: `/stories/:storyId/characters/:characterId`
- **Response 204**: No body
- **Response 409**: `{ "error": "Character is assigned to scenes" }`
- **Response 404**: `{ "error": "Character not found" }`

## Tags

### Update tag name

- **Method**: PATCH
- **Path**: `/stories/:storyId/tags/:tagId`
- **Body**:

```json
{
  "name": "string"
}
```

- **Response 200**:

```json
{
  "tag": {
    "id": "string",
    "storyId": "string",
    "name": "string",
    "color": "string",
    "variant": "boolean",
    "variants": ["string"]
  }
}
```

## Uploads

### Upload character image

- **Method**: POST
- **Path**: `/uploads/characters`
- **Content-Type**: `multipart/form-data`
- **Form fields**:
  - `file` (required)

- **Response 201**:

```json
{
  "url": "/uploads/characters/<filename>",
  "contentType": "image/*"
}
```

- **Response 400**: `{ "error": "Invalid file type" }`
- **Response 413**: `{ "error": "File too large" }`
