# API Contract: Section Endpoints (Updated)

**Feature**: 034-section-sidebar-edit  
**Change type**: Additive — existing endpoints extended with optional `description` field

---

## PATCH /stories/:storyId/sections/:sectionId

Updates a section. All fields are optional.

### Request Body (updated)

```json
{
  "title": "Act I",
  "type": "act",
  "verticalIndex": 0,
  "description": "<p>Opening act establishing the hero's ordinary world.</p>"
}
```

| Field           | Type                 | Required | Notes                                                              |
| --------------- | -------------------- | -------- | ------------------------------------------------------------------ |
| title           | string               | no       | Non-empty after trim                                               |
| type            | `"act" \| "section"` | no       |                                                                    |
| verticalIndex   | number               | no       | Non-negative integer                                               |
| **description** | string               | no       | **NEW** — HTML string from WYSIWYG editor; omit to leave unchanged |

### Response Body (updated)

```json
{
  "section": {
    "id": "abc123",
    "storyId": "story456",
    "title": "Act I",
    "verticalIndex": 0,
    "type": "act",
    "description": "<p>Opening act establishing the hero's ordinary world.</p>"
  },
  "shiftedResources": {
    "scenes": [],
    "sections": []
  }
}
```

`description` is `null` when not set.

---

## POST /stories/:storyId/sections

Creates a section. `description` is accepted but optional (sections are typically created without a description).

### Request Body (updated)

```json
{
  "title": "Act I",
  "type": "act",
  "verticalIndex": 0,
  "description": "<p>Optional initial description.</p>"
}
```

### Response Body

Same shape as PATCH response. `description` is `null` when not provided.

---

## GET /stories/:storyId/sections

No change to request. Response now includes `description` on each section object.

### Response Body (updated)

```json
{
  "sections": [
    {
      "id": "abc123",
      "storyId": "story456",
      "title": "Act I",
      "verticalIndex": 0,
      "type": "act",
      "description": null
    }
  ]
}
```

---

## DELETE /stories/:storyId/sections/:sectionId

No changes. Existing contract is sufficient.

---

## Backward Compatibility

All changes are fully backward-compatible:

- Existing sections without `description` return `description: null`
- Clients that do not send `description` in PATCH/POST are unaffected
- No breaking changes to existing fields
