# Data Model: Create Tag Form Reuse

## Entities

### Tag

- **id**: string
- **name**: string
- **color**: string
- **variant**: boolean
- **variants**: string[]
- **storyId**: string

## Relationships

- A **Tag** belongs to a single **Story**.

## Validation Rules

- Tag names are required and trimmed.
- Tag colors must be valid hex color values.
- Tag names are unique within a story.
