# Tasks: Export Story to .docx

**Input**: Design documents from `/specs/043-export-story-docx/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/export-endpoint.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup

**Purpose**: Install new dependencies required for server-side docx generation.

- [x] T001 Install `docx` and `node-html-parser` npm packages in express/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side utilities and ordering logic that all user stories depend on. Must complete before any story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Implement `listViewOrder.ts` — server-side port of list-view ordering (`orderForExport`) in `express/src/utils/listViewOrder.ts`
- [x] T003 [P] Implement `htmlToDocx.ts` — Tiptap HTML to `docx` Paragraph/TextRun converter in `express/src/utils/htmlToDocx.ts` (supports `<p>`, `<strong>`, `<em>`, `<u>`, `<s>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<h1>`–`<h4>`, `<span style="...">` for color/size; unknown elements fall back to plain text; null/empty input returns `[new Paragraph("")]`)

**Checkpoint**: Utilities ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Export a Story from the Dashboard (Priority: P1) 🎯 MVP

**Goal**: Wire up the full export flow: server endpoint → binary docx response → browser download + toast lifecycle.

**Independent Test**: Open the dashboard → open `...` menu on any story card → click "Export to .docx" → observe info toast with countdown → browser downloads a `.docx` file → toast dismisses. Verify with `curl` that `POST /stories/:storyId/export/docx` returns binary with correct `Content-Disposition` header.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `sanitizeFilename(title)` helper (strips `< > : " / \ | ? *` and control chars, replaces spaces with `_`, trims to 200 chars, fallback `"story"`) in `express/src/utils/listViewOrder.ts` (or a shared utils file)
- [x] T005 [P] [US1] Implement `contrastColor(hexColor)` helper (luminance formula → `"000000"` or `"FFFFFF"`) in `express/src/utils/htmlToDocx.ts`
- [x] T006 [US1] Implement `storyExportService.ts` — fetches story, plots, scenes (active only), sections, tags, and characters in parallel; calls `orderForExport`; builds `Paragraph[]` via `buildDocxParagraphs`; runs `Packer.toBuffer(doc)`; returns `{ buffer, filename }` in `express/src/services/storyExportService.ts` (depends on T002, T003, T004, T005)
- [x] T007 [US1] Add `POST /:storyId/export/docx` route to `express/src/routers/storyRouter.ts` — calls `requireUserId`, `getStoryForUser` (404 on miss), `storyExportService`, sets `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document` and `Content-Disposition: attachment; filename="<sanitized>.docx"` headers, sends buffer (depends on T006)
- [x] T008 [P] [US1] Add `exportStoryDocx(storyId: string): Promise<Blob>` API function to `web/src/api/stories.ts` using `apiClient.post(..., undefined, { responseType: 'blob' })`
- [x] T009 [US1] Add `useExportStoryMutation()` hook to `web/src/hooks/useStories.ts` — uses TanStack Query `useMutation`; tracks exporting story ids via Zustand `dashboardStore`; on success triggers blob download via temporary `<a>` element + `URL.createObjectURL` + `URL.revokeObjectURL`; on error, delegates toast update to call site (depends on T008)
- [x] T010 [US1] Add `exportingStoryIds` set + `addExportingId` / `removeExportingId` actions to `web/src/store/dashboardStore.ts`
- [x] T011 [US1] Add "Export to .docx" `DropdownItem` to `web/src/components/dashboard/StoryCard.tsx` — accept `onExport` prop and `isExporting` prop (mirrors `onDuplicate` / `isDuplicating` pattern); `isExporting` disables the item; clicking calls `onExport(story)` (depends on T009, T010)
- [x] T012 [US1] Wire export in `web/src/pages/dashboard.tsx` (or `StoryGrid`) — call `useExportStoryMutation`; pass `onExport` and `isExporting={exportingStoryIds.has(story.id)}` to each `StoryCard`; on click show info toast immediately, on success dismiss toast and trigger download, on error update toast to error state (depends on T011)

**Checkpoint**: US1 fully functional — dashboard export button → binary download works end-to-end.

---

## Phase 4: User Story 2 — Toast Countdown Scaled to Story Size (Priority: P2)

**Goal**: The info toast shows a progress bar countdown computed from the story's scene count (5 s base + 0.3 s/scene, capped 60 s). If the server responds before the countdown expires, the toast dismisses immediately; if the server is slower, the toast stays until the response arrives.

**Independent Test**: Export a 0-scene story — observe toast countdown ~5 s. Export a story with 20 scenes — observe countdown ~11 s. In both cases confirm the toast dismisses precisely when the download starts, not before.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add `computeExportToastDuration(sceneCount: number): number` utility (formula: `Math.min(5000 + sceneCount * 300, 60000)`) to `web/src/api/stories.ts` or a shared `web/src/utils/export.ts`
- [x] T014 [US2] Update dashboard export handler (`web/src/pages/dashboard.tsx` or call site from T012) — derive `sceneCount` from already-loaded story stats; pass computed duration to `toast(...)` as `autoClose: duration`; use a `toastId` ref to call `toast.dismiss(toastId)` on download start; if response arrives after `autoClose` fires, the toast has already gone — no action needed (depends on T012, T013)

