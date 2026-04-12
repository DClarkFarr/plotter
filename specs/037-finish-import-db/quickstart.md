# Quickstart: Finish Import — Database Creation

**Branch**: `037-finish-import-db`

---

## Prerequisites

- Server running: `cd express && npm run dev`
- A `.docx` file conforming to the import format (H1 = act, H2 = chapter, H4 = scene)
- Authenticated session (log in via the UI or seed a session cookie)

---

## Manual end-to-end test

### 1. Upload in preview mode first (sanity check)

```bash
curl -s -X POST http://localhost:3000/api/import/outline \
  -H "Cookie: <your-session-cookie>" \
  -F "mode=preview" \
  -F "file=@./test.docx" | jq .
```

Verify `elements`, `tags`, and `characters` look correct. Check `issues` for errors.

### 2. Approve and create

```bash
curl -s -X POST http://localhost:3000/api/import/outline \
  -H "Cookie: <your-session-cookie>" \
  -F "mode=create" \
  -F "storyName=My Test Import" \
  -F "file=@./test.docx" | jq .
```

Expected response:

```json
{
  "mode": "create",
  "message": "Import completed",
  "storyId": "...",
  "storyName": "My Test Import",
  "summary": "..."
}
```

### 3. Verify in MongoDB

```js
// In mongosh:
const storyId = ObjectId("<storyId from response>")

db.stories.findOne({ _id: storyId })
db.plots.find({ storyId }).toArray()
db.sections.find({ storyId }).sort({ verticalIndex: 1 }).toArray()
db.tags.find({ storyId }).toArray()
db.characters.find({ storyId }).toArray()

const plotId = db.plots.findOne({ storyId })._id
db.scenes.find({ plotId }).sort({ verticalIndex: 1 }).toArray()
```

Confirm:
- One story, one plot
- Sections for every act and chapter in document order
- Scenes for every H4, positioned between their parent sections by `verticalIndex`
- Tags with correct colors and `variants[]` populated
- Each scene's `pov` matches the parsed character ObjectId

---

## Testing a transaction rollback

To verify atomicity, temporarily throw inside the `importService` transaction callback after some inserts and confirm:
- No story, plot, sections, scenes, tags, or characters are left behind for that `storyId`.

---

## Key files

| File | Purpose |
|------|---------|
| `express/src/utils/mongo.ts` | Add `getClient()` export |
| `express/src/services/importOutlineService.ts` | Replace story-only creation with full transactional import |
| `express/src/models/tags.ts` | Use existing `createTag` / add case-insensitive lookup |
| `express/src/models/characters.ts` | Use existing `createCharacter` / add case-insensitive lookup |
| `express/src/models/plots.ts` | Use existing `createPlot` |
| `express/src/models/sections.ts` | Use existing `createSection` |
| `express/src/models/scenes.ts` | Use existing `createScene` |
