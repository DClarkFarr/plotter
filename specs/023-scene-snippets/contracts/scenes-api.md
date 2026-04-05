# Scenes API Contract (Snippets)

## Overview

This contract defines the snippet field additions to scene create and update payloads.

## Endpoints

### Create scene

`POST /stories/:storyId/plots/:plotId/scenes`

**Request**

```json
{
  "title": "Scene 1 in Plot A",
  "description": "",
  "tags": ["tag_123"],
  "todo": [{ "text": "Draft beat", "isDone": false }],
  "snippets": [{ "label": "Idea", "text": "<p>Draft line</p>" }],
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
    "snippets": [{ "label": "Idea", "text": "<p>Draft line</p>" }],
    "verticalIndex": 0,
    "pov": null
  }
}
```

### Update scene snippets

`PATCH /stories/:storyId/scenes/:sceneId`

**Request**

```json
{
  "snippets": [{ "label": "Idea", "text": "<p>Updated text</p>" }]
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
    "todo": [{ "text": "Draft beat", "isDone": false }],
    "snippets": [{ "label": "Idea", "text": "<p>Updated text</p>" }],
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
