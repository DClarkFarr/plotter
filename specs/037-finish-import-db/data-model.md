# Data Model: Finish Import — Database Creation

**Branch**: `037-finish-import-db`

---

## Existing Collections Used (no schema changes)

| Collection   | Key Fields Referenced                                                             |
|--------------|-----------------------------------------------------------------------------------|
| `stories`    | `_id`, `title`, `description`, `users[]`                                          |
| `plots`      | `_id`, `storyId`, `title`, `horizontalIndex`                                      |
| `sections`   | `_id`, `storyId`, `title`, `verticalIndex`, `type: "act" \| "chapter"`           |
| `scenes`     | `_id`, `plotId`, `title`, `verticalIndex`, `tags[]`, `tagVariants[]`, `pov`      |
| `tags`       | `_id`, `storyId`, `name`, `color`, `variant`, `variants[]`                       |
| `characters` | `_id`, `storyId`, `title`                                                         |

---

## Import Parse Result → DB Mapping

The import parser (`importOutlineParser.ts`) produces an `ImportParseResult`:

```ts
{
  elements: (ActElement | ChapterElement | SceneElement)[];
  tags: Tag[];          // unique across the document
  characters: Character[]; // unique across the document
  issues: ImportIssue[];
}
```

### Tags (parser → DB)

```
Tag (parser)                    TagDocument (DB)
─────────────────────────────   ────────────────────────────────────────
id: string (local ref)    →     (used only for ID mapping, not stored)
name: string              →     name: string  (dedup: case-insensitive)
color: string | null      →     color: string  (fallback "#000000")
variant: string | null    →     variant: boolean  (true if variant != null)
                          →     variants: string[]  (append if not present)
                          →     storyId: ObjectId
```

**ID Map**: `Map<parseTagId, ObjectId>` — built before scenes are inserted.

### Characters (parser → DB)

```
Character (parser)             CharacterDocument (DB)
──────────────────────────     ──────────────────────────────────────
id: string (local ref)   →     (used only for ID mapping, not stored)
name: string             →     title: string  (dedup: case-insensitive)
                         →     storyId: ObjectId
```

**ID Map**: `Map<parseCharacterId, ObjectId>` — built before scenes are inserted.

### Elements (parser → DB)

Processed in document order. A shared `verticalIndex` counter starts at `0` and increments for every entry written (section or scene).

```
ActElement (parser)            SectionDocument (DB)
─────────────────────────      ─────────────────────────────────────────
type: "act"              →     type: "act"
title: string            →     title: string
                         →     storyId: ObjectId
                         →     verticalIndex: counter++
```

```
ChapterElement (parser)        SectionDocument (DB)
─────────────────────────      ─────────────────────────────────────────
type: "chapter"          →     type: "chapter"
title: string            →     title: string
                         →     storyId: ObjectId
                         →     verticalIndex: counter++
```

```
SceneElement (parser)             SceneDocument (DB)
──────────────────────────────    ──────────────────────────────────────────────
type: "scene"              →      (identified by absence in sections)
title: string              →      title: string
tagIds: string[]           →      tags: ObjectId[]  (via tag ID map)
tag variants (from Tag)    →      tagVariants: { tagId, variant }[]
povCharacterId: string|null→      pov: ObjectId | null  (via character ID map)
                           →      plotId: ObjectId  (default plot for this story)
                           →      description: ""
                           →      todo: []
                           →      snippets: []
                           →      verticalIndex: counter++
```

---

## Default Plot

A single plot is created per imported story:

```
PlotDocument
─────────────────────────────
storyId: ObjectId
title:   <story name>
description: ""
color:   "#6B7280"   (neutral gray)
horizontalIndex: 0
```

---

## Processing Order (within the transaction)

```
1. Guard: assert at least one scene element present
2. Create story                       → storyId
3. Create default plot                → plotId
4. Resolve/create tags                → tagIdMap: Map<parseId, ObjectId>
5. Resolve/create characters          → charIdMap: Map<parseId, ObjectId>
6. Process elements[] in order:
     a. act      → insertOne Section (type: "act",     verticalIndex: i++)
     b. chapter  → insertOne Section (type: "chapter", verticalIndex: i++)
     c. scene    → insertOne Scene   (plotId, tags, tagVariants, pov, verticalIndex: i++)
```

All steps 2–6 execute inside a single `session.withTransaction()` call.
