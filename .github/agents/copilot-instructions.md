# plotter Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-21

## Active Technologies
- Node.js + TypeScript 5.9 + Express 5.2, MongoDB driver 6.16, ts-node, nodemon (002-database-structure)
- TypeScript (ts-node for dev) on Node.js runtime + Express, MongoDB driver, helmet, cors, cookie-parser, dotenv; add `express-session` (and a Mongo-backed session store implementation) (004-auth-router)
- MongoDB (collections: users, sessions, password resets, auth attempts) (004-auth-router)

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
- 004-auth-router: Added TypeScript (ts-node for dev) on Node.js runtime + Express, MongoDB driver, helmet, cors, cookie-parser, dotenv; add `express-session` (and a Mongo-backed session store implementation)
- 002-database-structure: Added Node.js + TypeScript 5.9 + Express 5.2, MongoDB driver 6.16, ts-node, nodemon

- 002-database-structure: Added TypeScript 5.9 (Node.js) + Express 5.2, MongoDB Node driver 6.16

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
