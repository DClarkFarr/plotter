# Feature Specification: Web Pages — Initial Layout & Auth Forms

**Feature Branch**: `005-web-pages-layout`  
**Created**: 2026-03-21  
**Status**: Draft  
**Input**: User description: "Build out first set of pages with basic templating and layouts including home page with welcome banner, navigation topbar, dashboard placeholder, login, sign-up, and reset password pages with form components and hooks"

> Keep this spec technology-agnostic. Library and stack details belong in plan.md.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Visitor Sees a Welcoming Landing Page (Priority: P1)

A first-time visitor arrives at the root URL and immediately understands what Plotter is. They see a centered banner with "Welcome to Plotter" and a prominent "Get Started" call to action that takes them to the login page. The navigation bar shows logo branding with links to log in and sign up.

**Why this priority**: This is the entry point for every new user. Without a functional landing page and navigation, no other user journey is reachable in a meaningful way.

**Independent Test**: Navigate to `/` and verify the banner text, CTA button, and top navigation render correctly for an unauthenticated visitor.

**Acceptance Scenarios**:

1. **Given** a visitor is not logged in, **When** they visit `/`, **Then** they see a centered "Welcome to Plotter" banner and a "Get Started" button
2. **Given** a visitor clicks "Get Started", **When** they are redirected, **Then** they land on `/login`
3. **Given** a visitor is not logged in, **When** they view the navigation bar, **Then** they see the Plotter logo on the left and "Log In" and "Sign Up" buttons on the right
4. **Given** a visitor is logged in, **When** they view the navigation bar, **Then** they see "Dashboard" and "Log Out" options instead of login/sign-up

---

### User Story 2 — New User Signs Up (Priority: P2)

A new user visits `/sign-up`, fills in their name, email, and a valid password, and submits the form. The form validates their input inline before submission and guides them toward the application on success.

**Why this priority**: Account creation is the prerequisite for all authenticated functionality. Without it, no user can access Plotter's core features.

**Independent Test**: Navigate to `/sign-up`, fill in valid credentials, submit, and confirm the success callback fires and form errors appear for invalid input.

**Acceptance Scenarios**:

1. **Given** a new user is on `/sign-up`, **When** they enter a valid name, email, and password and submit, **Then** the `onSignUpSuccess` callback is invoked
2. **Given** a user submits without an email, **When** the form validates, **Then** an inline "Email is required" error appears beneath the email field
3. **Given** a user enters a malformed email (e.g., "foo@"), **When** they blur the field, **Then** an inline "Enter a valid email address" error appears
4. **Given** a user enters a password shorter than 5 characters, **When** they blur the field, **Then** an error indicates the minimum length requirement
5. **Given** a user enters a password with no uppercase letter, **When** they blur the field, **Then** an error indicates the uppercase character requirement
6. **Given** a user enters a password with no special character, **When** they blur the field, **Then** an error indicates the special character requirement
7. **Given** a user enters a valid password, **When** they view the field feedback, **Then** no password errors are shown

---

### User Story 3 — Existing User Logs In (Priority: P3)

An existing user visits `/login`, enters their email and password, and is taken into the application. The form validates credentials inline and surfaces errors when the email or password is missing or malformed.

**Why this priority**: Login is required before any authenticated page can be used, but it depends on sign-up existing first.

**Independent Test**: Navigate to `/login`, enter credentials, submit, and confirm the `onLoginSuccess` callback fires. Confirm field errors appear for empty or malformed inputs.

**Acceptance Scenarios**:

1. **Given** an existing user enters a valid email and password and submits, **When** the form submits, **Then** the `onLoginSuccess` callback is invoked
2. **Given** a user leaves the email empty and submits, **When** the form validates, **Then** an inline "Email is required" error appears
3. **Given** a user leaves the password empty and submits, **When** the form validates, **Then** an inline "Password is required" error appears
4. **Given** a user enters a malformed email, **When** they blur the field, **Then** an inline format error appears

---

### User Story 4 — User Requests a Password Reset (Priority: P4)

A user who has forgotten their password visits `/reset-password`, enters their email address, and submits the form. The form validates the email and invokes the `onResetSuccess` callback to trigger the downstream reset flow.

**Why this priority**: Password recovery is important for retention but not blocking for core functionality delivery.

