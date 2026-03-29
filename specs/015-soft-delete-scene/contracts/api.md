# API Contracts: Soft Delete Scene

## Scenes

### Soft delete scene

- **Method**: DELETE
- **Path**: `/stories/:storyId/scenes/:sceneId`
- **Response 204**: No body
- **Response 404**: `{ "error": "Scene not found" }`

## Story plots

### List story plots with scenes

- **Method**: GET
- **Path**: `/stories/:storyId/plots`
- **Behavior**: Returns only active scenes (scenes with `deletedAt` unset).
- **Response 200**: Unchanged schema; deleted scenes omitted from `plots[].scenes`.