**Checkpoint**: Toast countdown is scaled to story size and dismisses precisely when download starts.

---

## Phase 5: User Story 3 — Docx Mirrors the List View Layout (Priority: P1)

**Goal**: The assembled docx faithfully reflects the list view: acts (H1), chapters (H2), scenes (H3) in `verticalIndex` order, each scene showing plot label, POV character, colour-shaded tag labels, rich-text description, and monospaced snippets.

**Independent Test**: Open the list view for a story with at least one act, one chapter, two scenes with different POV characters, tags, bold/italic description text, and at least one snippet. Export to .docx. Open in Word/LibreOffice. Verify heading hierarchy and order match the list view; POV names, tag colours, bold/italic, and snippet monospace are all present.

### Implementation for User Story 3

- [x] T015 [P] [US3] Implement `buildDocxParagraphs(storyTitle, entries, context)` in `express/src/services/storyExportService.ts` — maps ordered `ListViewEntry[]` to `Paragraph[]` per the data-model paragraph rules: story title as Title style; act sections as H1; chapter sections as H2; section descriptions via `htmlToDocxRuns`; scene title as H3; plot name as muted small-caps paragraph; POV character name paragraph (if set); tag row paragraph with shaded `TextRun` per tag (using `contrastColor`); scene description via `htmlToDocxRuns`; snippet label paragraph; snippet body via `htmlToDocxRuns` with Courier New font override; blank spacer between scenes (depends on T002, T003, T005, T006)
- [x] T016 [US3] Wire `buildDocxParagraphs` into `storyExportService.ts` `Packer.toBuffer` call, ensuring numbering definitions for `bullet` and `ordered` list references are added to the `Document` constructor (depends on T015)

**Checkpoint**: All three user stories fully functional — the exported .docx mirrors the list view layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling hardening, edge cases, and manual verification.

- [x] T017 [P] Handle server error response in `storyExportService.ts` — catch any docx assembly error, log it, return a clean `500` with `{ error: "Export failed" }` (no stack trace in production)
- [x] T018 [P] Handle empty story edge case in `buildDocxParagraphs` — if `entries` is empty, produce a valid single-paragraph docx with just the story title (no crash)
- [ ] T019 Run the quickstart manual verification checklist from `specs/043-export-story-docx/quickstart.md` and confirm all items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (packages must be installed first)
- **US1 (Phase 3)**: Depends on Phase 2 (utilities must exist)
- **US2 (Phase 4)**: Depends on Phase 3 (toast is created in US1 handler; US2 extends it)
- **US3 (Phase 5)**: Depends on Phase 2; T015–T016 extend the `storyExportService` built in US1 (T006); implement after T006
- **Polish (Phase 6)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Core end-to-end flow — must come first
- **US2 (P2)**: Builds on US1 toast call — depends on US1 handler existing
- **US3 (P1)**: Docx body fidelity — extends service built in US1; can be developed in parallel with US2

### Parallel Opportunities

Within Phase 2: T002 and T003 touch different files — run in parallel.  
Within Phase 3: T004, T005, T008, T010 touch independent files — run in parallel. T009, T011, T012 each depend on prior tasks but not on each other except via sequential data flow.  
Across phases: US2 and US3 can be started in parallel once US1 Phase 3 baseline is done.  
Within Phase 6: T017 and T018 touch different concerns — run in parallel.

### Parallel Example: Phase 2 (Foundational)

```
Parallel launch:
  T002 — express/src/utils/listViewOrder.ts
  T003 — express/src/utils/htmlToDocx.ts
```

### Parallel Example: Phase 3 (US1 — early tasks)

```
Parallel launch (all independent files):
  T004 — sanitizeFilename utility
  T005 — contrastColor utility
  T008 — web/src/api/stories.ts (exportStoryDocx function)
  T010 — web/src/store/dashboardStore.ts (exportingStoryIds)

Then sequential:
  T006 — storyExportService.ts (depends on T002, T003, T004, T005)
  T007 — storyRouter.ts route (depends on T006)
  T009 — useExportStoryMutation hook (depends on T008, T010)
  T011 — StoryCard.tsx DropdownItem (depends on T009, T010)
  T012 — dashboard.tsx wiring (depends on T011)
```

---

## Implementation Strategy

### MVP First (US1 only — full download flow)

1. Complete Phase 1: Install packages
2. Complete Phase 2: Utilities (T002, T003 in parallel)
3. Complete Phase 3: US1 (T004–T012)
4. **STOP and VALIDATE**: curl the endpoint, use the UI, confirm download works
5. Extend with US2 (toast countdown) and US3 (list-view fidelity) as increments

### Incremental Delivery

1. Phase 1 + 2 → utilities ready
2. Phase 3 (US1) → working export button + download, basic flat docx ← **ship this**
3. Phase 4 (US2) → toast countdown scaled to scene count ← quality improvement
4. Phase 5 (US3) → full list-view fidelity in the docx ← full feature complete
5. Phase 6 → polish + edge cases

---

## Notes

- `[P]` = parallelizable (different files, no dependency on an unfinished task)
- `[US1]`/`[US2]`/`[US3]` = maps task to a specific user story for traceability
- No automated tests required per constitution
- Commit after each task or logical group
- Validate against quickstart.md checklist after Phase 5
