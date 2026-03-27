# Scenes API Contract

## Overview

This contract defines the endpoints needed to create and update scenes from the story dashboard.

## Endpoints

### Create scene

`POST /stories/:storyId/plots/:plotId/scenes`

**Request**

```json
{
  "title": "Scene 1 in Plot A",
  "description": "",
  "scene": "<p>Draft scene text</p>",
  "tags": ["tag_123"],
  "todo": [{ "text": "Draft beat", "isDone": false }],
  "verticalIndex": 0
}
```

**Response 201**

```json
{
  "scene": {
    "id": "scene_456",
    "title": "Scene 1 in Plot A",
    "description": "",
    "plotId": "plot_123",
    "tags": ["tag_123"],
    "todo": [{ "text": "Draft beat", "isDone": false }],
    "scene": "<p>Draft scene text</p>",
    "verticalIndex": 0
  }
}
```

### Update scene

`PATCH /stories/:storyId/scenes/:sceneId`

**Request**

```json
{
  "title": "Updated Scene Title",
  "description": "Updated description",
  "scene": "<p>Updated scene text</p>",
  "tags": ["tag_123", "tag_789"],
  "todo": [{ "text": "Beat 1", "isDone": true }],
  "verticalIndex": 1
}
```

**Response 200**

```json
{
  "scene": {
    "id": "scene_456",
    "title": "Updated Scene Title",
    "description": "Updated description",
    "plotId": "plot_123",
    "tags": ["tag_123", "tag_789"],
    "todo": [{ "text": "Beat 1", "isDone": true }],
    "scene": "<p>Updated scene text</p>",
    "verticalIndex": 1
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
