# plotter Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-24

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
- TypeScript (Node.js for Express API, React for web UI) + Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite (012-update-query-structure)
- MongoDB (API persistence) (012-update-query-structure)
- TypeScript (Node.js + React) + Express, MongoDB driver, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons (013-tag-variant-management)
- TypeScript (Node.js + React) + Express, MongoDB, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, dnd-kit, TipTap (014-assets-management)
- MongoDB for story data; filesystem `/uploads` for character images (served publicly) (014-assets-management)
- MongoDB (scene documents) (015-soft-delete-scene)
- TypeScript (Node.js for Express API, React for web UI) + Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite, unplugin-icons (016-storycard-badges)
- TypeScript (Node.js for Express API) + Express, MongoDB, helmet, cors, express-session (017-server-error-logging)
- TypeScript (React in web/, Node.js in express/) + React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite, unplugin-icons (018-character-card)
- MongoDB (existing character assets) (018-character-card)
- TypeScript (React in web/, Node.js in express/) + Express, MongoDB driver, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite, unplugin-icons, dnd-ki (019-enhance-character-management)
- MongoDB (characters collection) (019-enhance-character-management)
- TypeScript (React) + React, TanStack Query, TanStack Router, Flowbite React, Tailwind CSS (020-tag-create-form)
- N/A (frontend only) (020-tag-create-form)
- TypeScript 5.9 (Node.js + React 19) + Express 5, MongoDB 6, React, TanStack Router, TanStack Query, Flowbite React, Zustand (021-import-tags-modal)
- TypeScript (frontend), React 18 (Vite) + TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons (022-list-view)
- MongoDB via Express API (no schema changes) (022-list-view)
- TypeScript (Express + React) + TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, TipTap, dnd-ki (023-scene-snippets)
- TypeScript (React 19 + Express 5) + TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons (024-story-filters)
- MongoDB via Express API (read-only for this feature) (024-story-filters)
- TypeScript (web) + React, Vite, Zustand, TanStack Router, TanStack Query, Flowbite React, Tailwind CSS, unplugin-icons, dnd-ki (025-filter-visibility-modes)
- N/A (frontend rendering of existing story data) (025-filter-visibility-modes)
- TypeScript 5.9.3 (Node.js + React 19.2.4) + Express 5.2.1, MongoDB 6.16, multer 1.4.5, React 19.2, TanStack Router/Query, Zustand, Flowbite React, Tailwind CSS, axios 1.13 (026-import-outline)
- MongoDB; local filesystem for uploaded assets in `uploads/` (no persistence needed for preview yet) (026-import-outline)
- TypeScript (Node.js + React) + Express, MongoDB driver, multer, officeparser, React, TanStack Router/Query, Zustand, Flowbite React, Tailwind CSS (027-docx-ast-conversion)
- MongoDB; in-memory file parsing for docx uploads (027-docx-ast-conversion)
- TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express) + Express 5.2.1, MongoDB 6.16.0, Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12 (028-sections-collection)
- TypeScript (Node.js + React) + Express, MongoDB driver, TanStack Query, TanStack Router, Zustand, Flowbite React, Tailwind CSS, dnd-ki (031-sync-optimistic-shifts)
- TypeScript (Node.js + React 19) + TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, dnd-ki (032-col-header-actions)
- MongoDB (backend), N/A for this frontend-only change (032-col-header-actions)
- MongoDB (backend), N/A for UI-only state (032-col-header-actions)
- TypeScript 5.x (Node.js 20 backend, React 18 frontend) + Express (backend), React + TanStack Query + Zustand + TipTap + Flowbite React (frontend) (034-section-sidebar-edit)
- MongoDB (existing `sections` collection — additive field only) (034-section-sidebar-edit)
- TypeScript 5.x + React 18, react-virtuoso 4.18.4, Tailwind CSS, unplugin-icons (MDI) (035-listview-sidebar-enhancements)
- N/A — pure frontend UI change, no persistence (035-listview-sidebar-enhancements)
- TypeScript 5.x (both express/ and web/) + Express 4, MongoDB (via driver), React 18, TanStack Query v5, TanStack Router, Zustand, dnd-ki (036-plots-scenes-endpoint-split)
- MongoDB — no schema changes; all data already exists (036-plots-scenes-endpoint-split)
- TypeScript (Node.js 20) + Express, MongoDB Node.js driver 6.x, `officeparser` (037-finish-import-db)
- MongoDB (Atlas in production; local replica set in dev — required for transactions) (037-finish-import-db)
- TypeScript (Node.js 20 — express/, React — web/) + Express, MongoDB (express/); TanStack Query, TanStack Router, Flowbite React, Tailwind CSS (web/) (038-soft-delete-story)
- MongoDB — `stories` collection (038-soft-delete-story)
- TypeScript 5 (Node.js backend, React 18 frontend) + Express + Multer (backend); Flowbite React Tabs, TanStack Query, Zustand, Tailwind CSS, unplugin-icons (frontend) (039-import-preview-ui)
- TypeScript (Node.js 20 backend, React 18 frontend) + Express + MongoDB (backend); React + TanStack Query + Flowbite React + Tailwind CSS (frontend) (040-fix-plots-import-submit)
- MongoDB (via existing `createPlot` model function) (040-fix-plots-import-submit)
- TypeScript 5 (Node.js 20 backend, React 18 frontend) + Express, Mongoose/MongoDB (backend); TanStack Query, Zustand, Flowbite React, Tailwind CSS, dnd-kit/core + dnd-kit/sortable, unplugin-icons (frontend) (041-color-palette)
- MongoDB — new `colors` collection (041-color-palette)
- TypeScript 5 (backend: Node.js 20 / Express; frontend: React 18 / Vite) + Express 4, MongoDB Node.js driver 6, TanStack Query v5, Zustand 4, Flowbite React, Tailwind CSS, unplugin-icons (MDI), react-toastify (042-duplicate-story-card)
- MongoDB (replica set required for transactions) (042-duplicate-story-card)
- TypeScript 5 (backend: Node.js 18+, frontend: React 18) (043-export-story-docx)
- MongoDB (read-only during export — no writes) (043-export-story-docx)
- TypeScript 5.x + React 18, TipTap (`@tiptap/react`, `@tiptap/starter-kit`), dnd-ki (044-scene-form-keyboard-ux)
- N/A — no data model changes (044-scene-form-keyboard-ux)
- TypeScript 5.x (frontend + backend) + React 18, dnd-kit (`@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/abstract`), Zustand, TanStack Query, Tailwind CSS, Flowbite React, unplugin-icons (045-drag-section-headings)
- MongoDB (backend only; no schema changes required) (045-drag-section-headings)
- TypeScript 5.x + officeparser (docx AST), docx (export), Express, React, TanStack Query, Flowbite React, Zustand (046-import-outline-versions)
- MongoDB (not directly affected) (046-import-outline-versions)

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
- 046-import-outline-versions: Added TypeScript 5.x + officeparser (docx AST), docx (export), Express, React, TanStack Query, Flowbite React, Zustand
- 045-drag-section-headings: Added TypeScript 5.x (frontend + backend) + React 18, dnd-kit (`@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/abstract`), Zustand, TanStack Query, Tailwind CSS, Flowbite React, unplugin-icons
- 044-scene-form-keyboard-ux: Added TypeScript 5.x + React 18, TipTap (`@tiptap/react`, `@tiptap/starter-kit`), dnd-ki


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
