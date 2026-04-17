# Quickstart: Export Story to .docx

**Feature**: 043-export-story-docx  
**Phase**: 1 — Design  
**Date**: 2026-04-16

---

## Prerequisites

- Node.js 18+ installed
- MongoDB running (see main project README)
- Both `express/` and `web/` dev servers running (or the combined `npm run dev` from project root if configured)

---

## 1. Install New Dependencies

```bash
# Server-side docx generation and HTML parsing
cd express
npm install docx node-html-parser
```

---

## 2. Verify the Endpoint Manually

Start the Express dev server and use any HTTP client:

```bash
# From project root
cd express && npm run dev
```

```bash
# In a separate terminal — replace TOKEN and STORY_ID with real values
curl -X POST "http://localhost:3001/stories/<STORY_ID>/export/docx" \
  -H "Cookie: connect.sid=<your-session-cookie>" \
  --output test-export.docx

# Verify it's a valid docx (should start with PK zip header)
xxd test-export.docx | head -2
file test-export.docx
```

Open `test-export.docx` in Word or LibreOffice to inspect structure.

---

## 3. Verify the UI Flow

1. Start both servers (`express/` and `web/`).
2. Open the dashboard in the browser.
3. Click the `...` icon on any story card.
4. Click **"Export to .docx"**.
5. Observe:
   - An info toast appears immediately with a countdown progress bar.
   - The "Export to .docx" menu item is disabled while the request is in flight.
   - The browser starts a download when the request completes.
   - The toast dismisses automatically.
6. Open the downloaded file and verify it mirrors the list view for that story.

---

## 4. Checklist for Manual Verification

### Endpoint / server

- [ ] `POST /stories/:storyId/export/docx` returns `200` with `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- [ ] `Content-Disposition` header contains the sanitised story title
- [ ] The `.docx` file opens in Word/LibreOffice without errors
- [ ] Requesting an unknown `storyId` returns `404`
- [ ] Requesting without a session returns `401`

### Document structure

- [ ] Story title appears at the top
- [ ] Act sections render as Heading 1
- [ ] Chapter sections render as Heading 2
- [ ] Scene titles render as Heading 3
- [ ] Order matches the in-app list view (`verticalIndex` ascending)
- [ ] Plot name appears below scene heading in muted uppercase text
- [ ] POV character name appears when set
- [ ] Tags appear as colour-shaded labels with readable text
- [ ] Bold and italic text in scene descriptions is preserved
- [ ] Unordered and ordered lists in descriptions are preserved as proper docx lists
- [ ] Snippets appear after description with label (uppercase) and monospaced body

### UI / UX

- [ ] Toast appears within ~500 ms of clicking the menu item
- [ ] Toast progress bar matches the computed duration (5 s + 0.3 s × scene count)
- [ ] Toast dismisses when the download starts
- [ ] Menu item is disabled during export (no duplicate requests possible)
- [ ] If the server returns an error, the toast transitions to an error state

### Edge cases

- [ ] Export a story with 0 scenes and 0 sections — produces a valid `.docx` with just the title
- [ ] Export a story with a title containing special characters (`/ : * ? "`) — filename is sanitised correctly
- [ ] Simulate a server error — toast shows error message, no file downloads

---

## 5. Key File Locations

| File                                                       | Purpose                                          |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `express/src/routers/storyRouter.ts`                       | Add `POST /:storyId/export/docx` route           |
| `express/src/services/storyExportService.ts`               | Data fetching + docx assembly                    |
| `express/src/utils/htmlToDocx.ts`                          | Tiptap HTML → `docx` Paragraph/TextRun converter |
| `express/src/utils/listViewOrder.ts`                       | Server-side port of list view ordering logic     |
| `web/src/api/stories.ts`                                   | Add `exportStoryDocx()` function                 |
| `web/src/hooks/useStories.ts`                              | Add `useExportStoryMutation()`                   |
| `web/src/components/dashboard/StoryCard.tsx`               | Add "Export to .docx" menu item + toast          |
| `specs/043-export-story-docx/data-model.md`                | Data shapes and transformation rules             |
| `specs/043-export-story-docx/contracts/export-endpoint.md` | Endpoint contract                                |
| `specs/043-export-story-docx/research.md`                  | Library choices and rationale                    |
