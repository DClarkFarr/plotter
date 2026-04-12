# Contract: Import Outline — Create Mode

**Endpoint**: `POST /api/import/outline`  
**Consumes**: `multipart/form-data`  
**Produces**: `application/json`  
**Auth**: Session cookie required

---

## Request

| Field       | Type     | Required | Description                                        |
|-------------|----------|----------|----------------------------------------------------|
| `file`      | File     | Yes      | `.docx` file, max 5 MB                             |
| `mode`      | string   | Yes      | `"create"` — triggers database persistence         |
| `storyName` | string   | No       | Override for story title; falls back to filename   |

---

## Response — Success (200)

```json
{
  "mode": "create",
  "summary": "3 acts, 8 chapters, 24 scenes",
  "message": "Import completed",
  "storyId": "<ObjectId as hex string>",
  "storyName": "My Novel"
}
```

| Field       | Type            | Description                                         |
|-------------|-----------------|-----------------------------------------------------|
| `mode`      | `"create"`      | Echoes the request mode                             |
| `summary`   | `string`        | Human-readable count of created elements            |
| `message`   | `string`        | `"Import completed"` on success                     |
| `storyId`   | `string`        | Hex ObjectId of the newly created story             |
| `storyName` | `string`        | Final story title used                              |

---

## Response — Parse Errors Present (200, no DB writes)

When the document has `level: "error"` issues, the server returns the preview result instead of creating anything:

```json
{
  "mode": "create",
  "summary": "...",
  "storyName": "...",
  "elements": [...],
  "tags": [...],
  "characters": [...],
  "issues": [
    { "level": "error", "message": "No scenes found", "location": null }
  ]
}
```

---

## Response — Empty Import (422)

When the parsed document contains no scene elements (FR-012):

```json
{
  "message": "The document contains no scenes and cannot be imported"
}
```

---

## Response — Transaction Failure (500)

When the database transaction fails after all parse checks pass:

```json
{
  "message": "Import failed. No data was saved."
}
```

---

## Response — File Errors

| Status | Condition                          | Body                                    |
|--------|------------------------------------|-----------------------------------------|
| 400    | `mode` missing or invalid          | `{ "message": "mode is required" }`    |
| 400    | No file attached                   | `{ "message": "file is required" }`    |
| 413    | File exceeds 5 MB                  | `{ "message": "File too large" }`      |
| 415    | File is not `.docx`                | `{ "message": "File must be a .docx document" }` |

---

## Unchanged Behaviour: Preview Mode (mode = "preview")

Not modified by this feature. Returns `elements`, `tags`, `characters`, `issues` for the UI to display.
