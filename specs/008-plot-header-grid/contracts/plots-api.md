# Plot Header API Contract

## Overview

This contract defines story-scoped plot create and update operations used by the plot header grid.

## Endpoints

### Create plot

`POST /stories/:storyId/plots`

**Request**

```json
{
  "title": "Plot A",
  "description": "Plot description",
  "color": "#94A3B8",
  "horizontalIndex": 2
}
```

**Response 201**

```json
{
  "plot": {
    "id": "plot_123",
    "title": "Plot A",
    "description": "Plot description",
    "color": "#94A3B8",
    "storyId": "story_123",
    "horizontalIndex": 2,
    "scenes": []
  }
}
```

### Update plot

`PATCH /stories/:storyId/plots/:plotId`

**Request**

```json
{
  "title": "Plot A (Updated)",
  "description": "New description",
  "color": "#1E40AF",
  "horizontalIndex": 1
}
```

**Response 200**

```json
{
  "plot": {
    "id": "plot_123",
    "title": "Plot A (Updated)",
    "description": "New description",
    "color": "#1E40AF",
    "storyId": "story_123",
    "horizontalIndex": 1,
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
}
```

## Error Responses

**Response 4xx/5xx**

```json
{
  "error": "Message describing the error"
}
```
