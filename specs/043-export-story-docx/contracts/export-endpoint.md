# API Contract: Export Story to .docx

**Feature**: 043-export-story-docx  
**Phase**: 1 — Design  
**Date**: 2026-04-16

---

## Endpoint

```
POST /stories/:storyId/export/docx
```

---

## Authentication

- Requires a valid user session (same `requireUserId` middleware used on all story routes).
- The story's `users[]` array must include the authenticated user id.
- Returns `401` if not authenticated, `403 / 404` if the story is not found or not owned.

---

## Path Parameters

| Parameter | Type                                  | Required | Description         |
| --------- | ------------------------------------- | -------- | ------------------- |
| `storyId` | `string` (MongoDB ObjectId as string) | Yes      | The story to export |

---

## Request Body

None. The endpoint takes no request body.

---

## Success Response

**Status**: `200 OK`

**Headers**:

```http
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="<sanitized-story-title>.docx"
Transfer-Encoding: chunked  (or Content-Length if buffered)
```

**Body**: Binary `.docx` file.

---

## Error Responses

| Status | Condition                            | Body                             |
| ------ | ------------------------------------ | -------------------------------- |
| `401`  | No valid session                     | `{ "error": "Unauthorized" }`    |
| `404`  | Story not found or not owned by user | `{ "error": "Story not found" }` |
| `500`  | Docx assembly failure                | `{ "error": "Export failed" }`   |

---

## Example Request (axios / frontend)

```ts
const response = await apiClient.post(
  `/stories/${storyId}/export/docx`,
  undefined,
  { responseType: "blob" },
);

const url = URL.createObjectURL(new Blob([response.data]));
const link = document.createElement("a");
link.href = url;
link.download = `${storyTitle}.docx`;
link.click();
URL.revokeObjectURL(url);
```

---

## Document Structure (docx body)

The assembled document follows this structure:

```
[Title]   Story title           (Heading: Title style)

[H1]      Act name              (one per act section, in verticalIndex order)
          Act description       (optional, rich text)

  [H2]    Chapter name          (one per chapter section)
          Chapter description   (optional, rich text)

    [H3]  Scene title           (in verticalIndex order within context)
          Plot name             (small-caps, muted colour)
          POV: Character name   (if set)
          [Tag1] [Tag2]         (colour-shaded labels)
          Scene description     (rich text, with bold/italic/lists preserved)
          SNIPPET LABEL         (small-caps, muted)
          Snippet body text     (monospaced, rich text)
          ...
    [H3]  Next scene
    ...

[H1]      Next act
...
```

> Scenes and sections are interleaved in `verticalIndex` ascending order, matching the list view exactly.

---

## Implementation Notes

- The filename is derived from `story.title` via `sanitizeFilename()` (see data-model.md §7).
- The endpoint does **not** use `res.download()` (requires a file path). It calls `res.set(headers)` then `res.send(buffer)` with the `Buffer` from `Packer.toBuffer(doc)`.
- Response time target: under 15 s for ≤ 50 scenes (SC-003).
