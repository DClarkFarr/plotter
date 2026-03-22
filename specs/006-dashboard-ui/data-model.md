# Data Model: User Dashboard

## Entities

### User

- **Purpose**: Represents the authenticated dashboard user.
- **Fields**:
  - `id` (string, required)
  - `firstName` (string, required)
  - `lastName` (string, required)
  - `email` (string, required)
  - `avatarInitials` (string, derived, uppercase)
- **Validation rules**:
  - `firstName` and `lastName` are non-empty strings.
  - `avatarInitials` is derived from name per spec clarifications.

### Story

- **Purpose**: Represents a story displayed in the dashboard grid.
- **Fields**:
  - `id` (string, required)
  - `title` (string, required)
  - `ownerId` (string, required)
  - `createdAt` (timestamp, required)
  - `updatedAt` (timestamp, optional)
- **Validation rules**:
  - `title` is required and non-empty.

## Relationships

- **User 1..N Story**: A user can own many stories; each story has one owner.

## State Transitions

- Story creation: `Draft` (implicit) → `Created` when saved via the create-story modal.
