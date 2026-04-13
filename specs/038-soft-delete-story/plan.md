# Implementation Plan: Soft Delete Story

**Branch**: `038-soft-delete-story` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/038-soft-delete-story/spec.md`

## Summary

Add soft-deletion to stories: set a `deletedAt` timestamp on the story record and exclude deleted stories from all default queries. Wire a `DELETE /stories/:storyId` endpoint to the existing `softDeleteStoryById` model function via a new service method. On the frontend, add a "Danger Zone" section with confirmation modal inside `StoryHeading` (edit mode), matching the scene deletion UI pattern. After a successful delete, remove all story caches and navigate to the dashboard.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 — express/, React — web/)
**Primary Dependencies**: Express, MongoDB (express/); TanStack Query, TanStack Router, Flowbite React, Tailwind CSS (web/)
**Storage**: MongoDB — `stories` collection
**Testing**: None required (per constitution)
**Target Platform**: Node.js server + Vite SPA
**Project Type**: Web application (fullstack — Express API + React SPA)
**Performance Goals**: <200ms p95 API response (per constitution)
**Constraints**: No cascading deletes; no restore UI; `exactOptionalPropertyTypes` enabled
**Scale/Scope**: Single endpoint, one new mutation hook, one UI component update

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ Stack guardrails honored — Express + MongoDB backend; React frontend.
- ✅ Frontend library mandates followed: TanStack Router (`useNavigate`) for navigation, TanStack Query for mutation/cache, Flowbite React `Button`/`Modal`/`ModalHeader`/`ModalBody` for UI, Tailwind for styles, unplugin-icons for any icons.
- ✅ Clean Architecture boundaries enforced — router → service → model chain; no model calls from router directly.
- ✅ New route in Express router; service composes logic; model owns the MongoDB write.
- ✅ No user input to validate beyond `storyId` (path param, validated via `assertparamIsString`); `requireUserId` gates auth.
- ✅ `exactOptionalPropertyTypes` respected — no `undefined` sneaks into update payloads.
- ✅ No new libraries introduced.

_Post-design re-check_: All Phase 1 artifacts confirm no violations. No Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/038-soft-delete-story/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── delete-story.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
express/
└── src/
    ├── models/
    │   └── stories.ts            # EXISTING — softDeleteStoryById already here; no changes needed
    ├── services/
    │   └── storyService.ts       # ADD softDeleteStoryForUser()
    └── routers/
        └── storyRouter.ts        # ADD DELETE /:storyId route

web/
└── src/
    ├── api/
    │   ├── types.ts              # ADD DeleteStoryResponse
    │   └── stories.ts            # ADD deleteStory()
    ├── queries/story/
    │   └── story-mutations.ts    # ADD useDeleteStoryMutation()
    └── components/story/
        └── StoryHeading.tsx      # ADD Danger Zone UI + confirm modal
```

**Structure Decision**: Option 2 (Web application — Express API + React SPA). All changes live within existing files; no new files are created.

---

## Phase 0: Research

See [research.md](research.md) for full findings. Key decisions:

1. **No model changes** — `deletedAt?: Date` and `softDeleteStoryById` already exist; `buildStoryFilter` already excludes deleted stories from all reads.
2. **Service layer** — add `softDeleteStoryForUser` to `storyService.ts` to enforce access control before calling the model.
3. **New route** — `DELETE /:storyId` in `storyRouter.ts`; returns `204`.
4. **Cache strategy** — optimistic removal from `["stories"]` on `onMutate`; `removeQueries` for all `["story", storyId, *]` keys on `onSuccess`; rollback on `onError`.
5. **Navigation** — `useNavigate` from TanStack Router; navigate to `/dashboard` in the `onSuccess` callback.

---

## Phase 1: Design & Contracts

### data-model.md → [data-model.md](data-model.md)

No schema migration needed. `StoryDefinition.deletedAt?: Date` is already present. The `buildStoryFilter` function already filters deleted stories in all reads. New service function `softDeleteStoryForUser` documents access-control + write flow.

### contracts/ → [contracts/delete-story.md](contracts/delete-story.md)

`DELETE /api/stories/:storyId` — `204` on success, `404` if not found or already deleted, `403` if unauthorized.

### quickstart.md → [quickstart.md](quickstart.md)

End-to-end walkthrough for backend and frontend changes, plus manual test steps.

---

## Implementation Tasks

### T001 — Add `softDeleteStoryForUser` to `storyService.ts`

**File**: `express/src/services/storyService.ts`

Add:

