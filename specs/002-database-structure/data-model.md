# Data Model

## Conventions

- `id`: MongoDB `ObjectId` stored as `_id` in documents.
- `createdAt`: required `Date` for all collections.
- `updatedAt`: optional `Date` for mutable collections.
- Relative IDs use `ObjectId` references (stored as `ObjectId` values).

## Users

**Fields**

- `firstName`: string
- `lastName`: string
- `email`: string (unique, lowercased)
- `passwordHash`: string (bcrypt hash)
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- `email` must be unique and valid format.
- `passwordHash` must be present (no plaintext password stored).

**Indexes**

- Unique index on `email`.

## Stories

**Fields**

- `title`: string
- `description`: string
- `users`: array of permission objects
  - `userId`: ObjectId (ref Users)
  - `role`: "owner" | "editor"
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- At least one `users` entry with `role = "owner"`.
- All `userId` references must exist.

**Indexes**

- Index on `users.userId` for membership lookup.

## Tags

**Fields**

- `name`: string
- `color`: string
- `variant`: boolean
- `variants`: string[]
- `storyId`: ObjectId (ref Stories)
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- `storyId` must exist.
- `name` required; `variants` optional when `variant` is false.

**Indexes**

- Index on `storyId`.
- Optional unique index on (`storyId`, `name`) to prevent duplicates per story.

## Plots

**Fields**

- `title`: string
- `description`: string (rich text content)
- `color`: string
- `storyId`: ObjectId (ref Stories)
- `horizontalIndex`: number (0-based)
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- `storyId` must exist.
- `horizontalIndex` must be >= 0.

**Indexes**

- Index on `storyId`.
- Optional unique index on (`storyId`, `horizontalIndex`).

## Scenes

**Fields**

- `title`: string
- `description`: string (rich text content)
- `plotId`: ObjectId (ref Plots)
- `tags`: ObjectId[] (refs Tags)
- `todo`: array of objects
  - `text`: string
  - `isDone`: boolean
- `scene`: string? (rich text content)
- `verticalIndex`: number (0-based)
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- `plotId` must exist.
- All `tags` references must exist and belong to the same story.
- `verticalIndex` must be >= 0.

**Indexes**

- Index on `plotId`.
- Optional unique index on (`plotId`, `verticalIndex`).

## Sessions

**Fields**

- `userId`: ObjectId (ref Users)
- `token`: string (random, unique)
- `payload`: object
- `createdAt`: Date
- `expiresAt`: Date
- `updatedAt`: Date?

**Validation**

- `userId` must exist.
- `expiresAt` must be in the future on creation.

**Indexes**

- Unique index on `token`.
- TTL index on `expiresAt` to auto-expire sessions.

## State Transitions

- Session: `active` -> `ended` (manual deletion) or `expired` (TTL cleanup).
