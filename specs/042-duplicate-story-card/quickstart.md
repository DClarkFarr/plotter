# Quickstart: Duplicate Story Card

**Feature**: 042-duplicate-story-card  
**Date**: 2026-04-16

---

## What This Feature Does

Adds a "Duplicate story" action to each story card on the dashboard. Clicking it copies the story and all its assets (colors, characters, tags, plots, scenes, sections) atomically. The UI shows a spinner placeholder card while duplication runs, then replaces it with the new story card (highlighted) and shows a "story created" toast.

---

## Deliverables

### Backend

1. **New model functions** (each accepts `ClientSession?`, returns documents or ID maps):
   - `models/stories.ts` → `duplicateStory(sourceId, ownerId, session?)`
   - `models/tags.ts` → `duplicateTagsByStory(sourceId, targetId, session?)`
   - `models/characters.ts` → `duplicateCharactersByStory(sourceId, targetId, session?)`
   - `models/colors.ts` → `duplicateColorsByStory(sourceId, targetId, session?)`
   - `models/plots.ts` → `duplicatePlotsByStory(sourceId, targetId, session?)`
   - `models/scenes.ts` → `duplicateScenesByPlots(sourcePlotIds, plotMap, tagMap, charMap, session?)`
   - `models/sections.ts` → `duplicateSectionsByStory(sourceId, targetId, session?)`

2. **New service**: `services/storyDuplicateService.ts`
   - `duplicateStoryForOwner(sourceStoryId, ownerId)` — runs the full duplication sequence inside a MongoDB transaction

3. **New route** on `storyRouter.ts`:
   - `POST /api/stories/:storyId/duplicate` → calls `duplicateStoryForOwner`, returns `{ story }` with HTTP 201

### Frontend

4. **API client**: `api/stories.ts` → `duplicateStory(storyId: string): Promise<Story>`

5. **Hook**: `hooks/useStories.ts` → `useDuplicateStoryMutation()`
   - On mutate: calls `addDuplicatingId(storyId)`
   - On success: `removeDuplicatingId`, `invalidateQueries(["stories"])`, `setRecentlyCreatedId(newStory.id)`, `alert.success("story created")`
   - On error: `removeDuplicatingId`, `alert.error(...)`

6. **Store**: `store/dashboardStore.ts`
   - Add `duplicatingStoryIds: Set<string>` + `addDuplicatingId` + `removeDuplicatingId`

7. **New component**: `components/dashboard/DuplicatingCard.tsx`
   - Skeleton card with spinner and "Duplicating…" label

8. **Updated component**: `components/dashboard/StoryCard.tsx`
   - Add ellipsis (`...`) icon button alongside the existing arrow icon
   - Ellipsis opens a Flowbite `Dropdown` with a "Duplicate story" item
   - Calls `onDuplicate(story)` prop; button is disabled while `isDuplicating` prop is true

9. **Updated component**: `components/dashboard/StoryGrid.tsx`
   - Accept `duplicatingStoryIds: Set<string>` prop
   - Render a `DuplicatingCard` at the end of the list for each entry

10. **Updated page**: `pages/dashboard.tsx`
    - Read `duplicatingStoryIds`, `addDuplicatingId`, `removeDuplicatingId` from store
    - Wire up `useDuplicateStoryMutation`
    - Handle `onDuplicate` from `StoryGrid`

---

## Duplication Execution Order

```
1. duplicateStory()             → new storyId
2. duplicateTagsByStory()       → tagMap
3. duplicateCharactersByStory() → charMap
4. duplicateColorsByStory()     → (no consumers)
5. duplicatePlotsByStory()      → plotMap + sourcePlotIds
6. duplicateScenesByPlots()     → uses plotMap, tagMap, charMap
7. duplicateSectionsByStory()   → standalone
```

All steps run inside a single MongoDB transaction (`client.withTransaction()`).

---

## Prerequisites for Local Development

MongoDB must run in **replica set mode** for transactions to work:

```bash
mongod --replSet rs0
# then in mongo shell: rs.initiate()
```

Or use MongoDB Atlas (transactions supported by default).

---

## Development Notes

- Character images are **not** file-copied. The duplicate character reuses the same `imageUrl`.
- Duplicate title format: `"Copy of {sourceTitle}"`.
- The `DuplicatingCard` placeholder is keyed by the **source** story ID in the store, so multiple concurrent duplications of different stories are supported.
- The `isNew` highlight on `StoryCard` is already used for recently-imported stories — reuse the same prop for the newly duplicated story.
