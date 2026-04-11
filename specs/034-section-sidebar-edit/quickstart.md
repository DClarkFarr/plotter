# Quickstart: Section Sidebar Editing

**Feature**: 034-section-sidebar-edit  
**Purpose**: Orient a developer to deliver this feature end-to-end

---

## What This Feature Does

Clicking the edit button on a `SectionRow` in the plot grid opens the right-hand sidebar in section-editing mode. The `SectionForm` component lets the user edit the section's title (with auto-save), write a rich-text description (with auto-save), and delete the section (with a confirmation modal).

---

## Files to Create

| File                                       | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `web/src/store/sectionEditorStore.ts`      | Zustand store tracking selected section ID (mirrors `sceneEditorStore`) |
| `web/src/components/story/SectionForm.tsx` | Sidebar form for editing a section (mirrors `SceneForm`)                |

---

## Files to Modify

| File                                            | Change                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `express/src/models/sections.ts`                | Add `description?: string` to `SectionDefinition`                                                                        |
| `express/src/services/sectionService.ts`        | Thread `description` through create/update inputs                                                                        |
| `express/src/routers/sectionRouter.ts`          | Parse `description` in PATCH/POST; include in `toSectionResponse`                                                        |
| `web/src/api/types.ts`                          | Add `description?: string \| null` to `Section`; `description?: string` to `CreateSectionInput` and `UpdateSectionInput` |
| `web/src/store/sidebarStore.ts`                 | Add `"section"` to `SidebarView` union                                                                                   |
| `web/src/queries/section/section-mutations.ts`  | Add `description` to optimistic patch in `useUpdateSectionMutation`                                                      |
| `web/src/components/plot/SectionRow.tsx`        | Add missing import for `useSectionEditorStore`                                                                           |
| `web/src/components/layout/DashboardLayout.tsx` | Add `currentView === "section"` case rendering `<SectionForm>`                                                           |

---

## Implementation Order

Work in this order to avoid cascading TypeScript errors:

```
1. express/src/models/sections.ts          — add description field to SectionDefinition
2. express/src/services/sectionService.ts  — thread description through create/update
3. express/src/routers/sectionRouter.ts    — expose description in responses + accept in PATCH/POST
4. web/src/api/types.ts                    — add description to Section, CreateSectionInput, UpdateSectionInput
5. web/src/store/sectionEditorStore.ts     — create the Zustand store
6. web/src/store/sidebarStore.ts           — add "section" to SidebarView
7. web/src/queries/section/section-mutations.ts  — add description to optimistic update
8. web/src/components/story/SectionForm.tsx      — create the form component
9. web/src/components/plot/SectionRow.tsx        — add missing import
10. web/src/components/layout/DashboardLayout.tsx — wire SectionForm into sidebar
```

---

## Key Patterns to Follow

### Store (step 5) — copy `sceneEditorStore`, simplify

`useSectionEditorStore` needs only these fields:

```ts
selectedSectionId: string | null
isSaving: boolean
selectSection(sectionId: string): void
clearSelection(): void
setSaving(isSaving: boolean): void
```

No `plotId`, no `dragMode`, no dragging scene — sections are not plot-scoped.

### SectionForm (step 8) — follow SceneForm structure

Key differences from `SceneForm`:

- No tags, no POV, no todo list, no snippets — just title + description + delete
- Resolve section from `useStorySectionsQuery(storyId)` (not `useStoryPlotsQuery`)
- Both title and description are debounced (300ms) and call `useUpdateSectionMutation`
- Delete triggers a Flowbite `Modal`; on confirm calls `useDeleteSectionMutation`, then `clearSelection()` + `closeSidebar()`

### Auto-save title (debounced pattern)

```tsx
const debouncedTitleUpdate = useDebounce((value: string) => {
  if (!selectedSection) return;
  const trimmed = value.trim();
  if (!trimmed || trimmed === selectedSection.title) return;
  updateSectionMutation.mutate({
    sectionId: selectedSection.id,
    title: trimmed,
  });
}, 300);
```

### Auto-save description (debounced pattern)

```tsx
const debouncedDescriptionUpdate = useDebounce((value: string) => {
  if (!selectedSection) return;
  if (value === (selectedSection.description ?? "")) return;
  updateSectionMutation.mutate({
    sectionId: selectedSection.id,
    description: value,
  });
}, 300);
```

---

## Verify It Works

1. Hover over any section row in the plot grid — edit button should appear
2. Click the edit button — sidebar opens showing the section's title
3. Edit the title — debounced save fires; section row title updates in the grid
4. Type in the description editor — content persists after closing and reopening the sidebar
5. Click delete → confirm → section row is removed, sidebar closes
6. Open the sidebar for a scene, then click edit on a section — sidebar switches from scene view to section view without errors
