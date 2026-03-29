# Data Model: Assets Management

## Entities

### Story

- **Purpose**: Container for tags and characters.
- **Key fields**: `id`, `title`, `description`, `users`, `createdAt`, `updatedAt`.
- **Relationships**:
  - One-to-many with `Tag`.
  - One-to-many with `Character`.

### Tag

- **Purpose**: Label for scene categorization within a story.
- **Key fields**: `id`, `storyId`, `name`, `color`, `variant`, `variants[]`.
- **Validation**:
  - `name` required, unique per story.
  - `variants` entries are non-empty strings.

### Character

- **Purpose**: Story participant with optional image and description.
- **Key fields**: `id`, `storyId`, `title`, `description?`, `imageUrl?`.
- **Validation**:
  - `title` required, non-empty.
  - `imageUrl` stored as a relative path (e.g., `/uploads/characters/...`).

### Scene

- **Purpose**: Plot unit that references tags and a POV character.
- **Key fields**: `id`, `plotId`, `title`, `description`, `tags[]`, `tagVariants[]`, `pov?`.
- **Relationships**:
  - Many-to-many with `Tag` via `tags[]`.
  - Optional one-to-one with `Character` via `pov`.

## Relationship Rules

- Tags and characters must belong to the same story as the scene or plot that references them.
- A character is considered "assigned" when referenced by at least one scene `pov`.
- Character deletion is blocked when assignment exists.