**Independent Test**: Navigate to `/reset-password`, enter an email, submit, and confirm the success callback fires. Confirm validation errors appear for empty or malformed email.

**Acceptance Scenarios**:

1. **Given** a user enters a valid email on `/reset-password` and submits, **When** the form submits, **Then** the `onResetSuccess` callback is invoked
2. **Given** a user submits with an empty email, **When** the form validates, **Then** an inline "Email is required" error appears
3. **Given** a user enters a malformed email, **When** they blur the field, **Then** an inline format error appears

---

### User Story 5 — Authenticated User Sees Dashboard Placeholder (Priority: P5)

A logged-in user navigates to `/dashboard` and sees a "Welcome to Dashboard" placeholder. The full dashboard layout will be built in a future feature; this story establishes the route and placeholder content.

**Why this priority**: The dashboard route must exist so navigation links and post-login redirects work correctly, but its full layout is deferred.

**Independent Test**: Navigate to `/dashboard` and confirm the placeholder message renders without error.

**Acceptance Scenarios**:

1. **Given** a user navigates to `/dashboard`, **When** the page loads, **Then** they see a "Welcome to Dashboard" placeholder message

---

### Edge Cases

- What happens when a logged-in user visits `/login` or `/sign-up`? (Assumption: no redirect protection in this phase — that is deferred to a route-guard feature)
- What happens if the "Log Out" nav action is triggered but the session has already expired? (Assumption: handled by the auth service layer; the nav component calls the provided `onLogout` callback and the parent decides what to do)
- What if a user navigates directly to `/dashboard` while unauthenticated? (Assumption: no auth guard in this phase; deferred)
- What if JavaScript is disabled? (Assumption: not in scope — this is a React SPA)

## Requirements _(mandatory)_

### Functional Requirements

#### Navigation

- **FR-001**: The public navigation bar (Topbar) MUST display the "plotter" text wordmark (lowercase, styled as a brand link) on the left side and MUST be rendered directly inside the home page component; it MUST NOT appear on auth pages (`/login`, `/sign-up`, `/reset-password`) or dashboard pages
- **FR-002**: When a user is unauthenticated, the navigation MUST show "Log In" and "Sign Up" action links on the right
- **FR-003**: When a user is authenticated, the navigation MUST show "Dashboard" and "Log Out" action links on the right, replacing the unauthenticated options
- **FR-004**: The navigation MUST receive authentication state via props so it remains presentationally pure and independently testable

#### Auth Pages Layout

- **FR-023**: Auth pages (`/login`, `/sign-up`, `/reset-password`) MUST render within a minimal centered layout with no Topbar or navigation shell; the form content MUST be presented inside a card/panel (elevated container with background) centered on a neutral page background

#### Home Page (`/`)

- **FR-005**: The home page MUST display a centered hero banner with the text "Welcome to Plotter"
- **FR-006**: The home page MUST display a "Get Started" button that navigates the user to `/login`

#### Dashboard Page (`/dashboard`)

- **FR-007**: The `/dashboard` route MUST render a placeholder page with "Welcome to Dashboard" text
- **FR-008**: A dedicated layout shell for the `/dashboard/*` route subtree MUST be scaffolded in this feature as a structural pass-through (rendering only its child content via the router outlet). Dashboard-specific visual elements — sidebar, dashboard-specific topbar — are explicitly out of scope; only the structural layout nesting is required

#### Auth Pages — General

- **FR-009**: Each auth page (`/login`, `/sign-up`, `/reset-password`) MUST use a reusable form component sourced from the shared components directory
- **FR-010**: Each form component MUST be prop-driven; all data, state, and callbacks MUST be provided via props
- **FR-011**: A matching custom hook MUST exist for each form (`useLoginForm`, `useSignUpForm`, `useResetPasswordForm`) that encapsulates field state and validation logic and accepts a configuration object (e.g., `{ onLoginSuccess }`)
- **FR-012**: Form pages MUST compose their hook and pass the resulting props to the form component; pages MUST NOT contain inline form logic

#### Field Validation

- **FR-013**: Email fields MUST validate that a value is present and matches a valid email format; errors MUST be shown inline beneath the field
- **FR-014**: Password fields on sign-up MUST enforce: minimum 5 characters, at least 1 uppercase letter, at least 1 special character; each unmet rule MUST surface as a distinct inline error
- **FR-015**: Validation MUST trigger on field blur and on form submit; fields MUST NOT show errors before the user has interacted with them
- **FR-016**: A form MUST NOT be submittable while any field has a validation error

