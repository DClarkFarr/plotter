# API Contracts: Color Palette System

Base path: `/api/stories/:storyId/colors`  
All endpoints require authenticated session. `storyId` must be accessible to the requesting user.

---

## GET /api/stories/:storyId/colors

Returns the story's color palette. If the story has no colors yet, the seed cascade runs transparently (copy from user → copy from defaults) before returning.

### Request

No body. Auth cookie required.

### Response — 200 OK

```json
[
  {
    "id": "664abc123def4567890aaaa1",
    "color": "#ef4444",
    "sortOrder": 1,
    "ignored": false
  },
  {
    "id": "664abc123def4567890aaaa2",
    "color": "#f97316",
    "sortOrder": 2,
    "ignored": false
  },
  ...
]
```

Array is always length 10, sorted by `sortOrder` ascending.

### Error Responses

| Status | Condition                               |
| ------ | --------------------------------------- |
| `401`  | No valid session                        |
| `403`  | User does not have access to this story |
| `404`  | Story not found                         |

---

## PATCH /api/stories/:storyId/colors/:colorId

Updates a single palette entry. Accepts any combination of `color`, `ignored`, and `sortOrder`.

### Request Body

```json
{
  "color": "#22c55e",
  "ignored": false,
  "sortOrder": 3
}
```

All fields are optional. At least one field must be present.

| Field       | Type    | Validation                       |
| ----------- | ------- | -------------------------------- |
| `color`     | string  | Must match `/^#[0-9a-fA-F]{6}$/` |
| `ignored`   | boolean | —                                |
| `sortOrder` | integer | Must be in `[1, 10]`             |

**Note on sortOrder updates**: When a reorder operation moves color A to position P where another color B currently occupies P, the caller is responsible for sending PATCH requests for all affected entries (swapping sort orders). The endpoint does not auto-shift other entries.

### Response — 200 OK

```json
{
  "id": "664abc123def4567890aaaa3",
  "color": "#22c55e",
  "sortOrder": 3,
  "ignored": false
}
```

Returns the updated entry.

### Error Responses

| Status | Condition                                                                  |
| ------ | -------------------------------------------------------------------------- |
| `400`  | Validation error (invalid hex, sortOrder out of range, no fields provided) |
| `401`  | No valid session                                                           |
| `403`  | User does not have access to this story                                    |
| `404`  | Story not found, or colorId does not belong to this story                  |

---

## Field Notes

- `color` is always stored and returned as 7-character lowercase hex (`#rrggbb`). The frontend must normalize 3-digit shorthands and uppercase letters before sending.
- `ignored: true` colors are excluded by `ColorPaletteDropdown` but remain in the collection and are returned by GET (so the palette panel can show and manage them).
- `sortOrder` values 1–10 are stable slots. No gaps are created or filled by normal operations.
