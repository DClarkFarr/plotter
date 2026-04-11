# Data Model: Section Sidebar Editing

**Feature**: 034-section-sidebar-edit  
**Phase**: 1 — Design

---

## Entities Changed

### Section (extended)

The `Section` entity gains an optional `description` field for rich-text content.

| Field           | Type                 | Required | Notes                                                                  |
| --------------- | -------------------- | -------- | ---------------------------------------------------------------------- |
| id              | string               | yes      | MongoDB ObjectId hex string                                            |
| storyId         | string               | yes      | Parent story reference                                                 |
| title           | string               | yes      | Non-empty, trimmed on save                                             |
| verticalIndex   | number               | yes      | Zero-based row position in plot grid                                   |
| type            | `"act" \| "section"` | yes      | Display size variant                                                   |
| **description** | `string \| null`     | no       | **NEW** — Rich-text HTML from TipTap WYSIWYG editor; null if never set |

---

## Backend Model Changes

### `express/src/models/sections.ts`

`SectionDefinition` interface gains:

```ts
description?: string;
```

This is stored as an optional string in MongoDB. Absence and `null` are both treated as "no description".

### `express/src/models/sections.ts` — UpdateSectionInput (if defined here)

Gains:

```ts
description?: string;
```

---

## Backend Service Changes

### `express/src/services/sectionService.ts`

`UpdateSectionInput` (the service-layer type) gains `description?: string`.

`updateSectionForStory` passes `description` to the model update when present (same pattern as `title`).

`createSectionForStory` accepts `description?: string` in its input and stores it when provided (for future use; no frontend creates sections with descriptions today).

---

## Backend Router Changes

### `express/src/routers/sectionRouter.ts`

**`toSectionResponse`** gains:

```ts
description: section.description ?? null,
```

**PATCH handler** gains:

```ts
const description = optionalString(req.body?.description, "description");
// included in updates spread when defined
```

**POST handler** gains:

```ts
const description = optionalString(req.body?.description, "description");
// included in createSectionForStory input when defined
```

---

## Frontend Type Changes

### `web/src/api/types.ts`

**`Section` interface**:

```ts
description?: string | null;   // NEW
```

**`CreateSectionInput`**:

```ts
description?: string;          // NEW
```

**`UpdateSectionInput`**:

```ts
description?: string;          // NEW
```

---

## Frontend Store: sectionEditorStore (NEW)

**File**: `web/src/store/sectionEditorStore.ts`

```
State:
  selectedSectionId: string | null
  isSaving: boolean

Actions:
  selectSection(sectionId: string): void
  clearSelection(): void
  setSaving(isSaving: boolean): void
```

---

## Frontend Store: sidebarStore (modified)

**File**: `web/src/store/sidebarStore.ts`

`SidebarView` union gains `"section"`:

```ts
export type SidebarView = "scene" | "section" | "character" | "tag";
```

---

## Frontend Mutation: useUpdateSectionMutation (modified)

**File**: `web/src/queries/section/section-mutations.ts`

Optimistic `onMutate` section patch gains `description` field:

```ts
...(input.description !== undefined && { description: input.description }),
```

---

## Frontend Component: SectionForm (NEW)

**File**: `web/src/components/story/SectionForm.tsx`

| Concern             | Approach                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Selected section    | Read `selectedSectionId` from `useSectionEditorStore`; resolve full object from `useStorySectionsQuery` cache                |
| Title editing       | Local `draftTitle` state, debounced `useUpdateSectionMutation` call (300ms)                                                  |
| Description editing | Local `descriptionHtml` state, debounced `useUpdateSectionMutation` call (300ms), rendered via `RichTextEditor isSimpleMode` |
| Delete              | Flowbite `Modal` confirm dialog; on confirm calls `useDeleteSectionMutation`, then `clearSelection()` + `closeSidebar()`     |
| storyId             | From `useParams({ from: "/dashboard/story/$storyId" })`                                                                      |
| Missing selection   | Render "Select a section to start editing." fallback                                                                         |

---

## Frontend Layout: DashboardLayout (modified)

**File**: `web/src/components/layout/DashboardLayout.tsx`

Adds `currentView === "section"` case:

```tsx
{
  currentView === "section" && <SectionForm key={selectedSectionId} />;
}
```

Also imports `useSectionEditorStore` to read `selectedSectionId` for the `key` prop.

---

## Frontend SectionRow (import fix only)

**File**: `web/src/components/plot/SectionRow.tsx`

Add missing import:

```ts
import { useSectionEditorStore } from "../../store/sectionEditorStore";
```

No other changes — logic is already complete.

---

## State Transition: Section Edit Flow

```
User hovers SectionRow
  → edit button visible
    → click edit button
      → useSectionEditorStore.selectSection(section.id)
      → useSidebarStore.openSidebar()
      → useSidebarStore.addSidebarView("section")
        → DashboardLayout renders SectionForm
          → SectionForm resolves section from query cache
          → User edits title → debounced PATCH → optimistic update in cache
          → User edits description → debounced PATCH → optimistic update in cache
          → User clicks Delete → confirm modal → DELETE API → clearSelection + closeSidebar
```
