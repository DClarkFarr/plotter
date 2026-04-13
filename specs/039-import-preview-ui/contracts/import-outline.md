# Contract: Import Outline — Preview UI Extensions

## Endpoint

`POST /imports/outline`  
Content-Type: `multipart/form-data`

---

## Request (mode = preview) — unchanged

| Field       | Type   | Description                       |
| ----------- | ------ | --------------------------------- |
| `file`      | File   | The `.docx` document to parse.    |
| `mode`      | string | Must be `"preview"`.              |
| `storyName` | string | Optional override for story name. |

No `customizations` field is sent for preview.

---

## Request (mode = create) — extended

| Field            | Type   | Description                                                                                             |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `file`           | File   | The `.docx` document to parse.                                                                          |
| `mode`           | string | Must be `"create"`.                                                                                     |
| `storyName`      | string | Optional override for story name.                                                                       |
| `customizations` | string | JSON-encoded `ImportCustomizations` object (see schema below). Optional; defaults to no customizations. |

### ImportCustomizations schema

```json
{
  "ignoredCharacterIds": ["character_1"],
  "characterMerges": {
    "character_2": "character_1"
  },
  "plotTagIds": ["tag_3"]
}
```

| Field                 | Type                     | Description                                                                                         |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `ignoredCharacterIds` | `string[]`               | Parsed character IDs to exclude entirely from the import.                                           |
| `characterMerges`     | `Record<string, string>` | Alias-to-target mapping; scenes referencing a key will use the target character instead.            |
| `plotTagIds`          | `string[]`               | Parsed tag IDs to convert to Plot documents; variant-syntax tags in this list are silently ignored. |

---

## Response (mode = preview) — extended

Returns the same shape as before, now with parsed content arrays for rendering the preview tabs.

```json
{
  "mode": "preview",
  "summary": "3 acts, 5 chapters, 12 scenes, 4 characters, 6 tags",
  "storyName": "My Novel",
  "elements": [
    { "id": "act_1", "type": "act", "title": "Act 1", "content": [] },
    {
      "id": "chapter_1",
      "type": "chapter",
      "title": "Chapter 1",
      "content": []
    },
    {
      "id": "scene_1",
      "type": "scene",
      "title": "The Confrontation",
      "povCharacterId": "character_1",
      "tagIds": ["tag_1", "tag_2"],
      "characterIds": ["character_1"],
      "snippets": [],
      "content": []
    }
  ],
  "tags": [
    { "id": "tag_1", "name": "Tension", "variant": null, "color": null },
    { "id": "tag_2", "name": "POV", "variant": "Alice", "color": null }
  ],
  "characters": [
    { "id": "character_1", "name": "Alice" },
    { "id": "character_2", "name": "Bob" }
  ],
  "issues": []
}
```

---

## Response (mode = create) — unchanged shape

```json
{
  "mode": "create",
  "summary": "12 scenes created",
  "storyName": "My Novel",
  "message": "Import completed",
  "storyId": "abc123"
}
```

On customization-driven plot creation, the `summary` string will reflect the actual counts (e.g., plots created vs tags created).

---

## Error Cases

| Status | Condition                                                     |
| ------ | ------------------------------------------------------------- |
| 400    | Missing `file`, invalid `mode`, unparseable `customizations`. |
| 413    | File exceeds 5 MB limit.                                      |
| 422    | Create mode but parse errors exist.                           |
| 500    | DB write failure (story is rolled back).                      |
