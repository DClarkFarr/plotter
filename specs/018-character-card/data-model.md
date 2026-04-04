# Data Model: Character Card

## Entities

### Character

- **Description**: A story character shown in scenes and the character management UI.
- **Key Fields**:
  - id
  - name
  - description
  - imageId (optional)
  - imageUrl (derived or stored)

### Character Image

- **Description**: The primary artwork associated with a character.
- **Key Fields**:
  - id
  - storageUrl
  - width/height (optional metadata)
  - updatedAt

## Relationships

- A Character optionally references one Character Image.

## Validation Rules

- Character name is required.
- Character image is optional; when missing, the card shows a placeholder state.
- Image uploads must use supported file types and surface errors on failure.

## State Transitions

- Character image can transition from missing -> uploaded.
- Character image can transition from existing -> replaced.

## Notes

- No new persistence entities are required; this feature reuses existing character and asset storage.
