# Quickstart: Plots & Scenes Endpoint Split

**Feature**: 036-plots-scenes-endpoint-split  
**Date**: 2026-04-11

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally (default port 27017, or set via `MONGO_URI` env var)
- At least one story with plots and scenes seeded in the database

## Run the development stack

```bash
# Terminal 1 — backend
cd express
npm run dev

# Terminal 2 — frontend
cd web
npm run dev
```

## Verify the backend changes manually

### 1. Plots endpoint returns metadata only

```bash
# Replace <storyId> and <sessionCookie> with real values from your browser
curl -s -b "<sessionCookie>" \
  http://localhost:3000/api/stories/<storyId>/plots | jq '.plots[0] | keys'
# Expected: ["color","description","horizontalIndex","id","storyId","title"]
# NOT expected: "scenes" key
```

### 2. New scenes endpoint returns a flat array

```bash
curl -s -b "<sessionCookie>" \
  http://localhost:3000/api/stories/<storyId>/scenes | jq '.scenes | length'
# Expected: total number of scenes across all plots in the story
```

### 3. Scene objects carry `plotId`

```bash
curl -s -b "<sessionCookie>" \
  http://localhost:3000/api/stories/<storyId>/scenes | jq '.scenes[0].plotId'
# Expected: a valid plot ID string
```

### 4. PATCH plot returns metadata only

```bash
curl -s -b "<sessionCookie>" -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"title":"Renamed"}' \
  http://localhost:3000/api/stories/<storyId>/plots/<plotId> | jq '.plot | keys'
# Expected: ["color","description","horizontalIndex","id","storyId","title"]
# NOT expected: "scenes" key
```

## Verify the frontend in the browser

1. Open a story with multiple plots and scenes.
2. Observe in the Network tab that two requests are made when the story loads:
   - `GET /api/stories/<storyId>/plots` — should be fast and small
   - `GET /api/stories/<storyId>/scenes` — loads all scene data separately
3. Edit a scene title. In the Network tab, confirm that only the scenes cache updates — no `/plots` request is fired.
4. The grid should remain visually identical to before the refactor.
5. Filters (tag, character, search, plot) should continue to work correctly.
6. Drag-and-drop scene reordering should continue to work.
7. Create, update, and delete scenes — grid should update optimistically and settle correctly.

## TypeScript compilation check

```bash
# Backend
cd express && npx tsc --noEmit

# Frontend
cd web && npx tsc --noEmit
```

Both should produce zero errors after the refactor.
