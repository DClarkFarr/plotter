# Quickstart: Import Name Standardization

## Goal

Validate that import normalizes tag and character names, deduplicates case-only variants, and reports consolidation outcomes.

## Prerequisites

- Backend running: `cd express && npm run dev`
- Frontend running: `cd web && npm run dev`
- Import feature available via dashboard import modal

## Test Data Suggestions

Use a `.docx` containing repeated character and tag variants such as:

- Characters: `JOHN DOE`, `John Doe`, `john   doe`
- Tags: `BATTLE`, `Battle`, `battle`
- Acronym-style names: `FBI Agent`, `NASA Liaison`

## Validation Flow

1. Run preview import (modern mode) with variant-rich document.
2. Confirm preview returns one standardized character/tag per equivalence class.
3. Confirm preview shows normalization report with consolidated raw variants.
4. Run create import.
5. Confirm story data has no case-variant duplicate tags or characters.
6. Re-import the same file (or same names with different casing).
7. Confirm no new duplicate tag/character records are created.
8. Confirm create response feedback includes consolidation results.

## Regression Checks

1. Legacy import mode still succeeds and applies normalization rules.
2. Import with no tags or no characters still succeeds without normalization errors.
3. Existing customization paths (`ignoredCharacterIds`, `characterMerges`, plots config) remain functional.

## Build Checks

1. `cd express && npm run build`
2. `cd web && npm run build`

## Expected Outcome

- Case-only and whitespace-only variants map to one stored standardized name.
- Import feedback explicitly lists consolidated variants for tags and characters.
- Repeat imports do not create new case-variant duplicates.
