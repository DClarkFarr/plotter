# Research: Finish Import — Database Creation

**Branch**: `037-finish-import-db`  
**Phase**: 0 — Unknowns resolved before design

---

## Decision 1: MongoDB Transaction Strategy

**Decision**: Use `client.startSession()` from the existing `MongoClient` instance in `express/src/utils/mongo.ts`, then `session.withTransaction(callback)` inside the import service. The `client` variable is currently module-private; it must be exported via a new `getClient()` helper.

**Rationale**: `session.withTransaction()` provides automatic commit/abort and retry on transient errors. MongoDB transactions require a replica set or Atlas cluster — the production deployment on Atlas already satisfies this. Local dev uses a replica set connection string via `MONGO_URL`.

**Alternatives considered**:
- Manual `session.startTransaction()` / `session.commitTransaction()` / `session.abortTransaction()` — more verbose, `withTransaction()` preferred.
- Application-level rollback (manually delete inserted documents on error) — fragile; requires tracking all inserted IDs; rejected.

---

## Decision 2: Default Plot Creation

**Decision**: Create a single plot record (`horizontalIndex: 0`, title matching the story name) as part of the import transaction. All imported scenes are assigned to this plot.

**Rationale**: The `SceneDefinition` requires a `plotId` (FK to `plots`). The import parser does not produce plot data. A sensible default — one plot column per imported story — gives users a valid starting grid they can expand later.

**Alternatives considered**:
- No plot (leave `plotId` null) — violates schema, rejected.
- Multiple plots (one per act) — over-engineered for an import default; no clear mapping from acts to plot columns.

---

## Decision 3: `verticalIndex` Assignment for Sections and Scenes

**Decision**: All sections (acts and chapters) and scenes share a single monotonically increasing `verticalIndex` counter per story. Elements are processed in document order from `elements[]` in the parse result. Each element (act, chapter, or scene) consumes the next index value starting at `0`.

**Rationale**: The `sections` collection has a unique index on `(storyId, verticalIndex)` and the `scenes` collection has a unique index on `(plotId, verticalIndex)`. Sections and scenes are sibling rows in the plot grid, not hierarchically nested in the DB. The `verticalIndex` positions them relative to each other visually.

**Alternatives considered**:
- Separate counters for sections vs. scenes — breaks the visual grid where acts/chapters interleave with scenes.
- Using document order from parser-assigned `id` strings — no numeric ordering guaranteed; rejected.

---

## Decision 4: Tag Deduplication and Variant Handling

**Decision**: For each tag in `parsed.tags`, perform a case-insensitive name lookup against `{ storyId, name }`. If a match exists, reuse its `ObjectId`. If not, create a new tag with `color` from the parse result (or `#000000` default), `variant: tag.variant !== null`, and `variants: [tag.variant]` if a variant is present.

If the same tag is reused and the scene has a new variant not yet in `tag.variants`, the tag record must be updated to append the variant. The `SceneTagVariant` entry on the scene references the tag `ObjectId` and variant string.

**Rationale**: Preserving the highlight color from the docx is required (FR-010). Tags are story-scoped so dedup is safe across the single new story. Variant strings are stored on both the tag (`variants[]` array) and the scene join (`tagVariants[]`).

**Alternatives considered**:
- Always create new tags, skip dedup — would conflict on the `(storyId, name)` unique index; rejected.
- Store color only on the scene join — existing tag model stores color at the tag level; follow existing schema.

---

## Decision 5: Character Deduplication and POV Linking

**Decision**: For each character in `parsed.characters`, perform a case-insensitive title lookup against `{ storyId, title }`. Reuse if found; create otherwise. Build a map from parse `id` → DB `ObjectId`.

Scene `pov` field (type `ObjectId | null`) is set to the mapped character `ObjectId` for the `povCharacterId` from the parsed scene, or `null` if none.

**Rationale**: Character uniqueness in `characters` collection is indexed on `(storyId, title)` (non-unique index, but logical dedup enforced by service layer). Case-insensitive matching aligns with spec FR-006.

**Alternatives considered**:
- Strict case-sensitive match — would create duplicates for "John" vs. "john"; rejected per spec.

---

## Decision 6: Empty Import Guard

**Decision**: Before starting the transaction, check that `parsed.elements` contains at least one element with `type === "scene"`. If not, return an error response without touching the database.

**Rationale**: FR-012 requires rejection of empty imports. This check is cheap and prevents wasted transaction overhead.

---

## Decision 7: Source of `MongoClient` for Session

**Decision**: Export `getClient(): MongoClient` from `express/src/utils/mongo.ts`. The import service calls `getClient().startSession()` to obtain a `ClientSession`.

**Rationale**: The `Db` instance stored in `db.ts` does not expose a direct `startSession()`. The `MongoClient` is already stored in `mongo.ts`; exposing it is a minimal change.

**Alternatives considered**:
- Pass `ClientSession` from the router — leaks infrastructure concerns into routing; rejected.
- Use `getDb().client` — `Db.client` is available in the MongoDB Node.js driver but undocumented; rejected for fragility.
