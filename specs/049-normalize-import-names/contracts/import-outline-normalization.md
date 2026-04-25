# API Contract Addendum: Import Name Normalization

## Endpoint

`POST /import/outline`

This addendum extends the import response contract for normalization outcomes. Existing request fields remain unchanged.

## Request

No required request shape changes.

- Existing fields remain: `file`, `mode`, `importType`, `storyName`, `customizations`.

## Response Additions

### New `normalization` object

Returned in both preview and create responses when import parsing succeeds.

```jsonc
{
  "mode": "preview",
  "storyName": "Sample",
  "summary": "...",
  "normalization": {
    "tags": [
      {
        "canonicalName": "Battle",
        "rawVariants": ["BATTLE", "battle", " Battle "],
        "consolidatedCount": 3,
        "reusedExisting": false,
      },
    ],
    "characters": [
      {
        "canonicalName": "John Doe",
        "rawVariants": ["JOHN DOE", "John Doe", " john doe"],
        "consolidatedCount": 3,
        "reusedExisting": true,
      },
    ],
    "counts": {
      "tagVariantsConsolidated": 2,
      "characterVariantsConsolidated": 2,
      "newNamesCreated": 1,
      "existingNamesReused": 1,
    },
  },
}
```

### Field Definitions

- `normalization.tags[]`:
  - `canonicalName`: string
  - `rawVariants`: string[]
  - `consolidatedCount`: number
  - `reusedExisting`: boolean
- `normalization.characters[]`:
  - same shape as tags
- `normalization.counts`:
  - `tagVariantsConsolidated`: number
  - `characterVariantsConsolidated`: number
  - `newNamesCreated`: number
  - `existingNamesReused`: number

## Behavior Rules

- Case-only and leading/trailing-whitespace-only variants must be treated as one logical name.
- `canonicalName` must be the persisted display value used for mapping references.
- `rawVariants` must preserve the input strings as observed during parse.
- When no variants are consolidated for an entity type, that entity list may be empty.

## Compatibility Notes

- Existing clients ignoring unknown fields remain compatible.
- Existing fields (`elements`, `tags`, `plots`, `characters`, `issues`) remain unchanged.
