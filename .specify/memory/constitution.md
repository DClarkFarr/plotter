<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: I. Stack Guardrails — expanded frontend library mandates;
    TanStack Query and Zustand added with designated purposes; future library
    placeholders noted for animation, drag-and-drop, and rich text editor.
- Added sections: None
- Removed sections: None
- Templates requiring updates:
    .specify/templates/plan-template.md ✅ (Constitution Check updated)
    .specify/templates/spec-template.md ✅ (no changes required)
    .specify/templates/tasks-template.md ✅ (no changes required)
- Follow-up TODOs:
    TODO(RATIFICATION_DATE): original adoption date not provided
    TODO(ANIMATION_LIBRARY): motion or equivalent not yet decided — amend Principle I when selected
    TODO(DND_LIBRARY): drag-and-drop library not yet decided — amend Principle I when selected
    TODO(RTE_LIBRARY): rich text editor library not yet decided — amend Principle I when selected
-->

# Plotter Constitution

## Core Principles

### I. Stack Guardrails (NON-NEGOTIABLE)

The backend MUST remain a Node.js + TypeScript Express server in the express/ directory
with MongoDB as the only database. The frontend MUST remain a React app in the web/
directory and MUST use the following libraries for their designated purposes:

- **Routing**: TanStack Router (`@tanstack/react-router`) MUST be used for all
  client-side routing. Do not introduce alternative routing solutions.
  For routing optimizations and to improve HMR, define the page components in web/src/pages/_ and then import them
  into web/src/routes/_.
- **Server State**: TanStack Query (`@tanstack/react-query`) MUST be used for all
  data fetching, caching, and server mutations. Remote data MUST NOT be managed in
  Zustand or local component state.
- **Client State**: Zustand MUST be used for all non-server, non-URL application state
  (e.g., UI state, ephemeral session data). Do not introduce Redux or other state
  management libraries.
- **UI Components**: Flowbite React MUST be used for UI components where a suitable
  component exists. Custom components MUST be composed from Tailwind CSS utilities.
- **Styles**: Tailwind CSS MUST be the sole styling mechanism. Do not introduce CSS
  modules, styled-components, or global CSS classes beyond Tailwind's base layer.
- **Icons**: unplugin-icons with Material Design icon packs MUST be used for all icons.

Future libraries for animation, drag-and-drop, and rich text editing are not yet
decided. Until a constitution amendment names them, no ad-hoc third-party libraries
for these purposes MUST be added.

### II. Clean Architecture Boundaries

All features MUST adhere to Clean Architecture separation across Domain, Application,
and Infrastructure layers. Business rules live in services; API routing is orchestration
only. Any cross-layer dependency MUST be explicit and justified.

### III. Routing, Services, and Data Access Discipline

Routes MUST be defined via Express routers. Services MUST compose actions and hold
workflow logic. All MongoDB queries MUST live in models/ and be exported as consistent,
clean functions. No MongoDB queries outside models/.

### IV. Security-First Input and Error Handling

Every user input MUST be validated and sanitized. Error handling MUST use an elegant
try/catch flow with a global middleware fallback. Development mode MUST surface root
causes; production MUST obfuscate sensitive database or system errors.

### V. Performance and Environment Awareness

API response times MUST remain under 200ms for normal load. Frontend routing and XHR
clients MUST support distinct base URLs for localhost + Vite, localhost + server build,
and production domain deployments.

## Architecture & Code Structure

- APIs MUST be RESTful and use JSON for requests and responses.
- Service Locator is prohibited; use constructor-based dependency injection.
- Database manipulation must be grouped in models/ with no direct queries elsewhere.
- Services must compose utils and data methods for workflows; routers remain thin.

## Quality, Documentation & Workflow

- No automated testing is required for now unless explicitly requested.
- All generated commit messages MUST follow Conventional Commits format.
- Before writing code, ask clarifying questions for any spec ambiguity.
- spec.md must remain technology-agnostic; technical details belong in plan.md.

## Governance

- This constitution supersedes other guidance; deviations require explicit approval and
  documented justification in the plan.
- All plans and tasks must include a Constitution Check against the Core Principles.
- Amendments require documentation, consensus of maintainers, and a semantic version bump.
- Compliance is reviewed during PRs and release readiness checks.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not provided | **Last Amended**: 2026-03-21
