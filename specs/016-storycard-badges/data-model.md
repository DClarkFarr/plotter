# Data Model: Story Card Count Badges

## Entities

### Story Summary

- **Description**: Dashboard-ready representation of a story.
- **Fields**:
  - `id`: Unique identifier
  - `title`: Story title
  - `description`: Optional summary text
  - `ownerId`: Owner user id
  - `stats`: Story Counts
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp or null

### Story Counts

- **Description**: Metric bundle for counts displayed on story cards.
- **Fields**:
  - `plots`: number
  - `scenes`: number
  - `characters`: number
  - `tags`: number

## Relationships

- Story Summary includes one Story Counts object.
- Story Counts are derived from story-associated records (plots, scenes, characters, tags).

## Validation Rules

- All count values are non-negative integers.
- Missing count values default to 0 in API responses.
