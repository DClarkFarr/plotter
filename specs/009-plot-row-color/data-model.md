# Data Model: Plot Row Color Sync

## Entities

- **Plot**: Existing entity containing `color`, used as the source for row theming.
- **Grid Element**: Any UI element rendered within a plot row (scene, empty cell, header).
- **Plot Theme (derived)**: Computed values `{ baseColor, softColor, textColor }` derived from `Plot.color` at render time.

## Notes

- No new persisted data is introduced.
- Theme values are computed on the client per render and do not require backend changes.
