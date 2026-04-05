# Data Model: Scene Snippets

## Scene

- **id**: string
- **title**: string
- **description**: string (HTML)
- **plotId**: string
- **tags**: string[]
- **tagVariants**: { tagId: string; variant: string }[]
- **todo**: { text: string; isDone: boolean }[]
- **snippets**: Snippet[]
- **verticalIndex**: number
- **pov**: string | null

## Snippet

- **label**: string
- **text**: string (HTML)

## UI State

- **expandedSnippetId**: string | null (tracks which snippet is expanded in the sidebar)
- **isAddSnippetModalOpen**: boolean

## Validation Rules

- `label` is required and trimmed before saving.
- `text` is stored as HTML from TipTap.
- `snippets` preserves list order as stored on the scene.
- `snippets` defaults to an empty array when missing.
