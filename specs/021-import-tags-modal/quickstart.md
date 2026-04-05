# Quickstart

## Local Usage

1. Start the API server from `express/` with `npm run dev`.
2. Start the web app from `web/` with `npm run dev`.
3. Open the story dashboard, then open the tag manager.
4. Click "Import tags" and select a story.
5. Select tags to import and click "Import tags" in the modal.

## Manual API Check

Example request:

```bash
curl -X POST http://localhost:3000/stories/<toStoryId>/tags/import \
  -H "Content-Type: application/json" \
  -d '{"fromStoryId":"<fromStoryId>","toStoryId":"<toStoryId>","tagIds":["<tagId1>","<tagId2>"]}'
```
