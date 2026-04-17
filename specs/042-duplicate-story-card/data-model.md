# Data Model: Duplicate Story Card

**Feature**: 042-duplicate-story-card  
**Phase**: 1 — Design  
**Date**: 2026-04-16

---

## Overview

No new collections are created. Duplication produces new documents in the existing six story-scoped collections. The key addition is a set of **duplication functions** on existing models that accept a `ClientSession` and return either the new documents or an ID remapping map.

---

## Entities Involved

### Story (`stories` collection)

Existing entity. Duplication creates a new `StoryDocument` with:

| Field                    | Source                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| `title`                  | `"Copy of {sourceTitle}"`                                        |
| `description`            | copied from source                                               |
| `users`                  | `[{ userId: ownerId, role: "owner" }]` — requester is sole owner |
| `deletedAt`              | omitted (active)                                                 |
| `createdAt`, `updatedAt` | fresh timestamps                                                 |

### Tags (`tags` collection)

Each tag has `storyId`. Duplication creates new tags with the new `storyId`. All fields
(`name`, `color`, `variant`, `variants`) are copied verbatim. Returns
`Map<string, ObjectId>` mapping `oldTag._id.toHexString()` → `newTag._id`.

### Characters (`characters` collection)

Each character has `storyId`. All fields are copied:
`title`, `description`, `imageUrl`, `characteristics`, `customCharacteristics`, `lists`.
**Note**: `imageUrl` is a URL path to an uploaded file in `uploads/characters/`. The uploaded
file itself is **not** copied — the duplicate character reuses the same image URL. This is
intentional (avoids filesystem duplication; renaming/replacing is a separate user action).
Returns `Map<string, ObjectId>`.

### Colors (`colors` collection)

Each color has `resourceType: "story"` and `resourceId: storyId`. All fields are copied:
`color`, `sortOrder`, `ignored`. Returns `ColorDocument[]`.

### Plots (`plots` collection)

Each plot has `storyId` and `horizontalIndex`. All fields are copied:
`title`, `description`, `color`, `horizontalIndex`. Returns `Map<string, ObjectId>`.

### Scenes (`scenes` collection)

Scenes reference `plotId` (ObjectId), `tags` (ObjectId[]), `tagVariants[].tagId` (ObjectId),
and `pov` (ObjectId | null — a character reference). During duplication, all
three ID sets are remapped using the maps produced by the tag, character, and plot
duplication steps:

| Field                                                       | Transformation                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `plotId`                                                    | `plotMap.get(oldPlotId)`                                      |
| `tags[i]`                                                   | `tagMap.get(oldTagId)` — tags absent from the map are dropped |
| `tagVariants[i].tagId`                                      | same remapping as `tags`                                      |
| `pov`                                                       | `charMap.get(oldCharId)` or `null` if not in map              |
| `title`, `description`, `verticalIndex`, `todo`, `snippets` | copied verbatim                                               |
| `deletedAt`                                                 | only non-deleted scenes (`deletedAt: null`) are duplicated    |

### Sections (`sections` collection)

Each section has `storyId`, `title`, `verticalIndex`, `type`, `description`. No
cross-entity references. All fields are copied verbatim with the new `storyId`.
Returns `SectionDocument[]`.

---

## ID Remapping Flow

```
Source Story
    │
    ├─ duplicateTagsByStory()     → tagMap:  Map<oldTagIdHex, newTagObjectId>
    │
    ├─ duplicateCharactersByStory() → charMap: Map<oldCharIdHex, newCharObjectId>
    │
    ├─ duplicateColorsByStory()   → (no downstream consumer)
    │
    ├─ duplicatePlotsByStory()    → plotMap: Map<oldPlotIdHex, newPlotObjectId>
    │                               also yields sourcePlotIds[]
    │
    └─ duplicateScenesByPlots(sourcePlotIds, plotMap, tagMap, charMap)
         └─ for each scene: remap plotId, tags, tagVariants, pov

Source Story
    └─ duplicateSectionsByStory() → (no remapping needed)
```

---

## Frontend State — Placeholder Card

No new persistent state. The `dashboardStore` (Zustand) gains:

| Field                     | Type                   | Purpose                                     |
| ------------------------- | ---------------------- | ------------------------------------------- |
| `duplicatingStoryIds`     | `Set<string>`          | Source story IDs currently being duplicated |
| `addDuplicatingId(id)`    | `(id: string) => void` | Register duplication start                  |
| `removeDuplicatingId(id)` | `(id: string) => void` | Remove on completion or error               |

The `StoryGrid` renders one `DuplicatingCard` at the end of the card list per entry in `duplicatingStoryIds`. `DuplicatingCard` is a read-only skeleton card with a spinner and "Duplicating…" label, styled identically to the page-load skeleton but with a spinner overlay.

---

## State Transitions — Duplication Lifecycle

```
User clicks "Duplicate story"
  → addDuplicatingId(storyId)          [placeholder card appears]
  → POST /api/stories/:storyId/duplicate
      → success:
            invalidateQueries(["stories"])   [stories list refreshes]
            setRecentlyCreatedId(newStory.id) [new card glows]
            removeDuplicatingId(storyId)     [placeholder disappears]
            alert.success("story created")
      → error:
            removeDuplicatingId(storyId)     [placeholder disappears]
            alert.error(errorMessage)
```

---

## Validation Rules

- Source story must exist and be owned by the authenticated user.
- `ownerId` is taken from the authenticated session — the duplicate is always owned solely by the requester.
- A story with `deletedAt` set MUST NOT be duplicated (return 404).
- Only non-deleted scenes (`deletedAt: null`) are included in the duplicate.
