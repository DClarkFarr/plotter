# Quickstart: List View

## Prerequisites

- Install dependencies in `web/`.
- Install dependencies in `express/` if the API is not already running.

## Run

1. Start the API server from `express/` with `npm run dev`.
2. Start the web app from `web/` with `npm run dev`.
3. Open a story in the dashboard.
4. In the View controls, select "List view".

## Expected Result

- The plot grid is replaced by a sequential list of scenes.
- Scenes with the same vertical index appear in the left-to-right plot order.
- Each scene shows avatar (when available), title, badges, description, and todo list.
