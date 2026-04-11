# Research: Section Sidebar Editing

**Feature**: 034-section-sidebar-edit  
**Phase**: 0 — Pre-Design Research

---

## Finding 1: Existing Section Data Model (Backend)

**Decision**: The backend `SectionDefinition` in `express/src/models/sections.ts` does NOT have a `description` field. It only has `storyId`, `title`, `verticalIndex`, and `type`. A `description` field must be added.

**Rationale**: The spec requires WYSIWYG description editing; the field must be persisted on the document.

**Pattern to follow**: The `Plot` model (`express/src/models/plots.ts`) has a `description: string` field with the same shape. Follow the same pattern — optional string in MongoDB, surfaced as `description?: string | null` in the API response.

**Alternatives considered**: Storing description as a separate document — rejected as unnecessary complexity.

---

## Finding 2: Existing Section API (Router + Service)

**Decision**: The `PATCH /:storyId/sections/:sectionId` route already exists and handles partial updates via `optionalString`. Adding `description` requires:

1. `toSectionResponse` in `sectionRouter.ts` must include `description`
2. The PATCH handler must parse `description` via `optionalString` and include it in the update payload
3. `updateSectionForStory` in `sectionService.ts` must pass `description` through to the model's update function
4. `UpdateSectionInput` (model-layer type in `express/src/models/sections.ts` or `sectionService.ts`) must include `description?: string`

**Rationale**: The route infrastructure already exists; this is an additive field only.

**Alternatives considered**: New separate endpoint — rejected; PATCH on the existing resource is idiomatic REST.

---

## Finding 3: Frontend Section Types

**Decision**: `web/src/api/types.ts` must be updated in three places:

- `Section` interface: add `description?: string | null`
- `CreateSectionInput`: add `description?: string`
- `UpdateSectionInput`: add `description?: string`

**Rationale**: TanStack Query mutations pass these typed inputs directly to the API client. Without updating the shared types, TypeScript will reject the new field.

**Alternatives considered**: None — type definitions must stay in sync with the API contract.

---

## Finding 4: useSectionEditorStore

**Decision**: Create `web/src/store/sectionEditorStore.ts` as a minimal Zustand store. It needs only:

- `selectedSectionId: string | null`
- `isSaving: boolean`
- `selectSection(sectionId: string): void`
- `clearSelection(): void`
- `setSaving(isSaving: boolean): void`

No `plotId` is needed (sections are not plot-scoped). No drag-mode is needed (dragging is handled by dnd-kit directly in `SectionRow`).

**Rationale**: Mirrors `useSceneEditorStore` pattern but is simpler because sections have no plot association. `SectionRow.tsx` already references `useSectionEditorStore` with a `selectSection` call — the store must match this interface exactly.

**Alternatives considered**: Storing the full `Section` object — rejected; consistent with scene pattern of storing only the ID and resolving the object in the form component via query data.

---

## Finding 5: SidebarView — Adding 'section'

**Decision**: Add `"section"` to the `SidebarView` union type in `web/src/store/sidebarStore.ts`:

```
export type SidebarView = "scene" | "section" | "character" | "tag";
```

`SectionRow.tsx` already calls `addSidebarView("section")`. Without the type update this is a TypeScript error. No logic changes to `sidebarStore` are needed — the existing `views` stack, `addSidebarView`, `getCurrentView`, and `clearAllViews` all work generically.

**Rationale**: The sidebar view system is a discriminated union used as a push/pop view stack. Adding a new value is the established extension mechanism.

**Alternatives considered**: Separate sidebar state for sections — rejected; the existing generalised view stack already supports this use-case cleanly.

---

## Finding 6: SectionForm Component

**Decision**: Create `web/src/components/story/SectionForm.tsx` following the exact structure of `SceneForm.tsx`:

- Reads `selectedSectionId` from `useSectionEditorStore`
- Reads `storyId` from `useParams` (route `/dashboard/story/$storyId`)
- Resolves the selected section from the TanStack Query cache via `useStorySectionsQuery`
- Manages local `draftTitle` state with a debounced update to `useUpdateSectionMutation`
- Manages local `descriptionHtml` state with a debounced update to `useUpdateSectionMutation`
- Delete via `useDeleteSectionMutation` behind a Flowbite `Modal` confirmation dialog
- On delete: calls `clearSelection()` from `useSectionEditorStore` + `closeSidebar()` from `useSidebarStore`
- Uses `RichTextEditor` with `isSimpleMode` for the description field (same as `SceneForm`)

**Rationale**: Reusing the exact same patterns ensures visual and behavioural consistency. `SceneForm` is the proven reference implementation.

**Alternatives considered**: Inline editing directly in `SectionRow` — rejected; the spec explicitly mirrors the sidebar pattern. A shared generic `EntityForm` — rejected as premature abstraction with only two form types.

---

## Finding 7: DashboardLayout Wiring

**Decision**: In `web/src/components/layout/DashboardLayout.tsx`, add:

```tsx
{
  currentView === "section" && <SectionForm key={selectedSectionId} />;
}
```

alongside the existing `"scene"` block. Also import `useSectionEditorStore` to drive the `key` prop.

**Rationale**: The `key` prop resets the form component whenever a different section is selected, preventing stale draft state — identical to how `SceneForm` is handled.

**Alternatives considered**: Managing section selection entirely inside `SectionForm` — rejected; the `key` prop pattern requires the ID to be hoisted to layout level.

---

## Finding 8: SectionRow.tsx Import Fix

**Decision**: `SectionRow.tsx` references `useSectionEditorStore` without importing it. The import must be added:

```ts
import { useSectionEditorStore } from "../../store/sectionEditorStore";
```

This is the only change needed in `SectionRow.tsx` — the `handleEdit` logic is already correct.

**Rationale**: The file was written in anticipation of the store; it just needs the import completed.

---

## Finding 9: Optimistic Update in useUpdateSectionMutation

**Decision**: The `onMutate` handler in `useUpdateSectionMutation` (`web/src/queries/section/section-mutations.ts`) maps `title`, `type`, and `verticalIndex` to the optimistic cache update, but does NOT include `description`. Add `description` to the optimistic spread.

**Rationale**: Without this, editing the description will show stale text until the server responds. The pattern is identical to how `title` is handled.

**Alternatives considered**: Accepting the brief flicker — rejected; it would create a jarring UX inconsistency vs. title editing.

---

## Summary: All NEEDS CLARIFICATION Resolved

| Unknown                                         | Resolution                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Does Section have a `description` field?        | No — must be added to model, service, router, and types                                  |
| Does the update mutation support `description`? | Not yet — additive change required                                                       |
| What shape should `useSectionEditorStore` take? | Minimal: `selectedSectionId`, `selectSection`, `clearSelection`, `isSaving`, `setSaving` |
| Is `SidebarView = "section"` already typed?     | No — must add to union                                                                   |
| Does `SectionRow` need new logic?               | No — only the missing import needs to be added                                           |
