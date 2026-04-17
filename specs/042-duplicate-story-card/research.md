# Research: Duplicate Story Card

**Feature**: 042-duplicate-story-card  
**Phase**: 0 — Pre-design research  
**Date**: 2026-04-16

---

## Decision 1: Duplication Order and Cross-Entity ID Remapping

**Decision**: Duplicate assets in dependency order so each step has the IDs it needs from previous steps:

1. **Story** — creates `newStoryId`; all other entities reference it
2. **Tags** — depend only on `storyId`; produces `oldTagId → newTagId` map (needed by scenes)
3. **Characters** — depend only on `storyId`; produces `oldCharId → newCharId` map (needed by scene `pov` field)
4. **Colors** — depend only on `storyId`; no downstream consumers
5. **Plots** — depend only on `storyId`; produces `oldPlotId → newPlotId` map (needed by scenes)
6. **Scenes** — depend on `plotMap`, `tagMap`, and `charMap`; must remap `plotId`, `tags`, `tagVariants.tagId`, and `pov`
7. **Sections** — depend only on `storyId`; standalone, no cross-entity references

**Rationale**: This ordering guarantees that each duplication function receives fully-resolved IDs. No circular dependencies exist in the schema.

**Alternatives considered**: Duplicating in arbitrary order and doing a post-pass update was rejected — it would require two writes per entity and create window of inconsistency.

---

## Decision 2: MongoDB Transaction Strategy

**Decision**: Wrap all duplication writes in a single `ClientSession` using `client.withTransaction()` from `getClient()` (available in `utils/mongo.ts`). All six model-level duplication functions will accept an optional `session?: ClientSession`.

**Rationale**: MongoDB multi-document transactions require a replica set or sharded cluster. The existing models already accept `ClientSession?` on write operations (confirmed in `tags.ts`, `characters.ts`, `plots.ts`, `scenes.ts`, `stories.ts`, `sections.ts`), so the pattern is established. Using `withTransaction` provides automatic retry on transient errors and full rollback on failure — critical for avoiding partially-duplicated stories.

**Replica set note**: Transactions are only available on replica sets. For local development with a standalone MongoDB instance, the transaction block will throw `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos`. Plan must document that local dev should use a replica set (`--replSet rs0`) or Atlas. If desired, a graceful fallback (skip session if not available) can be added later.

**Alternatives considered**: No transaction (write each collection independently) was rejected because a failure mid-way would leave orphaned tags, characters, or plots under the new story ID with no cleanup path.

---

## Decision 3: Duplicate Model Functions — Naming and Return Types

**Decision**: Add the following new functions to the relevant model files. Each takes a `ClientSession?` and returns the duplicated documents or an ID mapping:

| Model file             | New function                                                                | Returns                                          |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| `models/stories.ts`    | `duplicateStory(sourceId, ownerId, session?)`                               | `StoryDocument`                                  |
| `models/tags.ts`       | `duplicateTagsByStory(sourceId, targetId, session?)`                        | `Map<string, ObjectId>` (old hex → new ObjectId) |
| `models/characters.ts` | `duplicateCharactersByStory(sourceId, targetId, session?)`                  | `Map<string, ObjectId>`                          |
| `models/colors.ts`     | `duplicateColorsByStory(sourceId, targetId, session?)`                      | `ColorDocument[]`                                |
| `models/plots.ts`      | `duplicatePlotsByStory(sourceId, targetId, session?)`                       | `Map<string, ObjectId>`                          |
| `models/scenes.ts`     | `duplicateScenesByPlots(sourcePlotIds, plotMap, tagMap, charMap, session?)` | `SceneDocument[]`                                |
| `models/sections.ts`   | `duplicateSectionsByStory(sourceId, targetId, session?)`                    | `SectionDocument[]`                              |

**Rationale**: Keeping duplication logic inside each model file preserves Clean Architecture — models own all MongoDB queries. Returning ID maps instead of just counts lets the service compose downstream operations without re-querying. Scene duplication takes source plot IDs (not story ID) because scenes are indexed by `plotId`, not `storyId` directly.

**Alternatives considered**: A single model-level "duplicate all" function was rejected because it would violate single-responsibility and make per-collection logic untestable. A generic `deepCopy` utility was rejected because it would bypass model-layer validation.

---

## Decision 4: Should Sections Be Duplicated?

**Decision**: Yes — sections (`acts`/`chapters`) are structural metadata belonging to the story and should be duplicated. The spec says "all its assets, including, colors, characters, tags, plots and scenes" — sections are the act/chapter structure and omitting them would produce a structurally incomplete copy.

**Rationale**: A story without its section structure would appear visually incomplete in the section sidebar. Sections reference only `storyId` with no cross-entity pointers, making them trivial to duplicate.

**Alternatives considered**: Skipping sections was considered (not listed explicitly in the spec), but the "all its assets" language and user intent to get a full copy supports including them.

---

## Decision 5: New Story Title

**Decision**: The server assigns the title `"Copy of {sourceTitle}"` automatically. No user prompt is shown before initiating duplication (confirmed in spec Assumptions and Out of Scope).

**Rationale**: Zero-friction duplication. Users can rename via the existing story update flow after duplication.

**Alternatives considered**: Prompting the user for a name was explored but is explicitly out of scope per the spec.

---

## Decision 6: Frontend — Placeholder Card and Optimistic State

**Decision**: A `duplicatingStoryIds` `Set<string>` is managed in `dashboardStore` (Zustand). When duplication begins, the source story's ID is added to the set; when it completes (or fails), it is removed. `StoryGrid` renders a `DuplicatingCard` placeholder at the end of the list for each active duplicating ID.

**Rationale**: The placeholder is keyed to the _source_ story ID (not a new story ID, which doesn't exist yet), making it easy to dedup and remove on completion. Using the existing `dashboardStore` keeps dashboard UI state centralized.

**Alternatives considered**: Using TanStack Query's `isPending` state was rejected because it doesn't naturally map to "show a phantom card in the grid". Using local React state in `DashboardPage` was rejected — the store is the established pattern for this component.

---

## Decision 7: Frontend — Success Toast and Highlighted Card

**Decision**: On successful duplication the mutation's `onSuccess` callback calls `alert.success("story created")` (using the existing `alert` utility from `utils/alert.tsx`) and sets `recentlyCreatedId` to the new story's ID. The existing `isNew` highlight on `StoryCard` is reused — it already does a `sky.300` glowing shadow for the recently-imported case.

**Rationale**: Reuses both the existing toast utility and the `isNew` card highlight pattern. No new UI primitives needed.

**Alternatives considered**: A separate "recently duplicated" highlight style was not needed since the `isNew` glow already communicates "this card just appeared".

---

## Decision 8: API Endpoint Shape

**Decision**: `POST /api/stories/:storyId/duplicate` with no request body. Authenticated user becomes the owner of the duplicate. Returns `{ story: StoryResponse }` — same shape as `POST /api/stories`.

**Rationale**: RESTful: `POST` to a sub-resource path signals creating a derived resource. No request body keeps the API minimal (title is auto-assigned). Returning the full story object means the frontend can merge it directly into the stories cache.

**Alternatives considered**: `POST /api/stories/:storyId/copy` — same idea, "duplicate" matches the UI label. A request body with `title` was kept out of scope.
