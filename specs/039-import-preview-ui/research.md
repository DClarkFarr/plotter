# Research: Import Preview UI

## Decision 1: How customizations are sent on the create request

- **Decision**: Serialize the `ImportCustomizations` object to a JSON string and append it as a `customizations` form field alongside the existing multipart file upload.
- **Rationale**: The endpoint already uses `multipart/form-data`. Adding a JSON-encoded field is the simplest extension that requires no new route and keeps the single-endpoint design intact.
- **Alternatives considered**: Splitting into two requests (preview → POST body JSON for create). Rejected because it would require re-uploading the file or caching it on the server, adding complexity without benefit.

## Decision 2: Where customization state lives on the frontend

- **Decision**: Store the in-progress customization state (`ignoredCharacterIds`, `characterMerges`, `plotTagIds`) as local `useState` within `ImportOutlineModal`, derived into an `ImportCustomizations` object at approve time.
- **Rationale**: The customization state does not outlive the modal session and has no value to the rest of the app. Local state and no Zustand store avoids unnecessary global state pollution.
- **Alternatives considered**: Zustand store slice. Rejected since the data expires when the modal closes.

## Decision 3: Preview response must expose parsed data to the frontend

- **Decision**: Extend `ImportOutlineResponse` on the frontend to include `elements`, `tags`, and `characters` arrays (already returned by the backend preview handler).
- **Rationale**: The backend already serializes these in the preview response. The frontend type definition was simply missing them. No backend changes are needed.
- **Alternatives considered**: A separate preview-only response type on the backend. Rejected as unnecessary; the existing response shape is already correct.

## Decision 4: Characters that are merge sources should not be created as DB documents

- **Decision**: Characters whose IDs appear as keys in `characterMerges` are skipped during the character creation loop. After all surviving characters are created, the merge remappings are applied to `charIdMap` so any scene referencing the alias resolves to the target character's DB ObjectId.
- **Rationale**: Prevents orphaned character documents. The alias character never needs to exist in the DB — the target already represents it.
- **Alternatives considered**: Create both characters and later delete the alias. Rejected as wasteful and error-prone.

## Decision 5: Tags marked as plots create Plot documents, not Tag documents

- **Decision**: During the `create` phase, tags whose IDs appear in `plotTagIds` are created as `Plot` documents (using `createPlot`) with no `Tag` document. A separate `plotMap` tracks parsed tag ID → DB Plot ObjectId. Tags not in `plotTagIds` follow the existing grouping/creation flow.
- **Rationale**: Mirrors the user's intent — these labels represent story plot tracks, not categorical tags. Keeps the import result immediately usable with no post-import cleanup.
- **Alternatives considered**: Create both a tag and a plot for the same label. Rejected as contradictory and likely to cause confusion.

## Decision 6: Scene-to-plot assignment when a scene has a plot-tag

- **Decision**: During scene creation, if any of the scene's `tagIds` resolve to a plot in `plotMap`, the scene is assigned to that plot's `plotId`. The first matching plot wins. plot-tag references are removed from the scene's `tags` array (they are not stored as tag associations on the scene). If a scene has more than one plot-tag, an `ImportIssue` of level `"warning"` is appended and the first matching plot is used.
- **Rationale**: A scene has exactly one `plotId` in the current data model. Choosing the first match and emitting a warning is predictable and transparent.
- **Alternatives considered**: Reject the import if any scene has two plot-tags. Rejected because it creates unnecessary friction for a rare edge case the user can fix post-import.

## Decision 7: Variant-syntax tags are never eligible for plot conversion

- **Decision**: Enforced on both the frontend (checkbox hidden for variant tags) and the backend (if a `plotTagId` refers to a tag that has a non-null variant, it is treated as a regular tag and the conversion is silently skipped with an issue logged).
- **Rationale**: Plots do not have variant semantics. A tag with a variant is a categorical taxonomy item, not a story plot track.
- **Alternatives considered**: Hard error if a variant tag is submitted as a plot. Rejected; silent skip is more forgiving of stale UI state.
