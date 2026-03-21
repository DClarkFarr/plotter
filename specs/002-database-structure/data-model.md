# Data Model

## Conventions

- `id`: MongoDB `ObjectId` stored as `_id` in documents.
- `createdAt`: required `Date` for all collections.
- `updatedAt`: optional `Date` for mutable collections.
- Relative IDs use `ObjectId` references (stored as `ObjectId` values).

## Service and Model Boundaries

- Models expose CRUD and single-collection helpers only.
- Cross-collection validation and orchestration live in domain services.
- If a model method needs related data, the service passes the related document as input.

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
- `deletedAt`: Date?
- `createdAt`: Date
- `updatedAt`: Date?

**Validation**

- At least one `users` entry with `role = "owner"`.
- All `userId` references must exist.
- `deletedAt` set indicates a soft-deleted story (excluded by default queries).

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
- Ordering conflicts are resolved by shifting existing plots down to make room.

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
- Ordering conflicts are resolved by shifting existing scenes down to make room.

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
