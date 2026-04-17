# Tasks: Duplicate Story Card

**Input**: Design documents from `/specs/042-duplicate-story-card/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are relative to the repo root

---

## Phase 1: Foundational — Backend Duplication Engine

**Purpose**: All seven model-level duplication functions + service + route. Blocks US2 and US3 from end-to-end testing. US1 (dropdown UI) can be developed independently of this phase.

**⚠️ CRITICAL**: US2 placeholder and US3 completion cannot be fully validated until this phase is complete.

- [x] T001 [P] Add `duplicateStory(sourceId, ownerId, session?)` to `express/src/models/stories.ts` — fetches source doc and inserts a new `StoryDocument` with title `"Copy of {sourceTitle}"`, copied `description`, fresh timestamps, and `users: [{ userId: ownerId, role: "owner" }]`; returns the new `StoryDocument`
- [x] T002 [P] Add `duplicateTagsByStory(sourceStoryId, targetStoryId, session?)` to `express/src/models/tags.ts` — lists all tags for the source story, bulk-inserts copies with the new `storyId`, and returns `Map<oldHex, newObjectId>` mapping source tag IDs to new tag IDs
- [x] T003 [P] Add `duplicateCharactersByStory(sourceStoryId, targetStoryId, session?)` to `express/src/models/characters.ts` — lists all characters for the source story, bulk-inserts copies (all fields verbatim including `imageUrl`), and returns `Map<oldHex, newObjectId>`
- [x] T004 [P] Add `duplicateColorsByStory(sourceStoryId, targetStoryId, session?)` to `express/src/models/colors.ts` — lists all `resourceType: "story"` colors for the source, bulk-inserts copies with the new `resourceId`; no return value required (no downstream consumers)
- [x] T005 [P] Add `duplicatePlotsByStory(sourceStoryId, targetStoryId, session?)` to `express/src/models/plots.ts` — lists all plots sorted by `horizontalIndex`, bulk-inserts copies with the new `storyId`, and returns `Map<oldHex, newObjectId>` mapping source plot IDs to new plot IDs
- [x] T006 Add `duplicateScenesByPlots(sourcePlotIds, plotMap, tagMap, charMap, session?)` to `express/src/models/scenes.ts` — lists all non-deleted scenes for the source plot IDs, bulk-inserts copies with remapped `plotId` (from `plotMap`), `tags` (from `tagMap`, drop any absent), `tagVariants[].tagId` (from `tagMap`), and `pov` (from `charMap` or `null`); all other fields copied verbatim
- [x] T007 [P] Add `duplicateSectionsByStory(sourceStoryId, targetStoryId, session?)` to `express/src/models/sections.ts` — lists all sections for the source story, bulk-inserts copies with the new `storyId` and all fields verbatim
- [x] T008 Create `express/src/services/storyDuplicateService.ts` with exported function `duplicateStoryForOwner(sourceStoryId, ownerId)` — validates source story exists and is not soft-deleted, then runs the full duplication sequence inside `getClient().withTransaction()` in order: `duplicateStory` → `duplicateTagsByStory` → `duplicateCharactersByStory` → `duplicateColorsByStory` → `duplicatePlotsByStory` → `duplicateScenesByPlots` → `duplicateSectionsByStory`; returns the new `StoryDocument`
- [x] T009 Add `POST /:storyId/duplicate` route to `express/src/routers/storyRouter.ts` — require auth, validate `:storyId` param, assert user has access to source story, call `duplicateStoryForOwner`, build and return `{ story: toStoryResponse(newStory) }` with HTTP 201; return 404 if story not found or soft-deleted, 403 if user lacks access

**Checkpoint**: Backend fully functional — `POST /api/stories/:storyId/duplicate` returns a 201 with the duplicated story and all assets are present in the database.

---

## Phase 2: User Story 1 — Ellipsis Icon + Dropdown on Story Card (Priority: P1) 🎯 MVP

**Goal**: Every story card on the dashboard shows a horizontal ellipsis icon next to the existing view-story arrow. Clicking it opens a dropdown with a "Duplicate story" option.

**Independent Test**: Load the dashboard, confirm the "..." icon is visible on each card, click it, and verify a dropdown appears with "Duplicate story" as the first item. No backend work required to validate this story.

- [x] T010 [US1] Update `web/src/components/dashboard/StoryCard.tsx` — add `onDuplicate: (story: Story) => void` and `isDuplicating?: boolean` props; add an `mdi:dots-horizontal` icon button to the card's action area (next to the existing arrow icon); wire the button to open a Flowbite `Dropdown` component containing a single "Duplicate story" item that calls `onDuplicate(story)` on click; disable the ellipsis button when `isDuplicating` is `true` to prevent repeat clicks; stop click propagation on the ellipsis button so it does not trigger the card's `onClick` (view story)

**Checkpoint**: US1 independently testable — dropdown visible and functional on every story card with no backend connection needed.

---

## Phase 3: User Story 2 — Optimistic Placeholder Card While Duplicating (Priority: P2)

**Goal**: Clicking "Duplicate story" immediately inserts a spinner placeholder card at the end of the story grid before the API call resolves.

**Independent Test**: With or without a real backend running, click "Duplicate story" and confirm a spinner/loading card appears in the grid immediately (the card may stay forever if the API is unavailable, but it must appear instantly on click).

- [x] T011 [P] [US2] Add `duplicateStory(storyId: string): Promise<Story>` API function to `web/src/api/stories.ts` — issues `POST /stories/:storyId/duplicate`, maps the `{ story }` response to the `Story` type, uses `toApiError` for error normalization
- [x] T012 [P] [US2] Extend `web/src/store/dashboardStore.ts` — add `duplicatingStoryIds: Set<string>` field, `addDuplicatingId(id: string)` action, and `removeDuplicatingId(id: string)` action to the Zustand store
- [x] T013 [P] [US2] Create `web/src/components/dashboard/DuplicatingCard.tsx` — renders a card-sized placeholder with an animated spinner and "Duplicating…" label; styled to match the existing card dimensions and rounded border, using muted/slate tones similar to the page-load skeleton
- [x] T014 [US2] Update `web/src/components/dashboard/StoryGrid.tsx` — add `duplicatingStoryIds: Set<string>` and `onDuplicateStory: (story: Story) => void` props; pass `isDuplicating={duplicatingStoryIds.has(story.id)}` and `onDuplicate={onDuplicateStory}` to each `StoryCard`; render one `DuplicatingCard` at the end of the grid for each entry in `duplicatingStoryIds`
- [x] T015 [US2] Add `useDuplicateStoryMutation()` to `web/src/hooks/useStories.ts` — `mutationFn` calls `duplicateStory(storyId)`; `onMutate` calls `addDuplicatingId(storyId)`; `onSuccess` calls `removeDuplicatingId(variables)` and `queryClient.invalidateQueries({ queryKey: ["stories"] })`; `onError` calls `removeDuplicatingId(variables)`; the hook reads store actions via `useDashboardStore`
- [x] T016 [US2] Wire duplication into `web/src/pages/dashboard.tsx` — read `duplicatingStoryIds`, `addDuplicatingId`, `removeDuplicatingId` from `useDashboardStore`; instantiate `useDuplicateStoryMutation`; add `handleDuplicate(story: Story)` that calls `duplicateStoryMutation.mutate(story.id)`; pass `duplicatingStoryIds` and `onDuplicateStory={handleDuplicate}` to `StoryGrid`

**Checkpoint**: US2 independently testable — clicking "Duplicate story" causes a spinner card to appear immediately in the grid; clicking a second time on the same story is disabled while the first duplication is in progress.

---

## Phase 4: User Story 3 — Duplication Completion: New Card + Toast (Priority: P3)

**Goal**: When the server confirms duplication, the placeholder is removed, the new story card appears highlighted, and a "story created" toast is shown. On failure, the placeholder is removed and an error toast is shown.

**Independent Test**: With a real backend running, complete a full duplication and verify: the spinner card disappears, the new story card appears with the `isNew` sky-blue glow, and the "story created" toast fires. Also verify that if the API returns an error, the spinner card disappears and an error toast is shown.

- [x] T017 [US3] Add per-call `onSuccess` and `onError` callbacks to the `handleDuplicate` mutation call in `web/src/pages/dashboard.tsx` — `onSuccess(newStory)`: call `setRecentlyImportedId(newStory.id)` (reuses existing highlight state) and `alert.success("story created")`; `onError`: call `alert.error("Unable to duplicate story")`

**Checkpoint**: Full duplication lifecycle working end-to-end — trigger, placeholder, completion, highlight, and toast all function correctly.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T018 [P] Validate that the Flowbite `Dropdown` in `StoryCard` closes correctly on outside click and on Escape key (Flowbite should handle this natively — verify no additional event handling is needed)
- [x] T019 Run `quickstart.md` validation checklist to confirm all deliverables are implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No external dependencies — start immediately
- **US1 (Phase 2)**: No dependencies — can start in parallel with Phase 1
- **US2 (Phase 3)**: Depends on Phase 2 (T010, for `onDuplicate` prop) + T011/T012/T013 can start in parallel with Phase 1
- **US3 (Phase 4)**: Depends on Phase 1 (backend working) + Phase 3 complete
- **Polish (Phase 5)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Independent of all backend work
- **US2 (P2)**: Depends on US1 (T010) for full integration; store/component/hook work (T011–T013) can start in parallel with Phase 1
- **US3 (P3)**: Depends on Phase 1 (backend) + Phase 3 (full hook + wiring)

### Parallel Opportunities Per Phase

**Phase 1 (start all in parallel)**:

```
T001 ──┐
T002 ──┤
T003 ──┼──▶ T008 ──▶ T009
T004 ──┤
T005 ──┤
T007 ──┘
T006 (independently)
```

**Phase 3 (start T011/T012/T013 in parallel, then sequence)**:

```
T011 ──┐
T012 ──┼──▶ T015 ──▶ T016
T013 ──▶ T014 ─────────┘
```

---

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (all phases required for a shippable feature — the three user stories are tightly coupled at runtime).

**Suggested implementation order for solo developer**:

1. T001–T007 together (all model functions in parallel per file)
2. T008 → T009 (service then route)
3. T010 (StoryCard dropdown — can be done anytime after T001–T007 starts)
4. T011–T013 (API client, store, DuplicatingCard — parallel)
5. T014 → T015 → T016 (sequential StoryGrid → hook → dashboard wiring)
6. T017 (complete the dashboard callbacks)
7. T018–T019 (polish)
