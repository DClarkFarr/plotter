# Data Model: Create Scene Editor Flow

## Scene

- **id**: string
- **title**: string
- **description**: string
- **plotId**: string
- **tags**: string[]
- **todo**: { text: string; isDone: boolean }[]
- **scene**: string | null
- **verticalIndex**: number

## Plot

- **id**: string
- **title**: string
- **description**: string
- **color**: string
- **storyId**: string
- **horizontalIndex**: number

## Tag

- **id**: string
- **name**: string
- **color**: string
- **variant**: boolean
- **variants**: string[]
- **storyId**: string

## Todo Item

- **text**: string
- **isDone**: boolean

## Scene Editor UI State (Zustand)

- **selectedSceneId**: string | null
- **isSidebarOpen**: boolean
- **isTagModalOpen**: boolean
- **tagSelections**: string[]
- **todoDraft**: { text: string; isDone: boolean }[]
- **isSaving**: boolean
- **error**: string | null

## Validation Rules

- `verticalIndex` is a non-negative integer.
- `title` is required when creating or saving a scene.
- `todoDraft` preserves item order as displayed.
- `tagSelections` must contain tag IDs that belong to the story.
