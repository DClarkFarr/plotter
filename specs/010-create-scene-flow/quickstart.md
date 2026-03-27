# Quickstart: Create Scene Editor Flow

## Prerequisites

- Backend API running locally
- Frontend dev server running locally
- A story with at least one plot row

## Run locally

```bash
cd express
npm install
npm run dev
```

```bash
cd web
npm install
npm run dev
```

## Feature entry point

- Story page: `http://localhost:5173/dashboard/story/:storyId`

## Test flow

1. Open a story page with at least one plot row and an empty scene slot.
2. Click the "Create scene" control in the empty slot.
3. Confirm a new scene appears with the title "Scene {row number} in {plot name}".
4. Verify the sidebar opens and the new scene is selected for editing.
5. Edit the title inline and confirm the input styling matches the heading.
6. Enter formatted description text and confirm it renders correctly.
7. Click a tag badge, toggle tag checkboxes, and confirm the inline badge list updates.
8. Add or reorder todo items and confirm checkbox and order updates persist.
