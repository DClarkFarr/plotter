# Data Model: Scene POV Selection

## Entities

### Story

- **id**: unique identifier
- **title**: story name

### Character

- **id**: unique identifier
- **storyId**: reference to Story
- **title**: character name
- **description**: optional character summary
- **imageUrl**: optional avatar image reference
- **createdAt / updatedAt**: timestamps

**Validation rules**:

- `title` is required and non-empty.
- `storyId` must reference an existing story.

### Scene

- **id**: unique identifier
- **plotId**: reference to Plot
- **title**: scene title
- **description**: scene summary
- **tags**: tag references
- **todo**: list of todo items
- **scene**: rich text content
- **verticalIndex**: ordering index
- **pov**: optional reference to Character
- **createdAt / updatedAt**: timestamps

**Validation rules**:

- `pov` is optional.
- If provided, `pov` must reference a character that belongs to the same story as the scene's plot.

## Relationships

- Story 1 -> N Characters
- Plot 1 -> N Scenes
- Scene 0..1 -> 1 Character (POV)
