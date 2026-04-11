# Quickstart: Col Header Row Actions

## Goal

Verify the column header hover actions insert rows, create sections, and clear empty rows with the correct shift behavior.

## Prerequisites

- Web app running from `web/`
- Access to a story with a plot grid

## Manual Verification Steps

1. **Hover actions visibility**
   - Hover a column header.
   - Confirm the left "add act" and "add chapter" buttons and right-side row actions appear.

2. **Insert row above/below**
   - Click the top-right "insert row above" button.
   - Confirm a new row appears at the current index and existing rows shift down.
   - Click the bottom-right "create row below" button.
   - Confirm a new row appears at index + 1 and existing rows shift down.
   - In the network panel, confirm the grid shift endpoint is called for each action.

3. **Add act/chapter**
   - Click "add act" on an empty row.
   - Confirm a section is created with the default name `Act {index + 1}`.
   - Click "add chapter" on a non-empty row.
   - Confirm rows shift down at the index and the new section appears at the current index with the default name.

4. **Clear empty row**
   - Ensure a row is empty and hover its header.
   - Confirm the "clear empty row" button appears.
   - Click it and confirm the empty row is removed and rows above shift down.
   - Confirm the grid shift endpoint is called and returns shifted resources.

5. **Section rendering**
   - Ensure at least one act section and one chapter section exist.
   - Confirm act titles render with 4xl text and chapter titles with 2xl text.
   - Click into the title input and edit the section name inline; confirm the update persists.
   - Verify the 4px line is centered with the input and spans the remaining row width.
