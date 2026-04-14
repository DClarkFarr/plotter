# API Contract: POST /imports/outline

## Endpoint

`POST /imports/outline`  
Content-Type: `multipart/form-data`

---

## Request Fields

| Field            | Type     | Required | Description                                   |
| ---------------- | -------- | -------- | --------------------------------------------- |
| `file`           | File     | yes      | `.docx` file to parse / import                |
| `mode`           | `string` | yes      | `"preview"` or `"create"`                     |
| `storyName`      | `string` | no       | Override name for the created story           |
| `customizations` | `string` | no       | JSON-serialized `ImportCustomizations` object |

### `customizations` JSON schema (updated)

```jsonc
{
  "ignoredCharacterIds": ["string"], // character IDs to skip
  "characterMerges": { "fromId": "toId" }, // remap source → target character
  "plots": [
    {
      "id": "string", // tag ID; "main_plot_id" for the synthetic Main plot
      "name": "string", // plot title
      "color": "string", // hex colour, e.g. "#729cfd"
      "isDefaultPlot": true, // exactly one should be true
      "ignored": false, // if true, plot is not created in DB
    },
  ],
}
```

**Validation rules**:

- `plots` must be an array (can be empty)
- Each entry must have `id` (string), `name` (string), `color` (string), `isDefaultPlot` (boolean), `ignored` (boolean)
- At most one entry may have `isDefaultPlot: true`

---

## Response — preview mode (`200 OK`)

```jsonc
{
  "mode": "preview",
  "storyName": "string",
  "summary": "string",
  "elements": [
    /* ImportOutlineParseElement[] */
  ],
  "tags": [
    /* ImportOutlineParseTag[] */
  ],
  "characters": [
    /* ImportOutlineParseCharacter[] */
  ],
  "issues": [
    /* ImportOutlineParseIssue[] */
  ],
}
```

## Response — create mode (`201 Created`)

```jsonc
{
  "mode": "create",
  "storyName": "string",
  "summary": "string",
  "message": "Import completed",
  "storyId": "string",
}
```

## Error Responses

| Status | Condition                                                                         |
| ------ | --------------------------------------------------------------------------------- |
| `400`  | Missing required fields, invalid mode, invalid `customizations` JSON or structure |
| `413`  | File exceeds 5 MB                                                                 |
| `422`  | Parse/validation errors in document (returned with issues array)                  |
| `500`  | DB write failure (story creation rolled back)                                     |

---

## Breaking Changes from Previous Version

- `customizations.plotTagIds` (string array) is **removed**.
- `customizations.plots` (array of objects) is **added** in its place.
- Clients sending the old `plotTagIds` field will receive a `400` validation error.
