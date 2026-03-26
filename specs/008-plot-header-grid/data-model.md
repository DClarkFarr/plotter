# Data Model: Plot Header Grid Enhancements

## Plot

- **id**: string
- **title**: string
- **description**: string
- **color**: string
- **storyId**: string
- **horizontalIndex**: number
- **scenes**: Scene[]

## Scene

- **id**: string
- **title**: string
- **description**: string
- **plotId**: string
- **tags**: string[]
- **todo**: { text: string; isDone: boolean }[]
- **scene**: string | null
- **verticalIndex**: number

## Plot Header UI State (Client)

- **mode**: "view" | "edit" | "create"
- **draftTitle**: string
- **draftDescription**: string
- **draftColor**: string
- **isDirty**: boolean
- **error**: string | null

## Validation Rules

- `title` is required when creating or saving a plot.
- `horizontalIndex` is a non-negative integer.
- `draftTitle` becomes dirty when the value differs from the existing plot title.
- Empty scene cards are disabled when `plot` is undefined.
