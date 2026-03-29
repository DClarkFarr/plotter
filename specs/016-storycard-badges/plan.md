# Implementation Plan: Story Card Count Badges

**Branch**: `016-storycard-badges` | **Date**: March 29, 2026 | **Spec**: [specs/016-storycard-badges/spec.md](specs/016-storycard-badges/spec.md)
**Input**: Feature specification from [specs/016-storycard-badges/spec.md](specs/016-storycard-badges/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend story stats to include character and tag counts in the story list and story detail API responses, then render those counts as additional badges on dashboard story cards.

## Technical Context

**Language/Version**: TypeScript (Node.js for Express API, React for web UI)  
**Primary Dependencies**: Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite, unplugin-icons  
**Storage**: MongoDB (API persistence)  
**Testing**: N/A (no automated test requirement unless explicitly requested)  
**Target Platform**: Web app + Node.js API on macOS/Linux development environments
**Project Type**: Web application + REST API  
**Performance Goals**: API responses under 200ms for normal load  
**Constraints**: Maintain stack guardrails, keep routes thin, queries in models only  
**Scale/Scope**: Dashboard story list and story detail endpoints only

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
specs/016-storycard-badges/
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
│   ├── services/
│   ├── routers/
│   └── utils/

web/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── queries/
│   ├── routes/
│   └── store/

specs/
└── 016-storycard-badges/
```

**Structure Decision**: Use the existing Express + React monorepo layout. Backend changes remain in express/src models/services/routers; frontend updates live in web/src api/types/hooks/components for StoryCard rendering.

## Complexity Tracking

No constitution violations identified.
