# Research: User Dashboard

## Decision 1: UI component foundation

**Decision**: Use Flowbite React components for topbar, dropdown, modal, buttons, and cards; compose layout and spacing with Tailwind utilities.
**Rationale**: Aligns with stack guardrails and accelerates delivery while retaining a clean, modern design system.
**Alternatives considered**: Custom-only Tailwind components for all UI; rejected to avoid re-implementing common patterns.

## Decision 2: Server data management

**Decision**: Use TanStack Query for story list and create-story mutation state, keeping server data exclusively in `useQuery()` and `useMutation()`.
**Rationale**: Meets constitution requirements and ensures consistent cache, loading, and error behavior.
**Alternatives considered**: Local component state for stories; rejected due to guardrails.

## Decision 3: API client strategy

**Decision**: All story-related endpoint methods will call the shared axios `apiClient` instance.
**Rationale**: Ensures consistent base URL, credentials, and error normalization across API modules.
**Alternatives considered**: Direct `axios` calls per module; rejected to prevent duplicated config.
