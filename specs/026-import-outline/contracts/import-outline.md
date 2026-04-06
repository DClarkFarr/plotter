# Contract: Import Outline Upload

## Endpoint

`POST /api/imports/outline`

## Auth

- Requires a logged-in user session.
- Story access is not required; the import creates a new story on approval.

## Request

**Content-Type**: `multipart/form-data`

**Fields**:

- `mode`: string, required. Allowed values: `preview`, `create`.
- `file`: .docx file, required.

## Response

### Success: Preview

**Status**: 200

```json
{
  "mode": "preview",
  "summary": "TODO",
  "storyId": null
}
```

### Success: Create

**Status**: 201

```json
{
  "mode": "create",
  "summary": "TODO",
  "message": "Import completed",
  "storyId": "NEW_STORY_ID"
}
```

### Errors

- **400**: Invalid mode, missing file, or invalid file type.
- **404**: Not used for this endpoint.
- **413**: File too large.
- **500**: Unexpected error.
