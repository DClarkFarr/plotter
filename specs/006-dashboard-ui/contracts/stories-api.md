# Stories API Contract

## Overview

This contract defines the story endpoints needed by the dashboard for listing and creating stories.

## Endpoints

### List stories

`GET /stories`

**Response 200**

```json
{
  "stories": [
    {
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
  ]
}
```

### Create story

`POST /stories`

**Request**

```json
{
  "title": "My Story"
}
```

**Response 201**

```json
{
  "story": {
    "id": "story_123",
    "title": "My Story",
    "description": "A short summary of the story.",
    "ownerId": "user_123",
    "stats": {
      "plots": 0,
      "scenes": 0
    },
    "createdAt": "2026-03-21T12:00:00Z",
    "updatedAt": "2026-03-21T12:00:00Z"
  }
}
```

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

## Error Responses

**Response 4xx/5xx**

```json
{
  "error": "Message describing the error"
}
```
