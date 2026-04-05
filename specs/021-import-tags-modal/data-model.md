# Data Model

## Existing Entities

### Story

- Purpose: Owns tags and serves as the import source or destination.
- Key identifiers: `id` (ObjectId).

### Tag

- Collection: `tags`
- Fields:
  - `name`: string
  - `color`: string
  - `variant`: boolean
  - `variants`: string[]
  - `storyId`: ObjectId
  - `createdAt`: date
  - `updatedAt`: date
- Constraints:
  - Unique index on `(storyId, name)`

## New Request/Response Shapes (API)

### TagImportRequest

- `fromStoryId`: string
- `toStoryId`: string
- `tagIds`: string[]

### TagImportResult

- `createdTags`: Tag[]
- `skippedTagIds`: string[] (already existed by name)

## Notes

- No schema changes required; import creates new Tag documents using existing fields.
