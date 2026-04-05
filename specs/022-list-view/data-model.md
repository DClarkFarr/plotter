# Data Model: List View

## Story

- **id**: string
- **title**: string
- **description**: string | null

## Plot

- **id**: string
- **title**: string
- **color**: string
- **storyId**: string
- **horizontalIndex**: number

## Scene

- **id**: string
- **title**: string
- **description**: string (HTML)
- **plotId**: string
- **tags**: string[]
- **tagVariants**: { tagId: string; variant: string }[]
- **todo**: { text: string; isDone: boolean }[]
- **verticalIndex**: number
- **pov**: string | null

## Character

- **id**: string
- **title**: string
- **imageUrl**: string | null

## Tag

- **id**: string
- **name**: string
- **color**: string
- **variants**: string[]

## List View UI State

- **displayMode**: "normal" | "filterExcluded"

## Derived View Models

### OrderedSceneEntry

- **scene**: Scene
- **plot**: Plot
- **orderKey**: [verticalIndex, plot.horizontalIndex, scene.id]

## Validation Rules

- `verticalIndex` is a non-negative integer.
- `horizontalIndex` is a non-negative integer.
- Scenes are ordered by `verticalIndex`, then `horizontalIndex`.
- Completed todo items are displayed after incomplete items in list view.
