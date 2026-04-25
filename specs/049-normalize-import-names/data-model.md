# Data Model: Import Name Standardization

## Scope

This feature adds normalization behavior and reporting for imported tag and character names. It does not introduce new MongoDB collections.

## Entities

### Imported Name Token

- Description: Raw tag or character name extracted from the source document.
- Fields:
  - `entityType`: `"tag" | "character"`
  - `rawValue`: string (original text from document)
  - `trimmedValue`: string
  - `normalizedKey`: string (case-insensitive key used for dedupe)
  - `canonicalValue`: string (display-safe standardized value)

### Standardized Name

- Description: Canonical representation used for persisted/imported display and matching.
- Fields:
  - `entityType`: `"tag" | "character"`
  - `canonicalValue`: string
  - `normalizedKey`: string
  - `source`: `"existing" | "created"`
  - `resolvedId`: string (DB id in create mode, parser id in preview mode)

### Name Consolidation Mapping

- Description: Record of raw input variants merged into one standardized value.
- Fields:
  - `entityType`: `"tag" | "character"`
  - `canonicalValue`: string
  - `normalizedKey`: string
  - `rawVariants`: string[]
  - `consolidatedCount`: number
  - `reusedExisting`: boolean

### Import Normalization Report

- Description: User-visible summary returned with preview/create results.
- Fields:
  - `tags`: Name Consolidation Mapping[]
  - `characters`: Name Consolidation Mapping[]
  - `counts`:
    - `tagVariantsConsolidated`: number
    - `characterVariantsConsolidated`: number
    - `newNamesCreated`: number
    - `existingNamesReused`: number

## Relationships

- Multiple Imported Name Tokens map to one Standardized Name via `normalizedKey`.
- One Standardized Name has one Name Consolidation Mapping entry per import run.
- Import Normalization Report groups mappings by entity type.

## Validation Rules

- `normalizedKey` is required and must be deterministic for equivalent case/whitespace variants.
- `canonicalValue` is required and non-empty after trim.
- `rawVariants` must include at least one original value.
- `consolidatedCount` must equal `rawVariants.length`.

## State Transitions

1. `Extracted`:
   - Raw names parsed from document.
2. `Normalized`:
   - `normalizedKey` and `canonicalValue` generated.
3. `Resolved`:
   - Matched to existing DB record or marked for creation.
4. `Persisted` (create mode only):
   - IDs finalized and scene references mapped.
5. `Reported`:
   - Consolidation mappings included in import result response.
