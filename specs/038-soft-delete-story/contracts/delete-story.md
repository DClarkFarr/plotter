# API Contract: Delete Story

## Endpoint

```
DELETE /api/stories/:storyId
```

## Authentication

Requires a valid authenticated user session. The `userId` is extracted from the session via `requireUserId(req)`.

## Authorization

The requesting user must have any role (`owner` or `editor`) on the story. If not, the server returns `403 Forbidden`.

## Path Parameters

| Parameter | Type                  | Required | Description                        |
| --------- | --------------------- | -------- | ---------------------------------- |
| `storyId` | string (ObjectId hex) | Yes      | The ID of the story to soft-delete |

## Request Body

None.

## Success Response

**Status**: `204 No Content`

**Body**: Empty.

## Error Responses

| Status                      | Body                                   | Condition                                  |
| --------------------------- | -------------------------------------- | ------------------------------------------ |
| `401 Unauthorized`          | `{ "error": "Unauthorized" }`          | No valid session                           |
| `403 Forbidden`             | `{ "error": "Forbidden" }`             | User has no access to this story           |
| `404 Not Found`             | `{ "error": "Story not found" }`       | Story does not exist or is already deleted |
| `500 Internal Server Error` | `{ "error": "Internal server error" }` | Unexpected failure                         |

## Side Effects

- The story's `deletedAt` field is set to the current UTC timestamp.
- The story's `updatedAt` field is updated.
- The story will be excluded from all subsequent `GET /stories` and `GET /stories/:storyId` responses.
- No child records (scenes, plots, sections, tags, characters) are modified.

## Idempotency

Not idempotent: a second `DELETE` on the same `storyId` returns `404` because the story is filtered out by default queries.
