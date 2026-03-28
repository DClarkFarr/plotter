# Characters API Contract

## Overview

This contract defines the endpoints needed to list and create story characters for POV selection.

## Endpoints

### List characters for a story

`GET /stories/:storyId/characters`

**Response 200**

```json
{
  "characters": [
    {
      "id": "char_123",
      "storyId": "story_456",
      "title": "Mara",
      "description": "Captain of the airship",
      "imageUrl": "https://cdn.example.com/avatars/mara.png"
    }
  ]
}
```

### Create character

`POST /stories/:storyId/characters`

**Request**

```json
{
  "title": "Mara",
  "description": "Captain of the airship",
  "imageUrl": null
}
```

**Response 201**

```json
{
  "character": {
    "id": "char_123",
    "storyId": "story_456",
    "title": "Mara",
    "description": "Captain of the airship",
    "imageUrl": null
  }
}
```

## Error Responses

**Response 4xx/5xx**

```json
{
  "error": "Message describing the error"
}
```
