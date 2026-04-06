# Data Model: Filter Visibility Modes

## Entities

### FilterVisibilityMode

- **Type**: Enum
- **Values**: `hide`, `minify`
- **Description**: Determines how excluded scenes render in the UI while filters are active.

### FilteredSceneResult

- **Type**: Value object
- **Fields**:
  - `plotsFiltered`: `Plot[]` (plots with scenes removed per filters)
  - `includedSceneIds`: `string[]` (scene IDs that match filters)
- **Description**: Output from the shared filter helper used by grid and list views.

### Excluded Scene (derived)

- **Type**: Derived state
- **Rule**: A scene is excluded if its ID is not in `includedSceneIds` while filters are active.

## Relationships

- `FilterVisibilityMode` is UI state associated with the story filter controls.
- `FilteredSceneResult` is computed from `Plot[]` and active filters and used by rendering components.
