# Implementation Plan: Finish Import — Database Creation

**Branch**: `037-finish-import-db` | **Date**: April 11, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/037-finish-import-db/spec.md`

---

## Summary

Extend the existing `importOutlineService` `"create"` mode to persist all parsed import data — story, default plot, acts (sections), chapters (sections), scenes, tags, and characters — within a single MongoDB transaction. Tags and characters are resolved (deduped) before scenes are inserted, so their `ObjectId`s can be embedded. All entities are positioned by a shared `verticalIndex` counter that interleaves sections and scenes in document order.

---

## Technical Context

**Language/Version**: TypeScript (Node.js 20)  
**Primary Dependencies**: Express, MongoDB Node.js driver 6.x, `officeparser`  
**Storage**: MongoDB (Atlas in production; local replica set in dev — required for transactions)  
**Testing**: Manual curl / mongosh verification (no automated test suite yet)  
**Target Platform**: Linux server (Express API in `express/`)  
**Performance Goals**: Full import completes in < 10 s for 50 scenes (FR from spec SC-002)  
**Constraints**: All writes atomic; no partial records on failure  
**Scale/Scope**: Single import flow; affects `importOutlineService.ts` and `mongo.ts` only in backend

---

## Constitution Check

- Stack guardrails honored (Express + MongoDB backend in `express/`, React in `web/`).
- Frontend library mandates followed: no new frontend code in this feature.
- Clean Architecture boundaries enforced: transaction logic lives in the service; model functions own MongoDB queries.
- Routes use Express router (`importRouter.ts`); service composes workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements: empty-import guard before DB access; transaction errors return generic 500 message.
- Performance and environment base URL requirements addressed: no URL changes.

**No violations.**

---

## Project Structure

### Documentation (this feature)

```text
specs/037-finish-import-db/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── import.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks command)
```

### Source Code Changes

```text
express/
└── src/
    ├── utils/
    │   └── mongo.ts                    ← ADD: export getClient(): MongoClient
    ├── models/
    │   ├── tags.ts                     ← ADD: findTagByName(storyId, name) case-insensitive lookup
    │   └── characters.ts               ← ADD: findCharacterByTitle(storyId, title) case-insensitive lookup
    └── services/
        └── importOutlineService.ts     ← MODIFY: replace single createStory call with full
                                                   transactional import in "create" mode
```

No new files. No frontend changes.

---

## Phase 0: Research

See [research.md](./research.md). All unknowns resolved:

| Unknown | Resolution |
|---------|------------|
| Transaction support | `getClient().startSession()` + `session.withTransaction()` |
| Default plot | Create `horizontalIndex: 0` plot per imported story |
| `verticalIndex` strategy | Single shared counter; sections and scenes interleave |
| Tag dedup | Case-insensitive lookup by `(storyId, name)` before insert |
| Character dedup | Case-insensitive lookup by `(storyId, title)` before insert |
| Empty import guard | Pre-transaction check for at least one `type === "scene"` element |
| `MongoClient` exposure | Export `getClient()` from `mongo.ts` |

---

## Phase 1: Design

### Step-by-step implementation logic (`importOutlineService.ts` — create mode)

```
Pre-transaction:
  1. Parse docx → ImportParseResult
  2. If hasErrorIssues → return preview-style result (existing behavior)
  3. Guard: if no scene element → return 422 "no scenes" error

Inside session.withTransaction():
  4. createStory({ title: storyName, ownerId: userId })          → story
  5. createPlot({ storyId, title: storyName, color: "#6B7280",
                  description: "", horizontalIndex: 0 })          → plot
  6. For each tag in parsed.tags:
       existing = findTagByName(storyId, tag.name)
       if existing:
         if tag.variant && !existing.variants.includes(tag.variant):
           appendTagVariant(existing._id, tag.variant)
         tagIdMap.set(tag.id, existing._id)
       else:
         created = createTag({ storyId, name, color, variant: tag.variant !== null,
                                variants: tag.variant ? [tag.variant] : [] })
         tagIdMap.set(tag.id, created._id)
  7. For each character in parsed.characters:
       existing = findCharacterByTitle(storyId, character.name)
       if existing:
         charIdMap.set(character.id, existing._id)
       else:
         created = createCharacter({ storyId, title: character.name })
         charIdMap.set(character.id, created._id)
  8. let verticalIndex = 0
     for each element in parsed.elements (in order):
       if element.type === "act":
         createSection({ storyId, title, type: "act", verticalIndex: verticalIndex++ })
       if element.type === "chapter":
         createSection({ storyId, title, type: "chapter", verticalIndex: verticalIndex++ })
       if element.type === "scene":
         tags     = element.tagIds.map(id => tagIdMap.get(id))
         variants = element.tagIds
                      .filter(id => parsed.tags.find(t => t.id === id)?.variant)
                      .map(id => ({ tagId: tagIdMap.get(id), variant: parsed.tags.find(t => t.id === id).variant }))
         pov      = element.povCharacterId ? charIdMap.get(element.povCharacterId) : null
         createScene({ plotId: plot._id, title, tags, tagVariants: variants,
                       pov, description: "", todo: [], snippets: [],
                       verticalIndex: verticalIndex++ })

  9. Return { mode: "create", summary, message: "Import completed",
              storyId: story._id.toHexString(), storyName }
```

### New model functions needed

**`express/src/models/tags.ts`**

```ts
// Case-insensitive lookup for dedup
export const findTagByName = async (
  storyId: string | ObjectId,
  name: string,
): Promise<TagDocument | null> => {
  return getTagsCollection().findOne({
    storyId: ensureObjectId(storyId, "storyId"),
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
  });
};

// Append a new variant string to an existing tag's variants array
export const appendTagVariant = async (
  tagId: string | ObjectId,
  variant: string,
): Promise<void> => {
  await getTagsCollection().updateOne(
    { _id: ensureObjectId(tagId, "tagId") },
    { $addToSet: { variants: variant }, ...touchTimestamps() },
  );
};
```

**`express/src/models/characters.ts`**

```ts
// Case-insensitive lookup for dedup
export const findCharacterByTitle = async (
  storyId: string | ObjectId,
  title: string,
): Promise<CharacterDocument | null> => {
  return getCharactersCollection().findOne({
    storyId: ensureObjectId(storyId, "storyId"),
    title: { $regex: new RegExp(`^${escapeRegex(title)}$`, "i") },
  });
};
```

A shared `escapeRegex` helper is already available in `express/src/utils/` or can be added as a one-liner: `` (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") ``.

### `mongo.ts` change

```ts
export const getClient = (): MongoClient => {
  if (!client) {
    throw new Error("MongoDB client has not been initialized.");
  }
  return client;
};
```

---

## Complexity Tracking

No constitution violations. No new architectural patterns introduced. The transaction is the only new infrastructure concern, and it uses the existing driver-native API.
