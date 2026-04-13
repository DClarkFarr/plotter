# Quickstart: Import Preview UI

## Prerequisites

- Dependencies installed in `express/` and `web/`.
- Both dev servers running.

## Run

1. Start the API: `npm run dev` from `express/`.
2. Start the web app: `npm run dev` from `web/`.
3. Open the dashboard.
4. Click the **Import outline** button near the Create story control.
5. Select a `.docx` file and click **Preview**.

## Expected Result

After the preview loads:

- A three-tab panel is visible: **Characters**, **Elements**, **Tags & Plots**.
- **Characters tab**: each detected character name appears in a list row with an "Ignore" checkbox and a "Merge with" button on the right.
- **Elements tab**: acts, chapters, and scenes appear as a nested outline; scenes have a secondary line showing POV and tag badges.
- **Tags & Plots tab**: tags without variants show a "Convert to plot" checkbox; variant-syntax tags show a read-only "Tag only" label.
- Toggling ignore or merge settings and clicking **Approve import** applies the customizations — ignored characters are absent from the created story, merged characters are consolidated, and plot-tagged items appear as Plot rows rather than Tags.

## Implementation Notes

### 1. Sending customizations on create

`importStoryOutline` in `web/src/api/stories.ts` appends `customizations` as a JSON string to `FormData` when `input.customizations` is present:

```ts
if (input.customizations) {
  formData.append("customizations", JSON.stringify(input.customizations));
}
```

The backend parses it with `JSON.parse(req.body.customizations ?? "null")` and validates the shape.

### 2. Preview response includes elements/tags/characters

`ImportOutlineResponse` in `web/src/api/types.ts` must include optional `elements`, `tags`, `characters`, and `issues` arrays. The backend already returns them for `preview` mode.

### 3. Character creation skips merge sources

In `importOutlineService.ts`, the character creation loop should skip any character whose ID appears as a key in `characterMerges`. After the loop, add re-mappings to `charIdMap`:

```ts
for (const [fromId, toId] of Object.entries(customizations.characterMerges)) {
  const target = charIdMap.get(toId);
  if (target) charIdMap.set(fromId, target);
}
```

### 4. Plot creation from tags

Before the tag creation loop, separate `plotTagIds` (eligibles only — no variants) and call `createPlot` for each. Track them in `plotMap: Map<string, ObjectId>`. Then in scene creation, if any `tagId` matches a `plotMap` entry, assign the scene to that plot and remove those IDs from `tags`/`tagVariants`.

### 5. ImportOutlinePreviewTabs component

This is a controlled component. All customization state lives in `ImportOutlineModal`. The tabs receive the parsed data and current customizations as props and call `onCustomizationChange` on every user action.

### 6. Plot color for imported plot-tags

Use a default color (e.g., `"#6B7280"`) for plots created from tags since no color information is available in the document. Consider incrementing `horizontalIndex` by the order the plot was registered.
