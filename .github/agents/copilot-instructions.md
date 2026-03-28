# plotter Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-27

## Active Technologies
- Node.js + TypeScript 5.9 + Express 5.2, MongoDB driver 6.16, ts-node, nodemon (002-database-structure)
- TypeScript (ts-node for dev) on Node.js runtime + Express, MongoDB driver, helmet, cors, cookie-parser, dotenv; add `express-session` (and a Mongo-backed session store implementation) (004-auth-router)
- MongoDB (collections: users, sessions, password resets, auth attempts) (004-auth-router)
- TypeScript 5.9, React 19 + TanStack Router 1.x, TanStack Query 5.x, Flowbite React 0.x, Tailwind CSS 4.x, Zustand 5.x, unplugin-icons + `@iconify-json/mdi`, Axios (to be added via `npm install axios`) (005-web-pages-layout)
- N/A — this is a frontend-only feature; auth state is held server-side in MongoDB sessions (managed by the Express API, feature 004) (005-web-pages-layout)
- TypeScript 5.9 (React 19.2) + TanStack Router 1.168, TanStack Query 5.94, Flowbite React 0.12, Tailwind CSS 4.2, Zustand 5.0, axios 1.13, unplugin-icons 23 (006-dashboard-ui)
- MongoDB via Express backend (frontend uses API only) (006-dashboard-ui)
- TypeScript 5.9.3, Node.js (current LTS) + Express 5.2.x, MongoDB driver 6.16.x, React 19.2.x, TanStack Router/Query, Flowbite React, Tailwind CSS, Zustand, axios (006-dashboard-ui)
- TypeScript 5.9, React 19 (web), Node.js + Express 5 (api) + TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Axios, unplugin-icons, Vite (007-story-page-data)
- TypeScript (Node.js backend, React frontend) + Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, axios (008-plot-header-grid)
- TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express) + Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12 (009-plot-row-color)
- MongoDB (existing) (009-plot-row-color)
- TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express) + Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12, Express, MongoDB (010-create-scene-flow)
- TypeScript (Node.js for backend, React 19 for frontend) + Express 5, MongoDB driver; TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, react-selec (011-scene-pov)

- TypeScript 5.9 (Node.js) + Express 5.2, MongoDB Node driver 6.16 (002-database-structure)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9 (Node.js): Follow standard conventions

## Recent Changes
- 011-scene-pov: Added TypeScript (Node.js for backend, React 19 for frontend) + Express 5, MongoDB driver; TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, react-selec
- 010-create-scene-flow: Added TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express) + Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12, Express, MongoDB
- 009-plot-row-color: Added TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express) + Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
