# Implementation Plan: Character Card

**Branch**: `018-character-card` | **Date**: 2026-04-03 | **Spec**: [specs/018-character-card/spec.md](specs/018-character-card/spec.md)
**Input**: Feature specification from [specs/018-character-card/spec.md](specs/018-character-card/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a reusable character card with a large image, stylized name, description, hover edit action, and click-to-lightbox image viewing, surfaced through a shared popover for both SceneCard character selection and ManageCharactersPanel avatars.

## Technical Context

**Language/Version**: TypeScript (React in web/, Node.js in express/)  
**Primary Dependencies**: React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite, unplugin-icons  
**Storage**: MongoDB (existing character assets)  
**Testing**: N/A (no automated test requirement unless explicitly requested)  
**Target Platform**: Web app (modern desktop and mobile browsers)  
**Project Type**: Web application + REST API  
**Performance Goals**: Maintain 60 fps UI interactions; API responses under 200ms for normal load  
**Constraints**: Use Flowbite React for modal controls, Tailwind-only styling, no new animation libraries  
**Scale/Scope**: UI-only changes in web/ with reuse of existing character upload flows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router for routing, TanStack Query for
  server state, Zustand for client state, Flowbite React for UI components, Tailwind CSS
  for styles, unplugin-icons for icons. No alternative libraries introduced.
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.

## Project Structure

### Documentation (this feature)

```text
specs/018-character-card/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
express/
├── src/
│   ├── models/
│   ├── routers/
│   ├── services/
│   └── utils/

web/
├── src/
│   ├── components/
│   │   ├── character/
│   │   ├── plot/
│   │   └── story/
│   ├── hooks/
│   ├── queries/
│   ├── store/
│   └── utils/

specs/
└── 018-character-card/
```

**Structure Decision**: Use the existing Express + React monorepo layout. Character card and popover UI live in web/src/components with supporting hooks and queries reused from current character data flows.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- Stack guardrails honored; no new libraries needed for modal or lightbox behavior.
- UI work remains within React + Tailwind + Flowbite React constraints.
- Character image updates reuse existing data flows without new backend changes.
