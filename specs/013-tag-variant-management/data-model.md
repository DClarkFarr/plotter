# Data Model: Tag Variant Management

## Entities

### Tag

- **id**: string
- **name**: string
- **color**: string
- **variant**: boolean (true when this tag can have variants)
- **variants**: string[] (variant labels)
- **storyId**: string

### SceneTagSelection

- **tagId**: string
- **variant**: string | null (selected variant label, only when tag is a variant)

### Scene

- **id**: string
- **tags**: string[] (selected tag IDs)
- **tagVariants**: SceneTagSelection[] (selected variant per tag, optional)

## Relationships

- A **Tag** belongs to one **Story**.
- A **Tag** can list multiple **variants** (string labels).
- A **Scene** can select many **Tags** and can optionally store one selected **variant** per tag.

## Validation Rules

- Variant labels are unique within a single Tag.
- A SceneTagSelection.variant must be one of the parent Tag.variants.
- A variant cannot be deleted if any SceneTagSelection references it.
