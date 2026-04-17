# Quickstart: Scene Form Keyboard UX Improvements

**Feature**: 044-scene-form-keyboard-ux  
**Date**: 2026-04-17

---

## What this feature does

Adds three keyboard convenience affordances to the SceneForm sidebar component so that authors can edit scenes without reaching for the mouse:

1. **Tab title → description**: Tab from the scene title input focuses the description rich-text editor body directly.
2. **Enter submits todo**: Pressing Enter in the "Add todo item" input submits the item (same as clicking the Add button).
3. **Tab snippet title → snippet text**: Tab from a snippet title input focuses that snippet's rich-text editor body directly — works in both the "Add snippet" modal and inline on an expanded existing snippet.

---

## Files changed

| File | Change |
|------|--------|
| `web/src/components/forms/RichTextEditor.tsx` | Wrap with `forwardRef`; add `useImperativeHandle` exposing `{ focus() }` |
| `web/src/components/story/SceneTodoList.tsx` | Add `onKeyDown` Enter handler to the add-item input |
| `web/src/components/story/SceneForm.tsx` | Add `ref` wiring for description editor and snippets editors; add Tab `onKeyDown` handlers on title and snippet title inputs |

---

## How to test manually

### Story 1 — Title → Description

1. Open a story and select any scene to open the sidebar.
2. Click the **title input** to focus it.
3. Press **Tab**.
4. ✅ Cursor should be inside the **description editor body** (blinking caret in the text area, not on a toolbar button).
5. Start typing — text should appear in the description immediately.

### Story 2 — Enter submits todo

1. Scroll down to the **Todo List** section in the scene sidebar.
2. Click the "Add todo item" input and type any text, e.g. `Write the opening line`.
3. Press **Enter** (do not click Add).
4. ✅ The item appears in the todo list above and the input is cleared.
5. Type another item and press Enter again — it should work consecutively.
6. Clear the input and press Enter with no text — ✅ nothing should be added.

### Story 3 — Snippet title → Snippet text (modal)

1. Click **Add snippet** to open the modal.
2. Type a title in the **Title** field.
3. Press **Tab**.
4. ✅ Cursor should be inside the **Snippet text editor body** (not on a toolbar button or the Cancel/Add buttons).

### Story 3b — Snippet title → Snippet text (inline expanded)

1. Expand an existing snippet by clicking its header.
2. Click the inline **snippet title input** to focus it.
3. Press **Tab**.
4. ✅ Cursor should be inside that snippet's **text editor body**.

---

## Regression check

After implementing, verify the existing Tab order for POV selector, Tags, and all other fields is unaffected.
