# Implementation Plan: Auth Router

**Branch**: `004-auth-router` | **Date**: March 21, 2026 | **Spec**: [specs/004-auth-router/spec.md](specs/004-auth-router/spec.md)
**Input**: Feature specification from `/specs/004-auth-router/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver an `/auth` router that supports signup, login, password reset, and current-user endpoints using cookie-based sessions stored in MongoDB. Implement `express-session` with a Mongo-backed session store aligned to the existing `sessions` collection, enforce security controls (password policy, throttling, CSRF via same-site cookies), and integrate with user/session models and services without breaking Clean Architecture boundaries.

## Technical Context

**Language/Version**: TypeScript (ts-node for dev) on Node.js runtime  
**Primary Dependencies**: Express, MongoDB driver, helmet, cors, cookie-parser, dotenv; add `express-session` (and a Mongo-backed session store implementation)  
**Storage**: MongoDB (collections: users, sessions, password resets, auth attempts)  
**Testing**: No automated tests required (per constitution)  
**Target Platform**: Node.js server (local + production)  
**Project Type**: Web service (REST JSON API)  
**Performance Goals**: Keep typical auth requests under 200ms  
**Constraints**: Security-first input validation; cookie sessions; 7-day inactivity expiry; same-site CSRF mitigation  
**Scale/Scope**: Single backend service with modest user base; no multi-region scaling assumed

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-router/
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
│   │   ├── sessions.ts
│   │   ├── users.ts
│   │   └── passwordResets.ts (new)
│   ├── routers/
│   │   ├── apiRouter.ts
│   │   └── authRouter.ts (new)
│   ├── services/
│   │   ├── sessionService.ts
│   │   └── authService.ts (new)
│   └── utils/
│       ├── app.ts
│       └── env.ts
└── scripts/

web/
├── src/
└── public/
```

**Structure Decision**: Use the existing web application structure with Express in `express/` and React in `web/`. Auth code will live under Express routers/services/models.

## Complexity Tracking

No constitution violations anticipated.
