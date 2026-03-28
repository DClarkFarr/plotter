# Scenes API Contract (POV Update)

## Overview

This contract defines the POV field additions to scene update and response payloads.

## Endpoints

### Update scene POV

`PATCH /stories/:storyId/scenes/:sceneId`

**Request**

```json
{
  "pov": "char_123"
}
```

**Response 200**

```json
{
  "scene": {
    "id": "scene_456",
    "title": "Scene 1",
    "description": "",
    "plotId": "plot_123",
    "tags": ["tag_123"],
    "todo": [{ "text": "Beat 1", "isDone": true }],
    "scene": "<p>Draft scene text</p>",
    "verticalIndex": 0,
    "pov": "char_123"
  }
}
```

### Clear scene POV

`PATCH /stories/:storyId/scenes/:sceneId`

**Request**

```json
{
  "pov": null
}
```

**Response 200**

```json
{
  "scene": {
    "id": "scene_456",
    "title": "Scene 1",
    "description": "",
    "plotId": "plot_123",
    "tags": ["tag_123"],
    "todo": [{ "text": "Beat 1", "isDone": true }],
    "scene": "<p>Draft scene text</p>",
    "verticalIndex": 0,
    "pov": null
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
