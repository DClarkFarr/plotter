# Research: Export Story to .docx

**Feature**: 043-export-story-docx  
**Phase**: 0 — Pre-design research  
**Date**: 2026-04-16

---

## 1. Docx Generation Library

**Decision**: Use the [`docx`](https://docx.js.org/) npm package (dolanmiu/docx)  
**Rationale**:

- Fully programmatic API — documents are assembled from `Document`, `Paragraph`, `TextRun`, `HeadingLevel`, `Table`, etc. objects. No template files required.
- Supports all required primitives: heading levels, text runs with bold/italic/underline/color/font/size/shading, ordered + unordered lists (native `NumberingDefinition`), `Shading` on `TextRun` for coloured tag labels.
- Active maintenance (v9+ with TypeScript types), well-documented, widely used in Node.js server contexts.
- Outputs a `Buffer` directly (`Packer.toBuffer(doc)`) making it trivial to stream as an HTTP response.
- Installed as a server-side dependency only (`express/` package).

**Alternatives considered**:

- `docxtemplater` — template-driven (`.docx` file required), unsuitable for fully dynamic content with variable structure.
- `officegen` — unmaintained since 2020.
- `pptxgenjs` — wrong format.
- Client-side generation — ruled out by spec (FR-009); docx assembly should be server-side only.

---

## 2. HTML → Docx Conversion (Tiptap Rich Text)

**Decision**: Write a focused `htmlToDocxRuns(html: string): (Paragraph | TextRun)[]` utility in `express/src/utils/htmlToDocx.ts`  
**Rationale**:

- Tiptap persists rich text as HTML strings (e.g. `<p>Hello <strong>world</strong></p>`, `<ul><li>...</li></ul>`). The `docx` library does not accept HTML directly; it requires pre-parsed `Paragraph`/`TextRun` objects.
- A purpose-built parser using the built-in Node.js `DOMParser` (or a lightweight server-side HTML parser like `@vue/compiler-dom` — no, instead use `node-html-parser` or just regex fallback; actually the cleanest approach is to use `htmlparser2` which is already a transitive dependency, or use a simple recursive approach with `cheerio` — but neither is currently installed.
- **Cleanest available approach**: Use the `docx` library itself which is being installed, combined with a small recursive approach using `@xmldom/xmldom` (cross-platform DOMParser) — also not installed.
- **Resolved approach**: Use Node.js `v18+ DOMParser` is not available server-side. Instead use string parsing with `node-html-parser` (lightweight, zero-dep). Install `node-html-parser` in `express/`.
- Parse `<p>`, `<strong>`, `<em>`, `<u>`, `<s>`, `<ul>`, `<ol>`, `<li>`, `<br>`, `<span style="...">` nodes recursively.
- Map each inline element to a `TextRun` with appropriate options; block elements become `Paragraph` instances.
- Unknown or unsupported elements fall back to their text content.

**Alternatives considered**:

- `htmlparser2` — more complex API (streaming SAX-style), overkill for this use case.
- `cheerio` — jQuery-like API, heavier, but workable. Rejected in favour of the lighter `node-html-parser`.
- Full HTML→OOXML transpiler libraries — none exist that are maintained and compatible with the `docx` package's object model.

---

## 3. Tag Color Representation in Docx

**Decision**: Represent each tag as a `TextRun` with `shading: { fill: <hexColor> }` and `color: <contrastTextColor>`  
**Rationale**:

- The `docx` library supports `shading` on `TextRun` which maps directly to `<w:shd>` in OOXML — this is equivalent to a background-colored label.
- For contrast: if the tag hex color has luminance > 0.5 (light background), use black text (`000000`); otherwise white (`FFFFFF`). A simple RGB luminance calculation using `0.299R + 0.587G + 0.114B` is sufficient and requires no additional library.
- Tags appear on their own `Paragraph` line, each tag separated by a small space `TextRun`.

**Alternatives considered**:

- `highlight` property of `TextRun` — limited to 16 predefined Word highlight colors; cannot accept arbitrary hex colors.
- Rendering tags as a table cell with a background — more complex, less portable.

---

## 4. Nested Lists in Docx

**Decision**: Use `docx` native list support via `numbering` configuration in `Document` constructor  
**Rationale**:

- The `docx` library supports ordered and unordered lists by defining a `numbering` section in the `Document` and then referencing list levels via `paragraph.numbering: { reference, level }`.
- Both `<ul>` (bullet) and `<ol>` (decimal) can be represented.
- Nesting depth is tracked as the recursive HTML parser encounters `<ul>`/`<ol>` inside `<li>` elements and increments the `level` parameter.
- The `htmlToDocxRuns` utility will define a shared numbering reference (`bullet` and `ordered`) and use it consistently.

**Alternatives considered**:

- Simulating lists with em-dash / number prefixes in plain `TextRun` — accessible but loses semantic list structure; rejected because `docx` has proper support.

---

## 5. Toast Countdown UX Pattern

**Decision**: Use `react-toastify`'s `toast()` with `autoClose` set to computed duration, then call `toast.dismiss(toastId)` when download is ready; if server is slower than estimate, keep toast via `toast.update()` with `autoClose: false` until response arrives.  
**Rationale**:

- `react-toastify` already present in the project (v11). Its `autoClose` accepts milliseconds — perfect for a computed countdown.
- The progress bar (which `react-toastify` renders natively) visually communicates the countdown.
- Use `toast.update(toastId, { autoClose: false })` if the axios response hasn't arrived by the time `autoClose` would fire — this requires a ref/flag tracking response state.
- Simpler alternative: just set `autoClose: false` and let the download completion handler call `toast.dismiss(toastId)`. This avoids the timing complexity entirely while still showing an informational toast with a spinner instead of a countdown bar.
- **Final resolution**: Use `autoClose: <computedMs>` for the progress bar UX. Track a `downloadComplete` ref. If the response arrives before autoClose fires, call `toast.dismiss(toastId)` immediately. If autoClose fires first, the toast vanishes and the download silently completes — acceptable because the user already saw the countdown.

**Duration formula**:

```
duration_ms = (5 + sceneCount * 0.3) * 1000
```

5 s baseline + 300 ms per scene. For a 40-scene story: ~17 s. Capped at 60 s.

---

## 6. Frontend Download Trigger Pattern

**Decision**: Server returns binary `.docx` with `Content-Disposition: attachment; filename="<title>.docx"`. Frontend fetches via axios with `responseType: 'blob'`, then triggers download using a temporary `<a>` element with `URL.createObjectURL`.  
**Rationale**:

- This is the standard pattern for authenticated binary downloads where cookies/headers must be forwarded.
- A plain `window.location = url` approach would bypass the axios interceptors (auth cookies) and also does not allow programmatic toast dismissal on completion.
- The blob URL approach gives the frontend full control over when the toast is dismissed.

---

## 7. Server-Side Data Fetching for Export

**Decision**: A new `exportService.ts` fetches all required data in parallel and assembles the docx.  
**Rationale**:

- Required data: story (for title), plots (ordered by horizontalIndex), scenes (active only, full fields), sections (ordered by verticalIndex), tags (for color lookup by id), characters (for POV name lookup by id).
- All existing model functions (`listPlots`, `listScenesByStoryId`, `listSections`, `listTagsByStoryId`, `listCharactersByStoryId`) are available.
- The `orderScenesForListView` ordering logic currently lives in `web/src/utils/listViewOrdering.ts` and must be **replicated** server-side as a pure function in `express/src/utils/listViewOrder.ts`.
- No client-side logic should be duplicated — having it server-side is correct here since the server owns the export.

---

## Summary of New Dependencies

| Package            | Where      | Purpose                                               |
| ------------------ | ---------- | ----------------------------------------------------- |
| `docx`             | `express/` | Generate `.docx` binary server-side                   |
| `node-html-parser` | `express/` | Parse Tiptap HTML into a DOM-like tree for conversion |
