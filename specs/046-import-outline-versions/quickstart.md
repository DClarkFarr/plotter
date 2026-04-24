# Quickstart: Import Versions — Plot-as-Resource Round-Trip

**Branch**: `046-import-outline-versions`

---

## Prerequisites

- Backend running: `cd express && npm run dev`
- Frontend running: `cd web && npm run dev`
- A story with at least one act, chapter, two scenes, one POV character, one plot, and one snippet

---

## Test 1 — Modern round-trip with plots pre-seeded

### 1a. Export a story

1. Open the dashboard and click **Export** on any story.
2. Save the downloaded `.docx` file locally.

### 1b. Verify export structure (optional, using Word or LibreOffice)

- Acts are **Heading 1**
- Chapters are **Heading 2**
- Plot headings are **Heading 4** and begin with `| ` (e.g. `| Main Journey:`)
- Scene headings are **Heading 3** (e.g. `Alice: Arrival at the Port`)
- The line immediately after a scene heading contains bracket tags (e.g. `[Romance] [Action]`)
- Snippet headings are **Heading 5** and end with `:` (e.g. `Outline:`)
- Snippet body is indented

### 1c. Import with Modern format

1. Open the **Import Outline** modal.
2. Set the version selector to **Modern (current export format)**.
3. Upload the `.docx` exported in step 1a.
4. Click **Preview**.

### 1d. Verify preview — Plots tab

- The Plots tab should list **Main** (default) plus one entry for each plot in the exported
  story. These entries are pre-seeded from the parser; no manual "Convert to plot" step needed.
- Each plot entry shows a colour swatch, a name, and ignore/default radio controls.

### 1e. Verify preview — Elements tab

- Each scene row should show both:
  - Tag badges (purple/slate) for bracket-tag rows
  - **Violet** plot badges for the plot heading preceding each scene

### 1f. Verify preview — Tags tab

- The Tags tab should list only bracket-tag entries (e.g. `Romance`, `Action`).
- Plot names should **not** appear in the Tags tab.

### 1g. Verify preview — Characters tab

- Only actual POV character names appear. No `| Plot Title` entries.

### 1h. Verify issues panel

- No "Scene heading is not preceded by a modern plot heading" warnings.
- No "Modern plot heading should start with '|'" warnings.

### 1i. Complete import

1. Approve the preview.
2. Navigate to the imported story.
3. Verify plots, scenes, tags, characters, and snippets match the exported source.

---

## Test 2 — Legacy round-trip (regression check)

1. Select **Legacy (original format)** in the import modal.
2. Upload a legacy-format `.docx` (the original format supported before this feature).
3. Click **Preview**.
4. Verify:
   - Plots tab shows only **Main** (no pre-seeded plots from parser).
   - Tags tab shows all tags including any that were previously used as plot markers.
   - "Convert to plot" toggle works as before for any tag you want to promote.
5. Complete import and verify content matches expectations.

---

## Test 3 — Plot warning fix (H4 without pipe prefix)

1. Create a minimal `.docx` with:
   - H1: `Act One`
   - H2: `Chapter One`
   - H4: `Side Quest:` ← no `|` prefix, but is still Heading 4
   - H3: `Alice: Forest Encounter`
   - Paragraph: `[Action]`
2. Import with Modern format.
3. Verify: no "Modern plot heading should start with '|'" warning in the Issues section.
4. Verify: the plot **Side Quest** appears on the Plots tab and **Forest Encounter** shows it
   as a violet badge in the Elements tab.

---

## Test 4 — Import Type Mismatch Feedback

1. Open the import modal and choose **Legacy**.
2. Upload a known modern-export document.
3. Click **Preview** and verify the UI shows actionable warnings or an error summary indicating
   the format does not match the selected type.
4. Without closing the modal, change import type to **Modern**.
5. Re-run **Preview** and verify the parse succeeds with expected plots/tags/characters.

### Expected UX behavior

- The user can switch import type and retry in the same modal session.
- Errors/warnings are specific enough to suggest trying the other type when format mismatch is likely.
- No stale preview state persists after changing type and rerunning preview.

---

## Expected Issues (acceptable)

| Condition                                       | Issue message                                                              | Level   |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| Consecutive plot headings with no scene between | "Detected consecutive plot headings before a scene; using the latest one." | warning |
| Scene with no preceding plot                    | "Scene heading is not preceded by a modern plot heading."                  | warning |
| Snippet heading not followed by indented block  | "Snippet heading was not followed by an indented snippet block."           | warning |
| Plot heading with empty title                   | "Modern plot heading is missing a plot title."                             | warning |
