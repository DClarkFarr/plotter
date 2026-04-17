# Data Model: Scene Form Keyboard UX Improvements

**Feature**: 044-scene-form-keyboard-ux  
**Date**: 2026-04-17

---

This feature introduces no new data entities and makes no changes to the MongoDB schema, API payloads, or TanStack Query types.

## Component Interface Changes

### `RichTextEditorHandle` (new exported type)

A new imperative handle type exposed by `RichTextEditor` via `forwardRef`.

| Property | Type | Description |
|----------|------|-------------|
| `focus`  | `() => void` | Focuses the TipTap editor's contenteditable area at the end of the current content |

**Usage**: Parent components attach `useRef<RichTextEditorHandle>(null)` to a `<RichTextEditor ref={...} />` and call `.current?.focus()` to imperatively move focus.

### `RichTextEditor` props (unchanged)

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string` | unchanged |
| `onChange` | `(value: string) => void` | unchanged |
| `isSimpleMode` | `boolean?` | unchanged |

The component now also accepts a forwarded `ref` of type `RichTextEditorHandle`.

---

No other interfaces change. `SceneTodoList`, `SceneForm`, and the snippet modals are implementation-only changes (event handlers and refs), not interface changes visible to API or server layers.