```ts
import { softDeleteStoryById } from "../models/stories";

export const softDeleteStoryForUser = async (
  storyId: string | ObjectId,
  userId: string | ObjectId,
): Promise<boolean> => {
  const story = await getStoryForUser(storyId, userId);
  if (!story) {
    return false;
  }
  return softDeleteStoryById(storyId);
};
```

Also add `softDeleteStoryById` to the import from `"../models/stories"`.

---

### T002 — Add `DELETE /:storyId` route to `storyRouter.ts`

**File**: `express/src/routers/storyRouter.ts`

Import `softDeleteStoryForUser` from `storyService`. Add inside `applyStoryRoutes()`:

```ts
storyRouter.delete(
  "/:storyId",
  handleAsync(async (req, res) => {
    const userId = requireUserId(req);
    const storyId = assertparamIsString(req.params.storyId, "storyId");

    const deleted = await softDeleteStoryForUser(storyId, userId);
    if (!deleted) {
      res.status(404).json({ error: "Story not found" });
      return;
    }

    res.status(204).send();
  }),
);
```

Place after the existing `PATCH /:storyId` route and before any `/:storyId/tags` routes for logical grouping.

---

### T003 — Add `DeleteStoryResponse` type to `api/types.ts`

**File**: `web/src/api/types.ts`

Add alongside `DeleteSceneResponse`:

```ts
export interface DeleteStoryResponse {
  deleted: true;
}
```

---

### T004 — Add `deleteStory` API function to `api/stories.ts`

**File**: `web/src/api/stories.ts`

Import `DeleteStoryResponse` from `./types`. Add:

```ts
export async function deleteStory(storyId: string): Promise<void> {
  try {
    await apiClient.delete(`/stories/${storyId}`);
  } catch (err) {
    throw toApiError(err);
  }
}
```

---

### T005 — Add `useDeleteStoryMutation` to `story-mutations.ts`

**File**: `web/src/queries/story/story-mutations.ts`

Import `deleteStory` from `../../api/stories`. Import `Story` from `../../api/types`.

```ts
export function useDeleteStoryMutation(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteStory(storyId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previousStories = queryClient.getQueryData<Story[]>(["stories"]);
      if (previousStories) {
        queryClient.setQueryData<Story[]>(
          ["stories"],
          previousStories.filter((s) => s.id !== storyId),
        );
      }
      return { previousStories };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["stories"], context.previousStories);
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["story", storyId],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
```

**Note**: Navigation to `/dashboard` is handled by the calling component (StoryHeading), not inside the hook — navigation is a UI concern, not a data concern.

---

### T006 — Update `StoryHeading.tsx` with Danger Zone UI + confirm modal

**File**: `web/src/components/story/StoryHeading.tsx`

**Imports to add**:

```ts
import { useNavigate } from "@tanstack/react-router";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useDeleteStoryMutation } from "../../queries/story/story-mutations";
```

**State to add** (inside the component):

```ts
const navigate = useNavigate();
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [deleteError, setDeleteError] = useState<string | null>(null);
const deleteStoryMutation = useDeleteStoryMutation(storyId);
```

**Delete handler**:

```ts
const handleConfirmDelete = async () => {
  setDeleteError(null);
  try {
    await deleteStoryMutation.mutateAsync();
    await navigate({ to: "/dashboard" });
  } catch {
    setDeleteError("Failed to delete story. Please try again.");
  }
};
```

**Danger Zone section** — add inside the edit-mode return, below the Save/Cancel buttons:

```tsx
<div className="rounded-lg border border-rose-200 bg-rose-50 p-4 mt-6">
  <div className="flex items-center justify-between">
    <div className="text-xs uppercase tracking-[0.2em] text-rose-500">
      Danger Zone
    </div>
    <div>
      <Button
        type="button"
        color="red"
        size="lg"
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={deleteStoryMutation.isPending || updateMutation.isPending}
      >
        Delete Story
      </Button>
    </div>
  </div>
</div>

<Modal
  dismissible
  show={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  size="md"
  className="z-999"
>
  <ModalHeader>Are you sure you want to delete?</ModalHeader>
  <ModalBody>
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        This will permanently delete the story and remove it from your
        dashboard. You cannot undo this action.
      </p>
      {deleteError ? (
        <p className="text-sm text-rose-600">{deleteError}</p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          color="gray"
          onClick={() => setIsDeleteModalOpen(false)}
          disabled={deleteStoryMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="red"
          onClick={handleConfirmDelete}
          disabled={deleteStoryMutation.isPending}
        >
          Yes, delete story
        </Button>
      </div>
    </div>
  </ModalBody>
</Modal>
```

---

## Complexity Tracking

_No constitution violations. No entries required._