#### Callbacks

- **FR-017**: `useLoginForm` MUST accept `{ onLoginSuccess: () => void }` and call it upon successful form submission
- **FR-018**: `useSignUpForm` MUST accept `{ onSignUpSuccess: () => void }` and call it upon successful form submission
- **FR-019**: `useResetPasswordForm` MUST accept `{ onResetSuccess: () => void }` and call it upon successful form submission

### Component Structure

- **FR-020**: Form components MUST be organized under a `components/` directory within the web source tree, grouped by domain (e.g., `components/forms/`)
- **FR-021**: Hooks that drive form components MUST be co-located with or clearly linked to their corresponding form component

### Layout Architecture

- **FR-022**: The application MUST use three distinct layout zones beneath the minimal root: (1) the home page (`/`) owns its own Topbar directly — no shared layout wrapper; (2) a pathless auth layout group (`_auth`) wraps `/login`, `/sign-up`, and `/reset-password` with a centered card shell and no Topbar; (3) a dashboard layout file (`dashboard.tsx`) wraps all `/dashboard/*` routes as a structural pass-through `<Outlet>`. The root layout MUST remain minimal — handling only global auth hydration (`/api/auth/me`) without rendering any visual chrome

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All five routes (`/`, `/login`, `/sign-up`, `/reset-password`, `/dashboard`) load without runtime errors
- **SC-002**: A visitor can navigate from the home page to the login page in a single click
- **SC-003**: The navigation bar correctly reflects authenticated vs. unauthenticated state based on the auth prop it receives
- **SC-004**: A user attempting to submit any auth form with an empty required field sees an inline error without a page reload
- **SC-005**: A user attempting to submit a sign-up form with a password missing uppercase, special character, or minimum length sees specific, distinct errors for each unmet rule
- **SC-006**: All form components render using the project's designated UI component library, with no custom-built input primitives duplicating library-provided counterparts
- **SC-007**: Each form hook can be instantiated with a success callback that fires exactly once upon a valid form submission

## Assumptions

- Authentication state is provided to the navigation component from a parent-level provider or route context; the navigation component itself does not fetch or manage auth state
- Post-login, post-signup, and post-reset redirect destinations are determined by the consuming page via the success callback — not hardcoded into the form or hook
- The "Log Out" navigation action invokes a provided `onLogout` callback; the actual session termination logic is handled elsewhere (the auth service, built in feature 004)
- Route guards (preventing unauthenticated access to `/dashboard`) are explicitly out of scope and will be addressed in a future feature
- The sign-up form collects at minimum: name, email, and password; additional fields (e.g., username, confirm password) are not required unless specified in the plan
- The dashboard layout shell is scaffolded as a structural pass-through in this feature (renders child content only); dashboard-specific navigation and sidebar are deferred to a future feature

## Clarifications

### Session 2026-03-21

- Q: Should the `/dashboard` route subtree have its own nested layout root separate from the public pages layout? → A: Yes — two layout levels. The root layout is minimal (auth hydration only). Public-facing pages use a separate public layout that renders the Topbar. All `/dashboard/*` routes use a dedicated dashboard layout root as a minimal structural pass-through, isolated from the public Topbar, ready for future sidebar and dashboard-specific topbar additions.
- Q: Should auth pages show the same public Topbar as the home page, or use a minimal centered layout with no navigation? → A: Separate minimal centered layout — home (`/`) keeps the Topbar; auth pages (`/login`, `/sign-up`, `/reset-password`) use a minimal centered layout with no Topbar. Three distinct layout zones in total: public/home (Topbar), auth (centered, no nav), dashboard (pass-through shell).
- Q: Should the auth form content be wrapped in a card/panel or appear directly on the page background? → A: Card/panel — form sits inside an elevated card container centered on a neutral page background (Flowbite `<Card>` or equivalent).
- Q: What should the Topbar logo be for now? → A: Text wordmark "plotter" (lowercase) styled as a brand link; no image asset required at this stage.
- Q: Should the Topbar live in a `_public` layout group route or directly in the home page component? → A: Directly in the home page component (`pages/home.tsx`) — no layout group needed since `/` is the only Topbar-bearing route in this feature; extraction to a layout group is deferred until additional public pages require it.
