# Quickstart: Scene Snippets

## Prerequisites

- Install dependencies in `web/`.
- Install dependencies in `express/` if the API is not already running.

## Run

1. Start the API server from `express/` with `npm run dev`.
2. Start the web app from `web/` with `npm run dev`.
3. Open a story in the dashboard.
4. Select a scene to open the Tasks sidebar.
5. Add a snippet via the add snippet modal, then expand it and edit the title and content.
6. Switch to list view to confirm snippets render below the todo list with extra horizontal margins.

## Expected Result

- Snippets appear below the todo list in the Tasks sidebar.
- Each snippet is collapsed by default, expands on label click, and persists edits.
- The add snippet modal explains the purpose of snippets and creates a new item on submit.
- List view renders snippets with a typewriter-like visual style and extra horizontal margins.
