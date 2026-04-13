# Tasks: Soft Delete Story

**Input**: Design documents from `/specs/038-soft-delete-story/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**No tests** — not requested per project constitution.

---

## Phase 1: Foundational — Backend Delete Endpoint (Blocking Prerequisite)

**Purpose**: Wire the `softDeleteStoryById` model function through the service and router layers. No frontend work can complete without this.

**⚠️ CRITICAL**: US1 and US2 frontend work depends on this phase being complete.

- [x] T001 Add `softDeleteStoryForUser()` to `express/src/services/storyService.ts` — import `softDeleteStoryById` from models, gate with `getStoryForUser`, return `false` if not found
- [x] T002 Add `DELETE /:storyId` route to `express/src/routers/storyRouter.ts` — import `softDeleteStoryForUser`, return 204 on success, 404 if not found

**Checkpoint**: `DELETE /api/stories/:storyId` returns 204 on success and 404 for unknown/deleted stories. Backend is independently testable via curl/REST client.

---

## Phase 2: User Story 1 — Delete Story UI (Priority: P1) 🎯 MVP

**Goal**: User can delete a story from `StoryHeading` edit mode via a Danger Zone section and confirmation modal; on success they are redirected to the dashboard and the story is gone from the list.

**Independent Test**: Open any story → enter edit mode → click "Delete Story" → confirm in modal → redirected to `/dashboard` → story not in the list.

- [x] T003 [P] [US1] Add `DeleteStoryResponse` interface to `web/src/api/types.ts` alongside `DeleteSceneResponse`
- [x] T004 [P] [US1] Add `deleteStory(storyId)` API function to `web/src/api/stories.ts` — `DELETE /stories/:storyId`, throw `toApiError` on failure
- [x] T005 [US1] Add `useDeleteStoryMutation(storyId)` hook to `web/src/queries/story/story-mutations.ts` — optimistic removal from `["stories"]` cache on `onMutate`; `removeQueries` for `["story", storyId]` prefix + `invalidateQueries` for `["stories"]` on `onSuccess`; rollback on `onError` (depends on T003, T004)
- [x] T006 [US1] Update `web/src/components/story/StoryHeading.tsx` — add Danger Zone panel + confirmation modal + `useDeleteStoryMutation` + `useNavigate` → navigate to `/dashboard` after confirm (depends on T005)

**Checkpoint**: Full delete flow works end-to-end. User can delete a story and is redirected. Deleted story absent from dashboard. Error state shows inline message without closing modal.

---

## Phase 3: User Story 2 — Deleted Stories Excluded from All Queries (Priority: P2)

**Goal**: Confirm that soft-deleted stories are invisible throughout the application without any additional query changes.

**Independent Test**: Delete a story, reload the dashboard and any related lists — the deleted story must not appear anywhere.

- [x] T007 [US2] Verify `buildStoryFilter` in `express/src/models/stories.ts` uses `{ deletedAt: { $exists: false } }` and confirm it is applied in `listStories`, `listStoriesByIds`, and `getStoryById` — no code changes expected; this is a read-through verification task before marking US2 complete

**Checkpoint**: All standard story queries exclude soft-deleted stories by default. No code changes needed — behaviour already exists; this task confirms and documents it.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US1)**: T003 and T004 depend on Phase 1 completing. T003/T004 can run in parallel. T005 depends on T003+T004. T006 depends on T005.
- **Phase 3 (US2)**: Independent verification — can be done any time after Phase 1

### Parallel Opportunities

Within Phase 2:

- T003 and T004 can be implemented simultaneously (different files, no interdependency)
- T005 waits for T003+T004
- T006 waits for T005

### Story Execution (single developer)

```
T001 → T002   [Phase 1 complete]
         ↓
T003 ┐
T004 ┘ → T005 → T006   [US1 complete]

T007   [US2 — verify only, any time after T002]
```

---

## Implementation Strategy

**MVP scope**: Complete Phase 1 + Phase 2 (US1). This delivers the full user-facing feature.

**Phase 3 (US2)** is a verification pass — the filtering behaviour already exists in the model layer; no new code is required. It exists as a task to ensure the existing behaviour is confirmed before closure.

**Total tasks**: 7 (2 backend, 4 frontend, 1 verification)
**Parallelizable**: T003 + T004 (frontend API layer — different files)
