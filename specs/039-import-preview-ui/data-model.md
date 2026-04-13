# Data Model: Import Preview UI

## ImportCustomizations

Sent by the frontend as a JSON string in the `customizations` form field on the `create` request. Also defined as a TypeScript type on both sides of the API.

| Field                 | Type                     | Description                                                                         |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `ignoredCharacterIds` | `string[]`               | Parsed character IDs to exclude; no DB character is created for these IDs.          |
| `characterMerges`     | `Record<string, string>` | Map of `{ fromId: toId }` — scenes referencing `fromId` resolve to `toId`'s DB doc. |
| `plotTagIds`          | `string[]`               | Parsed tag IDs to treat as plots; a Plot document is created instead of a Tag.      |

### Backend validation rules

- Any ID in `ignoredCharacterIds` that doesn't match a parsed character is silently skipped.
- Any ID in `characterMerges` whose target does not exist in the parse result is skipped (the alias becomes ignored rather than merged).
- Any ID in `plotTagIds` that refers to a tag with a non-null variant is skipped (variant tags cannot become plots); an issue is logged.

---

## Modified: ImportOutlinePayload (backend)

Extends the existing type to accept customizations during the `create` phase.

| Field            | Type                           | New? |
| ---------------- | ------------------------------ | ---- |
| `userId`         | `string`                       | —    |
| `mode`           | `ImportOutlineMode`            | —    |
| `file`           | `Express.Multer.File`          | —    |
| `storyName`      | `string \| undefined`          | —    |
| `customizations` | `ImportCustomizations \| null` | ✅   |

---

## Modified: ImportOutlineInput (frontend API types)

Extends the input type sent by `importStoryOutline`.

| Field            | Type                           | New? |
| ---------------- | ------------------------------ | ---- |
| `mode`           | `ImportOutlineMode`            | —    |
| `file`           | `File`                         | —    |
| `storyName`      | `string \| undefined`          | —    |
| `customizations` | `ImportCustomizations \| null` | ✅   |

---

## Modified: ImportOutlineResponse (frontend API types)

Extends the preview response so the frontend can render the tabs.

| Field        | Type                          | New? |
| ------------ | ----------------------------- | ---- |
| `mode`       | `ImportOutlineMode`           | —    |
| `storyName`  | `string`                      | —    |
| `summary`    | `string`                      | —    |
| `message`    | `string \| null \| undefined` | —    |
| `storyId`    | `string \| null \| undefined` | —    |
| `elements`   | `Element[] \| undefined`      | ✅   |
| `tags`       | `Tag[] \| undefined`          | ✅   |
| `characters` | `Character[] \| undefined`    | ✅   |
| `issues`     | `ImportIssue[] \| undefined`  | ✅   |

_(`Element`, `Tag`, `Character`, `ImportIssue` are already defined in `api/types.ts` or need to be co-defined to match what the backend returns.)_

---

## New component: ImportOutlinePreviewTabs

**File**: `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`

### Props

| Prop                    | Type                                | Description                                    |
| ----------------------- | ----------------------------------- | ---------------------------------------------- |
| `characters`            | `ParsedCharacter[]`                 | Detected characters from parse result.         |
| `elements`              | `ParsedElement[]`                   | Acts, chapters, scenes in document order.      |
| `tags`                  | `ParsedTag[]`                       | Detected tags from parse result.               |
| `customizations`        | `ImportCustomizations`              | Current user customization state (controlled). |
| `onCustomizationChange` | `(c: ImportCustomizations) => void` | Called on every change to any customization.   |

### Internal state

None — this is a fully controlled component. All state lives in `ImportOutlineModal`.

---

## Tab 1 — CharactersTab

Each row represents one detected character.

| UI Element        | Behaviour                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Character name    | Primary row label.                                                                                       |
| Ignore checkbox   | Adds/removes `character.id` from `customizations.ignoredCharacterIds`. Row becomes gray + strikethrough. |
| Merge with button | Shown when not in ignored state. Clicking opens an inline `<select>` listing all other characters.       |
| Merge dropdown    | Shows all other characters (not ignored). Selecting sets `characterMerges[character.id] = selectedId`.   |
| Clear merge       | Small "×" or equivalent shown alongside the merge label; clears the mapping.                             |

### Validation rule

A character that is the target of a merge should not itself be in the merge dropdown list as a source — only non-ignored, non-merge-source characters appear as targets.

---

## Tab 2 — ElementsTab

Displays parsed elements as a nested read-only outline. No user interaction on this tab.

| Element Type | Visual Treatment                                                                         |
| ------------ | ---------------------------------------------------------------------------------------- |
| Act          | Bold, large text — section heading level.                                                |
| Chapter      | Medium bold text, indented under acts.                                                   |
| Scene        | Normal text, indented under chapters. Secondary line with POV badge and tag name badges. |

A "POV badge" is a small pill showing the POV character name. Tag badges show tag names (and variant labels where applicable). These are purely informational; no colors are available at parse time.

---

## Tab 3 — TagsTab

Each row represents one distinct tag name from the parse result.

| UI Element                 | Condition              | Behaviour                                                    |
| -------------------------- | ---------------------- | ------------------------------------------------------------ |
| Tag name                   | Always                 | Primary row label.                                           |
| Variant label              | When `variant != null` | Secondary text showing the variant, e.g. `[name:variant]`.   |
| "Tag only" indicator       | When `variant != null` | Text label or icon indicating this tag cannot become a plot. |
| "Convert to plot" checkbox | When `variant == null` | Adds/removes `tag.id` from `customizations.plotTagIds`.      |

### Notes

- A tag group may have the same `name` but appear multiple times in the tags array with different `variant` values. They should be grouped visually by name. Only tag entries with `variant == null` display the convert-to-plot control.
- Checking "Convert to plot" means the import will create a Plot document named after the tag, not a Tag document.

---

## Internal: create-phase logic in importOutlineService

### Character resolution order

1. Identify `skipIds` = `ignoredCharacterIds` ∪ keys of `characterMerges`.
2. Create DB characters for all parsed characters NOT in `skipIds`.
3. After creation loop, apply merges: for each `(fromId, toId)` in `characterMerges`, set `charIdMap.set(fromId, charIdMap.get(toId))` if the target exists.

### Tag/plot resolution order

1. Identify eligible plot tag IDs = `plotTagIds` filtered to tags with `variant == null`.
2. For each eligible plot tag: look up the tag name; call `createPlot` with the tag name and a default color; register in `plotMap`.
3. All remaining tag groups are processed as before into `tagIdMap`.

### Scene plot assignment

1. For each scene, scan its `tagIds`. If any map to an entry in `plotMap`, assign the scene to that plot's `_id`. Use the first match; log a warning issue if more than one match.
2. Strip plot-designated tag IDs from the `tags` and `tagVariants` arrays before calling `createScene`.
3. If no plot-tag match, assign scene to the default Main plot as before.
