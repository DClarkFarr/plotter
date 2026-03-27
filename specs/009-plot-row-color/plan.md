# Implementation Plan: Plot Row Color Sync

**Branch**: `009-plot-row-color` | **Date**: March 26, 2026 | **Spec**: [specs/009-plot-row-color/spec.md](specs/009-plot-row-color/spec.md)
**Input**: Feature specification from [specs/009-plot-row-color/spec.md](specs/009-plot-row-color/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Apply plot-driven row theming in the SceneRenderer grid by deriving a softened background color and accessible text color from each plot's color. Implement a `usePlotTheme()` hook to compute theme colors, add CSS variables on each row element, and use Tailwind classes with a short transition so color updates animate smoothly across scenes and empty cells.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express)  
**Primary Dependencies**: Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12  
**Storage**: MongoDB (existing)  
**Testing**: None required currently (no automated tests mandated)  
**Target Platform**: Modern browsers (web UI), Node.js server  
**Project Type**: Web application + API  
**Performance Goals**: Row color transitions complete within 0.5 seconds while maintaining smooth UI updates  
**Constraints**: Tailwind-only styling; no new third-party animation or color libraries; follow SceneRenderer component structure  
**Scale/Scope**: Single feature touching a small set of UI components in web/src

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
specs/009-plot-row-color/
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
│   └── routers/

web/
├── src/
│   ├── components/
│   │   └── plot/
│   │       └── SceneRenderer/
│   ├── hooks/
│   └── styles/
```

**Structure Decision**: Web application layout (frontend + backend) with changes limited to web/src hooks and SceneRenderer components.

## Phase 0: Research

### Decisions

1. **Color softening algorithm**
   - **Decision**: Compute softened color by blending the plot color over white for light colors and over black for dark colors, using a fixed alpha of 0.45.
   - **Rationale**: Matches the requested 40-50% opacity effect and keeps a predictable, lightweight implementation without new dependencies.
   - **Alternatives considered**: Dynamic alpha based on luminance (rejected for unpredictability and added complexity).

2. **Light vs dark color threshold**
   - **Decision**: Use relative luminance (sRGB) to classify colors as light when luminance $> 0.6$, otherwise dark.
   - **Rationale**: Simple, deterministic split aligned with common UI theming heuristics.
   - **Alternatives considered**: HSL lightness thresholds (rejected due to less accurate perceived brightness).

3. **Text color selection**
   - **Decision**: Choose text color by comparing contrast against the softened background; use dark text by default and flip to light text when contrast with dark falls below 4.5:1.
   - **Rationale**: Provides readable text while honoring the default dark preference.
   - **Alternatives considered**: Fixed threshold without contrast calculation (rejected for accessibility risk).

## Phase 1: Design & Contracts

### UI Theming Design

- **New hook**: `usePlotTheme(plotColor?: string)` in web/src/hooks returns `{ baseColor, softColor, textColor }`.
- **Color inputs**: Accept hex input (`#RRGGBB` or `#RGB`), with a neutral fallback when invalid or missing.
- **Softened color**:
  - Compute luminance from the base color.
  - If luminance $> 0.6$, blend base color over white with alpha 0.45.
  - Else, blend base color over black with alpha 0.45.
- **Text color**: Choose `#0f172a` by default; if contrast ratio against softened background falls below 4.5:1, use `#f8fafc`.

### Component Integration

- Apply the hook to every component in web/src/components/plot/SceneRenderer that receives `plot: Plot` in props:
  - PlotHeader
  - PlotHeaderCreate (only when `plot` is defined)
  - SceneCard
  - EmptyCard
- Add CSS variables on the outermost element, for example:
  - `--plot-color: <baseColor>`
  - `--plot-color-soft: <softColor>`
  - `--plot-text: <textColor>`
- Use Tailwind classes that reference these variables (`bg-[var(--plot-color-soft)]`, `text-[var(--plot-text)]`, `border-[var(--plot-color)]`) and include `transition-colors duration-300` on the outermost element.

### Contracts

No external API or file format contracts are introduced. Document in contracts/README.md.

### Agent Context Update

- Run `.specify/scripts/bash/update-agent-context.sh copilot` after data-model and quickstart are generated.

## Phase 2: Planning

### Task Breakdown (for tasks.md)

1. Add `usePlotTheme` hook with color parsing, luminance/contrast, and softening logic.
2. Update SceneRenderer components to apply the hook and CSS variables on the outermost element.
3. Add Tailwind classes for background, text, and border using CSS variables with smooth transitions.
4. Validate row color transitions when plot color changes and ensure fallback handling for invalid colors.

## Complexity Tracking

No constitution violations. Complexity remains low and localized to UI theming.
