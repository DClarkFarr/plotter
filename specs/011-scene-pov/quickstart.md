# Quickstart: Scene POV Selection

## Prerequisites

- Backend API running locally
- Frontend dev server running locally
- A story with at least one plot and one scene

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

1. Open a story page and select a scene so the sidebar opens.
2. Confirm the POV selector appears directly under the scene title.
3. Open the selector and verify the character list loads for the story.
4. Verify each option renders a character name and avatar (generated color when no image).
5. Select a character and confirm the POV is saved and remains after reopening the scene.
6. Clear the selection using the clear control and confirm the POV is removed.
7. Click "Add new character", enter a name only, then save.
8. Confirm the new character is created, the form closes, and the new POV is selected.
9. Return to the story grid and confirm the scene card shows the POV avatar and name on the top-right.
