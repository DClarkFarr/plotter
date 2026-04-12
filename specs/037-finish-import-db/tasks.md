# Tasks: Finish Import — Database Creation

**Input**: Design documents from `/specs/037-finish-import-db/`  
**Branch**: `037-finish-import-db`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared state)
- **[US#]**: User story this task belongs to

---

## Phase 1: Setup — MongoClient Exposure

**Purpose**: Export `getClient()` from `mongo.ts` so the service can open a session. All other phases depend on this.

- [x] T001 Export `getClient(): MongoClient` guard function in `express/src/utils/mongo.ts`

**Checkpoint**: `getClient()` is importable. Transaction work can begin.

---

## Phase 2: Foundational — Model Helpers (Parallelizable)

**Purpose**: Add the two case-insensitive lookup functions and one variant-append function that the transactional service will call. These have no dependencies on each other.

- [x] T002 [P] Add `findTagByName(storyId, name)` case-insensitive lookup to `express/src/models/tags.ts`
- [x] T003 [P] Add `appendTagVariant(tagId, variant)` using `$addToSet` to `express/src/models/tags.ts`
- [x] T004 [P] Add `findCharacterByTitle(storyId, title)` case-insensitive lookup to `express/src/models/characters.ts`

**Checkpoint**: All model helpers exist. The service layer can now call them.

---

## Phase 3: User Story 1 — Persist Story, Plot, Sections, and Scenes (Priority: P1) 🎯 MVP

**Goal**: Approving a create-mode import writes a story, default plot, all act/chapter sections, and all scenes to the database in a single transaction, each with the correct shared `verticalIndex`.

**Independent Test**: `POST /api/import/outline` with `mode=create` and a conforming `.docx`; verify in mongosh that one story, one plot, N sections, and M scenes exist with monotonically increasing `verticalIndex` values. Cancel mid-transaction by throwing intentionally and confirm zero records remain.

- [x] T005 [US1] Add empty-import guard (pre-transaction check for at least one `type === "scene"` element) in `express/src/services/importOutlineService.ts`; return error payload if none found
- [x] T006 [US1] Open `ClientSession` via `getClient().startSession()` and wrap all DB writes in `session.withTransaction()` in `express/src/services/importOutlineService.ts`
- [x] T007 [US1] Inside the transaction: create story via `createStoryForOwner` and default plot (`horizontalIndex: 0`, color `#6B7280`) via `createPlot` in `express/src/services/importOutlineService.ts`
- [x] T008 [US1] Inside the transaction: iterate `parsed.elements` in order, inserting each `act`/`chapter` element as a `SectionDocument` and each `scene` element as a `SceneDocument` using the shared `verticalIndex` counter in `express/src/services/importOutlineService.ts`
- [x] T009 [US1] On transaction error, catch and return `{ message: "Import failed. No data was saved." }` with HTTP 500 in `express/src/services/importOutlineService.ts` and `express/src/routers/importRouter.ts`

**Checkpoint**: US1 is fully functional — core import flow persists all structure atomically.

---

## Phase 4: User Story 2 — Characters and Tags Linked to Scenes (Priority: P2)

**Goal**: Tags (with color and variant) and characters (POV) extracted from scene headings are created or deduped, then embedded into each scene record via `tags[]`, `tagVariants[]`, and `pov`.

**Independent Test**: Import a `.docx` with known tag syntax (`[Tension:high]`, highlighted) and character POV syntax; query `db.scenes.find({ plotId })` and verify `tags`, `tagVariants`, and `pov` are populated with the correct `ObjectId`s. Query `db.tags` and `db.characters` to confirm dedup (import same name twice, expect one record).

- [x] T010 [US2] Inside the transaction (before element loop): resolve/create each tag from `parsed.tags` using `findTagByName` for dedup; if existing tag is missing a variant call `appendTagVariant`; build `tagIdMap: Map<parseId, ObjectId>` in `express/src/services/importOutlineService.ts`
- [x] T011 [US2] Inside the transaction (before element loop): resolve/create each character from `parsed.characters` using `findCharacterByTitle` for dedup; build `charIdMap: Map<parseId, ObjectId>` in `express/src/services/importOutlineService.ts`
- [x] T012 [US2] When inserting a scene, map `element.tagIds` through `tagIdMap` to populate `tags[]` and build `tagVariants[]` entries from the parsed tag's `variant` field in `express/src/services/importOutlineService.ts`
- [x] T013 [US2] When inserting a scene, resolve `element.povCharacterId` through `charIdMap` to populate `pov` (or `null`) in `express/src/services/importOutlineService.ts`

**Checkpoint**: US2 is fully functional — tags, variants, colors, and character POV are persisted and linked.

---

## Phase 5: User Story 3 — Sections from Indented Paragraphs (Priority: P3)

**Goal**: Section records already flow through the element loop (T008). This phase verifies the parser's snippet/section grouping is reflected correctly and that section `verticalIndex` values interleave with scenes as expected.

**Independent Test**: Import a `.docx` with indented paragraph groups under a chapter heading; confirm `db.sections.find({ storyId }).sort({ verticalIndex: 1 })` shows acts and chapters at the correct positions relative to the scenes around them.

> **Note**: The parser (`importOutlineParser.ts`) already produces `act` and `chapter` elements for indented groups. The element loop in T008 handles their insertion. This phase contains no new code tasks — it is a verification milestone.

- [ ] T014 [US3] Manually verify via mongosh that act and chapter `SectionDocument` records are inserted with the correct interleaved `verticalIndex` alongside scene records after a real import

**Checkpoint**: US3 verified — section ordering is correct in the database.

---

## Phase 6: User Story 4 — Graceful Failure Handling (Priority: P4)

**Goal**: Any error inside the transaction aborts all writes and the user receives a clear, retry-safe error response.

**Independent Test**: Temporarily throw inside the `withTransaction` callback after story creation; confirm zero records in any collection for that `storyId` and that the API returns HTTP 500 with `"Import failed. No data was saved."`.

> **Note**: The error catch and 500 response are implemented in T009. This phase adds the router-level handling if not already wired.

- [x] T015 [US4] Confirm `importRouter.ts` surfaces the `"Import failed. No data was saved."` error as HTTP 500 and does not leak internal error details in `express/src/routers/importRouter.ts`

**Checkpoint**: US4 verified — transaction rollback is confirmed and error response is safe.

---

## Final Phase: Polish

- [x] T016 [P] Remove stale `createStoryForOwner`-only call that was the prior `"create"` mode implementation in `express/src/services/importOutlineService.ts` (replaced by T006–T008)
- [x] T017 [P] Verify TypeScript compilation passes with no errors: `cd express && npx tsc --noEmit`

---

## Dependencies

```
T001 (getClient)
  └── T006 (open session + withTransaction)
        └── T007 (story + plot)
        └── T008 (sections + scenes loop)  ← also needs T002, T003, T004 for tags/chars
        └── T010 (tag resolve/create)      ← needs T002, T003
        └── T011 (character resolve/create) ← needs T004
              └── T012 (scene tag embedding) ← needs T010
              └── T013 (scene pov)          ← needs T011

T009 (error handler) ← depends on T006
T015 (router 500) ← depends on T009
T014, T016, T017 ← no blockers (verification + cleanup)
```

## Parallel Execution

All of T002, T003, T004 can be written simultaneously (different files/functions).  
T010 and T011 can be written simultaneously (different entity types, same file section).  
T012 and T013 can be written simultaneously (different fields on SceneDocument).  
T016 and T017 can run simultaneously.

## Implementation Strategy (MVP-first)

**MVP** = T001 → T002+T003+T004 → T005 → T006 → T007 → T008 → T009  
This delivers a working full import (US1) with no character/tag metadata.

**Full** = add T010 → T011 → T012 → T013 (US2), then verify T014 (US3), then T015 (US4).

**Total tasks**: 17  
**Task count by story**: US1: 5 | US2: 4 | US3: 1 | US4: 1 | Setup/cleanup: 6
