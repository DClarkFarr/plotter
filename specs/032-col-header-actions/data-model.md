# Data Model: Col Header Row Actions

## Entities

### Column Header

- **Represents**: The header aligned to a specific row index that exposes row-level actions.
- **Key Attributes**: Row index, hover state, available actions.

### Row

- **Represents**: A single grid row identified by index.
- **Key Attributes**: Index, empty/not-empty state.

### Section

- **Represents**: A structured entry in a row with a type.
- **Key Attributes**: Type (act/chapter), name (defaulted from index).

### Story Grid Shift

- **Represents**: A grid-level shift request that moves rows up or down from a start index.
- **Key Attributes**: startIndex, shift (-1 for removal, +1 for insert), scope (story-wide), validation (downward shift requires empty target index).

## Relationships

- Column Header targets a single Row by index.
- A Row may contain a Section of a specific type.

## State Rules

- Clear-empty-row action is available only when the targeted Row is empty.
- Insert above/below and add section actions shift rows as specified in the spec.
- Section rows render within the grid and support inline title edits.
