# Story Page API Contract

## Overview

This contract defines the story page endpoints needed to fetch story details, tags, plots with scenes, and update story metadata.

## Endpoints

### Get story

`GET /stories/:storyId`

**Response 200**

```json
{
  "story": {
    "id": "story_123",
    "title": "My Story",
    "description": "A short summary of the story.",
    "ownerId": "user_123",
    "stats": {
      "plots": 3,
      "scenes": 12
    },
    "createdAt": "2026-03-21T12:00:00Z",
    "updatedAt": "2026-03-21T12:00:00Z"
  }
}
```

### Update story

`PATCH /stories/:storyId`

**Request**

```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response 200**

```json
{
  "story": {
    "id": "story_123",
    "title": "Updated Title",
    "description": "Updated description",
    "ownerId": "user_123",
    "stats": {
      "plots": 3,
      "scenes": 12
    },
    "createdAt": "2026-03-21T12:00:00Z",
    "updatedAt": "2026-03-22T09:10:00Z"
  }
}
```

### List story tags

`GET /stories/:storyId/tags`

**Response 200**

```json
{
  "tags": [
    {
      "id": "tag_123",
      "name": "Protagonist",
      "color": "#FFB703",
      "variant": false,
      "variants": [],
      "storyId": "story_123"
    }
  ]
}
```

### List story plots (with scenes)

`GET /stories/:storyId/plots`

**Response 200**

```json
{
  "plots": [
    {
      "id": "plot_123",
      "title": "Plot A",
      "description": "Plot description",
      "color": "#219EBC",
      "storyId": "story_123",
      "horizontalIndex": 0,
      "scenes": [
        {
          "id": "scene_456",
          "title": "Scene A",
          "description": "Scene description",
          "plotId": "plot_123",
          "tags": ["tag_123"],
          "todo": [{ "text": "Draft beat", "isDone": false }],
          "scene": null,
          "verticalIndex": 0
        }
      ]
    }
  ]
}
```

## Error Responses

**Response 4xx/5xx**

```json
{
  "error": "Message describing the error"
}
```
