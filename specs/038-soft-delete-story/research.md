# Research: Soft Delete Story

## Q1: Does the `Story` model already support `deletedAt`?

**Decision**: Yes — `StoryDefinition` already has `deletedAt?: Date` and `softDeleteStoryById` already exists in `express/src/models/stories.ts`. `buildStoryFilter(false)` returns `{ deletedAt: { $exists: false } }` and is applied in `listStories`, `listStoriesByIds`, and `getStoryById`, so all existing story lookups already exclude soft-deleted stories.

**Rationale**: No model changes are needed. The pattern diverges slightly from scenes (which use `deletedAt: null`) — scenes store `null` explicitly on create, stories simply omit the field. This is consistent with the current code and requires no migration.

**Alternatives considered**: Using `deletedAt: null` (scene approach) would require setting the field on `createStory`. The current `$exists: false` approach works correctly for existing documents and new documents without needing a backfill.

---

## Q2: Does the backend already expose a DELETE endpoint for stories?

**Decision**: No — there is no `DELETE /:storyId` route in `storyRouter.ts`. A new route must be added that calls `softDeleteStoryById` via a service-layer function.

**Rationale**: `softDeleteStoryById` exists in the model layer but is not wired into any router. The service layer already has `getStoryForUser` for access-control, which should gate the delete call.

**Alternatives considered**: Calling `softDeleteStoryById` directly from the router. Rejected — all routes use services to compose logic and do not call model functions directly (constitution Principle III).

---

## Q3: How should the React Query cache be updated after deletion?

**Decision**: The `useDeleteStoryMutation` hook should:

1. **Optimistically** remove the story from the `["stories"]` list cache immediately on `onMutate`
2. On **success**: call `queryClient.removeQueries({ queryKey: ["story", storyId] })` to discard all story-scoped caches (`["story", storyId]`, `["story", storyId, "scenes"]`, etc.), then navigate to `/dashboard`
3. On **error**: restore the previous `["stories"]` cache value

**Rationale**: Matches the established pattern in `useDeleteSceneMutation` (optimistic `onMutate` + partial rollback on error). Removing the full `["story", storyId]` prefix tree prevents stale data if the user somehow navigates back. `invalidateQueries` would be sufficient but `removeQueries` is cleaner because the story is permanently gone.

**Alternatives considered**: Using `invalidateQueries` only — simpler but leaves stale data in the cache longer. Using only server-side refetch — slower UX.

---

## Q4: How should the UI redirect after deletion?

**Decision**: Use TanStack Router's `useNavigate` hook inside `StoryHeading.tsx`. After `mutateAsync` resolves, call `navigate({ to: "/dashboard" })`.

**Rationale**: TanStack Router is the mandated routing library (constitution). `useParams` is already used inside story components; `useNavigate` is the parallel pattern for imperative navigation.

**Alternatives considered**: Using `window.location.href` — not framework-idiomatic and skips client-side router state.

---

## Q5: Where does the `useDeleteStoryMutation` hook live?

**Decision**: Add it to the existing `web/src/queries/story/story-mutations.ts` file alongside `useUpdateStoryMutation`. Navigation is passed in as a callback parameter (same component handles both state and navigation).

**Rationale**: All story mutation hooks live in `story-mutations.ts`. The `useDeleteSceneMutation` precedent lives in `scene-mutations.ts`. Keeping story mutations co-located avoids spreading mutation logic.

**Alternatives considered**: Adding to `web/src/hooks/useStories.ts` — that file only has `useStoriesQuery` and `useCreateStoryMutation`, which are dashboard-level concerns. Delete is a story-detail-level concern and belongs with the other story mutations.
