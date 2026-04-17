# Research: Scene Form Keyboard UX Improvements

**Feature**: 044-scene-form-keyboard-ux  
**Date**: 2026-04-17

---

## Decision 1: How to programmatically focus a TipTap editor from outside the component

**Decision**: Expose a `focus()` method on `RichTextEditor` via `React.forwardRef` + `useImperativeHandle`. The exposed method calls `editor.commands.focus('end')`.

**Rationale**: TipTap's `editor` instance is owned by the `useEditor` hook inside `RichTextEditor`. The cleanest, most idiomatic React pattern for "parent triggers child focus" is an imperative handle on a forwarded ref. This avoids prop-drilling callbacks and keeps the editor internals private. TipTap's `editor.commands.focus()` places the cursor in the editor's contenteditable area, satisfying FR-001, FR-002, FR-006, FR-007, and FR-008.

**Alternatives considered**:
- Calling `document.querySelector('[contenteditable]')` from the parent — rejected: fragile, breaks with multiple editors on screen.
- Adding a boolean `shouldFocus` prop — rejected: awkward state lifecycle, needs reset after each focus.
- Using `editor.view.dom.focus()` directly via DOM ref — viable but bypasses TipTap's own command system; `editor.commands.focus()` is the documented API.

**Implementation note**: `RichTextEditor` will export a `RichTextEditorHandle` type `{ focus: () => void }`. Parent components attach `useRef<RichTextEditorHandle>(null)` and call `.current?.focus()` in a `onKeyDown` Tab handler.

---

## Decision 2: Intercepting Tab on a plain `<input>` without breaking natural Tab order

**Decision**: Add an `onKeyDown` handler to the title `<input>`. When `event.key === 'Tab'` and shift is not held, call `event.preventDefault()` then `editorRef.current?.focus()`. Shift+Tab is left unhandled so the browser's default reverse-tab behaviour is preserved unless the parent explicitly handles it.

**Rationale**: `preventDefault()` is required only on forward Tab; without it the browser would also move focus to the editor via its own tab order (potentially landing on a toolbar button first). By taking control only on forward Tab we avoid regressing Shift+Tab.

**Alternatives considered**:
- CSS `tabindex="-1"` on all toolbar buttons — would achieve the same skip effect but would also remove toolbar buttons from keyboard accessibility entirely, which is unacceptable.
- Setting `tabIndex` order across the form — fragile across dynamic snippet lists.

---

## Decision 3: Enter key submission in `SceneTodoList`

**Decision**: Add `onKeyDown` to the existing `<input>` in `SceneTodoList`. When `event.key === 'Enter'`, call `handleAdd()`. No change to the `onAdd` prop interface.

**Rationale**: The `handleAdd` function already guards against empty input and calls `onAdd` + clears state. Reusing it for the Enter key adds the feature with minimal code. Focus is implicitly retained because the input is not unmounted on submission.

**Alternatives considered**:
- Wrapping the input+button in a `<form>` with `onSubmit` — works but introduces a nested form inside the existing `<SceneForm>` render tree, which is technically invalid HTML (forms cannot nest) and would require restructuring.

---

## Decision 4: Tab from snippet title → snippet text editor (inline expanded snippet)

**Decision**: In `SceneForm`, for each expanded snippet the inline title `<input>` receives an `onKeyDown` Tab handler. The corresponding `RichTextEditor` for that snippet index is identified via a `ref` stored in a `useRef<(RichTextEditorHandle | null)[]>([])` array, indexed by snippet position.

**Rationale**: Snippets are a dynamic list. A single `ref` per index in a ref-array is the standard React pattern for list-of-refs. The array is rebuilt on render but refs are stable across renders for the same index.

**Alternatives considered**:
- `useRef<Map<number, RichTextEditorHandle>>` — functionally equivalent, marginally more complex.
- Lifting the focus logic into a separate hook — unnecessary abstraction for three call sites.
