# Data Model: Soft Delete Story

## Existing Entity: Story

_No schema changes are required._ The `StoryDefinition` interface already carries:

```ts
deletedAt?: Date;  // undefined = active; Date = soft-deleted
```

The `buildStoryFilter(includeDeleted: false)` helper in `stories.ts` already produces `{ deletedAt: { $exists: false } }`, which is applied by every existing read function (`listStories`, `listStoriesByIds`, `getStoryById`).

`softDeleteStoryById` (already implemented) sets:

```ts
{ $set: { deletedAt: new Date(), updatedAt: new Date() } }
```

### Filtering behaviour

| Scenario                               | Filter used                         | Result       |
| -------------------------------------- | ----------------------------------- | ------------ |
| Active story (no `deletedAt` field)    | `{ deletedAt: { $exists: false } }` | Included     |
| Soft-deleted story (`deletedAt: Date`) | `{ deletedAt: { $exists: false } }` | Excluded     |
| Explicit `includeDeleted: true`        | `{}`                                | All returned |

> Note: This differs from the scenes pattern (`deletedAt: null` default + `deletedAt: null` filter). Stories use `$exists: false` because the field was not pre-populated with `null` on existing records. Do not change this behavior — it works correctly as-is.

## New Service Function

### `softDeleteStoryForUser(storyId, userId): Promise<boolean>`

Lives in `express/src/services/storyService.ts`.

Responsibilities:

1. Call `getStoryForUser(storyId, userId)` — throws `AuthError(403)` if user has no access; returns `null` if story not found.
2. If `null`, return `false` (story not found).
3. Call `softDeleteStoryById(storyId)` from the model.
4. Return `true` on success.

## New API Endpoint

```
DELETE /stories/:storyId
```

- Auth: `requireUserId(req)`
- Success: `204 No Content`
- Not found: `404 { error: "Story not found" }`

## Frontend Type

```ts
// No response body for 204, but define a minimal type for consistency:
export interface DeleteStoryResponse {
  deleted: true;
}
```
