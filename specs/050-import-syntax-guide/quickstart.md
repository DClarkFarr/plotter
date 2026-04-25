# Quickstart: Modern Import Syntax Guide

**Branch**: `050-import-syntax-guide`

---

## Prerequisites

- Frontend running: `cd web && npm run dev`
- Open the app in a browser at `http://localhost:5173`

---

## Test 1 — Modern instructions visible on the form step

1. From the dashboard, click the **Import** button to open the Import Outline modal.
2. Confirm the import type selector defaults to **Modern outline** (or select it).
3. **Expected**: Below the import type selector and above the file input you should see
   the full Modern Import Syntax Guide with sections: Document Structure, Scene POV
   Character, Plots, Tags, and Snippets.
4. Each section should have a left-side description and a right-side dark example block.

---

## Test 2 — Sections are present and accurate

While the modal is open with **Modern outline** selected, verify each section:

### 2a. Document Structure

- Left side describes H1 → act, H2 → chapter, H3 → scene.
- Right-side dark block shows an example with:
  - An H1 heading (e.g. `Act 1 — Into the Storm`)
  - An H2 heading (e.g. `Chapter 1 — Arrival`)
  - A `| PlotName` line
  - An H3 scene heading (e.g. `Nick Fury: Scene opens at the facility`)

### 2b. Scene POV Character

- Left side explains the `Character Name: Scene Title` syntax.
- Right-side example shows `Nick Fury: Investigates the Tesseract activity`.
- Also shows the no-POV form: just a bare scene title.

### 2c. Plots

- Left side explains that plots define rows in the story grid, and that each scene
  belongs to exactly one plot.
- Left side explains both forms: H4 heading and `| PlotName` paragraph prefix.
- Right-side example block shows both forms clearly.
- A brief color note mentions that the text color of the `|` character is preserved.

### 2d. Tags

- Left side explains Basic Tags (`[TagName]`) and Variant Tags (`[TagName:Variant]`).
- Left side explains that the tag row is the **first paragraph after the scene heading**.
- Right-side examples show:
  - Single tag: `[Action]`
  - Variant tag: `[Action:Victory]`
  - Multi-tag row: `[Suspense] [Plot Twist]`
- A brief color note mentions that tag token color is preserved on import.

### 2e. Snippets

- Left side explains that indented paragraphs (≥ ~1 cm) become snippet content.
- Left side explains the optional snippet heading: H5 or a paragraph ending with `:`.
- Right-side example shows a scene heading, a snippet heading line, and indented snippet body.

---

## Test 3 — Legacy instructions are unaffected

1. Switch the import type selector to **Legacy outline**.
2. **Expected**: The legacy `LegacyImportInstructions` component renders unchanged — it
   still shows the H2/H3/H4 layout, POV, tags, plots, and snippets sections for the
   legacy format.
3. Switch back to **Modern outline** and confirm the modern guide reappears correctly.

---

## Test 4 — Build validation

```bash
cd web && npm run build
```

Confirm the build completes with no TypeScript or lint errors.
