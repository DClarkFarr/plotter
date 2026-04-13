# Quickstart: Soft Delete Story

## What this feature adds

A "Danger Zone" delete button inside `StoryHeading` (edit mode) that soft-deletes the story, with an explicit confirmation modal. Deleted stories are excluded from all standard queries system-wide.

## Backend changes (express/)

### 1. New service function — `storyService.ts`

Add `softDeleteStoryForUser(storyId, userId)`:

- Validates the user has access via `getStoryForUser`
- Calls `softDeleteStoryById` from the model
- Returns `false` if story not found, `true` on success

### 2. New route — `storyRouter.ts`

```
DELETE /:storyId
```

- Calls `softDeleteStoryForUser`
- Returns `204` on success, `404` if not found

## Frontend changes (web/)

### 1. API function — `api/stories.ts`

Add `deleteStory(storyId: string): Promise<void>` calling `DELETE /stories/:storyId`.

### 2. Response type — `api/types.ts`

Add `DeleteStoryResponse { deleted: true }` (for consistency; actual response is 204 with no body).

### 3. Mutation hook — `queries/story/story-mutations.ts`

Add `useDeleteStoryMutation(storyId, onSuccess)`:

- `onMutate`: optimistically removes the story from `["stories"]` list cache
- `onSuccess`: calls `queryClient.removeQueries({ queryKey: ["story", storyId], exact: false })` to purge all story sub-caches, calls `onSuccess()` callback for navigation
- `onError`: restores previous `["stories"]` cache

### 4. UI — `components/story/StoryHeading.tsx`

Inside the edit-mode render:

- Add Danger Zone section below the form fields:
  ```
  [rose border panel]
    DANGER ZONE      [Delete Story button (red)]
  ```
- Add confirm modal (follows `SceneForm.tsx` pattern exactly):
  - Header: "Are you sure you want to delete?"
  - Body: warning message, Cancel + "Yes, delete story" buttons
- On confirm: call `deleteStoryMutation.mutateAsync()` then navigate to `/dashboard`
- Both buttons disabled while `deleteStoryMutation.isPending`
- Show inline error on failure without closing the modal

## Testing the feature

1. Open any story → click edit (pencil icon)
2. Scroll to the rose-bordered Danger Zone section
3. Click "Delete Story" → confirm modal appears
4. Click "Cancel" → modal closes, no change
5. Click "Yes, delete story" → redirected to `/dashboard`, story no longer listed
6. Navigate back to the story URL directly → story page shows not-found or redirects
