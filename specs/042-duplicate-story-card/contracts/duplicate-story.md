# API Contract: Duplicate Story

**Feature**: 042-duplicate-story-card  
**Phase**: 1 — Design  
**Date**: 2026-04-16

---

## Endpoint

```
POST /api/stories/:storyId/duplicate
```

### Authentication

Requires an authenticated session. The session user becomes the sole owner of the duplicated story.

### Path Parameters

| Parameter | Type   | Required | Description                                 |
| --------- | ------ | -------- | ------------------------------------------- |
| `storyId` | string | Yes      | MongoDB ObjectId hex string of source story |

### Request Body

None.

### Success Response

**Status**: `201 Created`

```json
{
  "story": {
    "id": "664abc123def456789012345",
    "title": "Copy of My Story",
    "description": "Original description is copied verbatim",
    "ownerId": "664000000000000000000001",
    "stats": {
      "plots": 3,
      "scenes": 42,
      "characters": 5,
      "tags": 8
    },
    "createdAt": "2026-04-16T10:00:00.000Z",
    "updatedAt": null
  }
}
```

The `stats` object reflects the actual counts of duplicated assets (plots, scenes,
characters, tags) in the new story at the time of creation.

### Error Responses

| Status | Condition                                                              |
| ------ | ---------------------------------------------------------------------- |
| `401`  | User is not authenticated                                              |
| `403`  | Authenticated user does not have access to source story                |
| `404`  | Source story does not exist or has been soft-deleted                   |
| `500`  | Duplication failed (transaction rolled back, no partial state created) |

**Error body** (consistent with existing API error shape):

```json
{
  "error": "Story not found"
}
```

---

## Notes

- The endpoint re-uses the existing `StoryResponse` shape (same as `POST /api/stories`).
- The title is always auto-generated as `"Copy of {sourceTitle}"`.
- Character image files are not copied — the duplicate character retains the same `imageUrl` as the source.
- The operation is atomic: either all assets are duplicated or none (MongoDB transaction).
