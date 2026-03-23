# Data Model: Story Page Data Hookup

## Story

- **id**: string
- **title**: string
- **description**: string | null
- **ownerId**: string
- **stats**: { plots: number; scenes: number }
- **createdAt**: ISO string
- **updatedAt**: ISO string | null

## Tag

- **id**: string
- **name**: string
- **color**: string
- **variant**: boolean
- **variants**: string[]
- **storyId**: string

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

## Story UI State (Zustand)

- **filters**: { tagIds: string[] }
- **cardSize**: "sm" | "md" | "lg"
- **cardDisplay**: "grid" | "list"

## Validation Rules

- `cardSize` and `cardDisplay` must be one of the allowed values.
- `filters.tagIds` is empty when no tag filters are applied.
- `horizontalIndex` and `verticalIndex` are non-negative integers.
