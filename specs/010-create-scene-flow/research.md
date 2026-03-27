# Research: Create Scene Editor Flow

## Decisions

1. **Rich text editor library**
   - **Decision**: Use TipTap for scene description editing.
   - **Rationale**: TipTap provides a composable React-friendly API, supports common formatting, and can be styled with Tailwind to match in-place editor styling.
   - **Alternatives considered**: Slate (higher implementation overhead), Quill (less flexible for custom styling).
   - **Notes**: Requires constitution amendment before implementation.

2. **Drag-and-drop library**
   - **Decision**: Use dnd-kit for sortable todo list items.
   - **Rationale**: Lightweight, accessible drag-and-drop with good React support and fine-grained control.
   - **Alternatives considered**: react-beautiful-dnd (deprecated), native HTML DnD (limited touch and accessibility support).
   - **Notes**: Requires constitution amendment before implementation.

3. **Scene default title generation**
   - **Decision**: Use "Scene {row number} in {plot name}" with row number derived as `verticalIndex + 1` and fallback plot name "Untitled Plot".
   - **Rationale**: Matches user-facing expectations for 1-based numbering and handles missing plot titles.
   - **Alternatives considered**: Zero-based numbering (rejected as user-unfriendly).
