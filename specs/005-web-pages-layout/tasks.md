# Tasks: Web Pages — Initial Layout & Auth Forms

**Input**: Design documents from `/specs/005-web-pages-layout/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/auth-api.md ✅ | quickstart.md ✅
**Tests**: Not requested — no test tasks included.
**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependencies within current phase)
- **[Story]**: Which user story this belongs to (US1–US5)

---

## Phase 1: Setup

**Purpose**: Install the one new dependency and configure the environment so every subsequent task can compile and run.

- [ ] T001 Run `npm install axios` in `web/`
- [ ] T002 Create `web/.env.development` with `VITE_API_BASE_URL=http://localhost:1000/api`
- [ ] T003 [P] Add `.env.development` and `.env.production` to `web/.gitignore` (if not already present)

**Checkpoint**: `npm run dev` in `web/` still starts without errors; `axios` appears in `web/node_modules/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API types, Axios singleton, typed auth endpoint wrappers, Zustand auth store, and TanStack Query provider. Every user story depends on this layer.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Create `web/src/api/types.ts` — define `AuthUser`, `AuthUserResponse`, `MessageResponse`, `ApiErrorResponse` interfaces, and `ApiError` class (with `status: number` and `serverMessage: string`) per `data-model.md`
- [ ] T005 [P] Create `web/src/lib/apiClient.ts` — export a single Axios instance created with `baseURL: import.meta.env.VITE_API_BASE_URL`, `withCredentials: true`, and `Content-Type: application/json`
- [ ] T006 Create `web/src/api/auth.ts` — implement `login()`, `signup()`, `resetPasswordRequest()`, and `getMe()` as typed async functions; each imports `apiClient` and catches Axios errors, re-throwing as `ApiError` with the HTTP status and `response.data.error`; network errors throw `ApiError` with `status: 0`; types imported from `web/src/api/types.ts` (depends on T004, T005)
- [ ] T007 Create `web/src/store/authStore.ts` — Zustand store with `user: AuthUser | null`, `isAuthenticated: boolean`, `setUser(user: AuthUser | null): void`, and `clearUser(): void`; imports `AuthUser` from `web/src/api/types.ts` (depends on T004)
- [ ] T008 Update `web/src/main.tsx` — import `QueryClient` and `QueryClientProvider` from `@tanstack/react-query`; create a `queryClient` instance; wrap `<RouterProvider>` with `<QueryClientProvider client={queryClient}>` (depends on T004–T007 being present so compilation passes)

**Checkpoint**: TypeScript compilation passes; `apiClient`, `AuthUser`, `ApiError`, and `authStore` are all importable

---

## Phase 3: User Story 1 — Visitor Sees a Welcoming Landing Page (Priority: P1) 🎯 MVP

**Goal**: A visitor lands on `/`, sees the "Welcome to Plotter" banner and a "Get Started" CTA, with a Topbar showing the "plotter" wordmark and auth-aware nav links.

**Independent Test**: Run `npm run dev`; navigate to `http://localhost:5173/`. Confirm the centered banner and CTA render. Confirm the Topbar shows "plotter" wordmark on the left and "Log In" / "Sign Up" on the right. Check that clicking "Get Started" navigates to `/login` (the route can 404 at this stage — that is expected).

- [ ] T009 [P] [US1] Create `web/src/components/layout/Topbar.tsx` — Flowbite `<Navbar>` with `<Navbar.Brand>` displaying text "plotter" (lowercase, styled as a brand link with `font-bold`) on the left; reads `authStore` via Zustand; renders `<Link to="/login">Log In</Link>` and `<Link to="/sign-up">Sign Up</Link>` when `isAuthenticated` is false; renders `<Link to="/dashboard">Dashboard</Link>` and a "Log Out" `<button>` (calls `authStore.clearUser()` as stub; real logout is future work) when `isAuthenticated` is true; uses `<Link>` from `@tanstack/react-router`
- [ ] T010 [US1] Update `web/src/routes/__root.tsx` — import `useQuery` from `@tanstack/react-query`; import `getMe` from `web/src/api/auth.ts`; import `authStore` from `web/src/store/authStore.ts`; call `useQuery({ queryKey: ['me'], queryFn: getMe, retry: false })`; on query success call `authStore.setUser(data.user)`; on query error call `authStore.clearUser()`; render **only** `<Outlet />` as the component — no Topbar, no visual chrome (depends on T006, T007)
- [ ] T011 [US1] Rewrite `web/src/pages/home.tsx` — render `<Topbar />` at the top; below it render a full-height centered section using Tailwind; display `<h1>Welcome to Plotter</h1>`; render a Flowbite `<Button>` as `<Link to="/login">` with label "Get Started" (depends on T009)

**Checkpoint (US1 complete)**: `/` shows Topbar with "plotter" wordmark, banner, and CTA; no Topbar on 404 or other routes yet

---

## Phase 3.5: Auth Layout Group (Blocking for US2, US3, US4)

**Purpose**: The `_auth.tsx` pathless layout wraps all auth routes in a centered card shell. Must exist before any auth page routes can render correctly.

- [ ] T009b Create `web/src/routes/_auth.tsx` — pathless TanStack Router layout route (`createFileRoute('/_auth')({ component: AuthLayout })`); `AuthLayout` renders a full-viewport Tailwind container (`min-h-screen bg-gray-50 flex items-center justify-center`) with a Flowbite `<Card>` of fixed max-width (`max-w-md w-full`) containing `<Outlet />`; no Topbar or navigation chrome
- [ ] T009c Create `web/src/routes/dashboard.tsx` — TanStack Router layout file for the `/dashboard` path segment (`createFileRoute('/dashboard')({ component: DashboardLayout })`); `DashboardLayout` renders `<Outlet />` only — a structural pass-through for future sidebar/topbar additions; no visual chrome

**Checkpoint (Phase 3.5 complete)**: Auth layout group and dashboard layout wrapper exist; TypeScript compiles cleanly

---

## Phase 4: User Story 2 — New User Signs Up (Priority: P2)

**Goal**: A visitor on `/sign-up` can fill in name, email, and password; field validation runs on blur and submit; `onSignUpSuccess` fires on a valid submission.

**Independent Test**: Navigate to `/sign-up`. Submit empty form — see required-field errors on all fields. Enter a short/weak password and blur — see specific password errors. Enter valid data and submit — confirm the form invokes `onSignUpSuccess` (in the page component this triggers a navigate to `/dashboard`).

- [ ] T012 [P] [US2] Create `web/src/hooks/useSignUpForm.ts` — manage `fields: { firstName, lastName, email, password }`, `touched: Record<keyof fields, boolean>`, and `fieldErrors: Record<keyof fields, string | undefined>`; implement `validateField(name, value)` which checks: firstName/lastName required; email required + regex format; password required, length 12–128, contains uppercase (`/[A-Z]/`), contains special char (`/[^a-zA-Z0-9]/`); expose `handleChange`, `handleBlur` (marks field touched + validates), and `handleSubmit` (marks all fields touched, validates all, calls `mutate` only when errors-free); use `useMutation` with `signup()` from `web/src/api/auth.ts`; on mutation success call `setUser(data.user)` in authStore then call `opts.onSignUpSuccess()`; on mutation error map `ApiError.status` to a `formError: string` (400 → show `serverMessage`, 409 → "An account with this email already exists.", 429 → "Too many attempts. Please try again later.", else → "Something went wrong. Please try again."); return a props object: `{ fields, fieldErrors, formError, isSubmitting, handleChange, handleBlur, handleSubmit }` (depends on T004, T006, T007)
- [ ] T013 [US2] Create `web/src/components/forms/SignUpForm.tsx` — accepts the props object returned by `useSignUpForm`; renders a `<form onSubmit={handleSubmit}>`; four Flowbite `<Label>` + `<TextInput>` pairs for firstName, lastName, email, password (type="password"); each field gets `onBlur={handleBlur}` and `onChange={handleChange}`; show inline `<p className="text-red-500 text-sm">` beneath each field when its `fieldErrors` entry is truthy and the field has been touched; show a Flowbite `<Alert color="failure">` above the submit button when `formError` is truthy; submit button is a Flowbite `<Button type="submit">` with `isProcessing={isSubmitting}` (depends on T012)
- [ ] T014 [US2] Create `web/src/pages/sign-up.tsx` — call `useSignUpForm({ onSignUpSuccess: () => navigate({ to: '/dashboard' }) })`; import `useNavigate` from `@tanstack/react-router`; render `<SignUpForm {...formProps} />` (depends on T012, T013)
- [ ] T015 [US2] Create `web/src/routes/_auth/sign-up.tsx` — `createFileRoute('/_auth/sign-up')({ component: SignUpPage })` importing from `web/src/pages/sign-up.tsx`; the `_auth` layout wrapper automatically provides the centered card shell (depends on T009b, T014)

**Checkpoint (US2 complete)**: `/sign-up` renders, validates inline, surfaces API errors, and calls `onSignUpSuccess` on success

---

## Phase 5: User Story 3 — Existing User Logs In (Priority: P3)

**Goal**: A user on `/login` can enter email and password; field validation runs on blur and submit; `onLoginSuccess` fires on a valid submission.

**Independent Test**: Navigate to `/login`. Submit empty — see required errors. Enter wrong password (after sign-up account exists) — see "Invalid email or password." alert. Enter valid credentials — confirm `onLoginSuccess` fires and navigates to `/dashboard`.

- [ ] T016 [P] [US3] Create `web/src/hooks/useLoginForm.ts` — same structural pattern as `useSignUpForm` but for `fields: { email, password }`; validate email required + format, password required (no strength rules on login — it's a raw input); use `useMutation` with `login()` from `web/src/api/auth.ts`; on success call `authStore.setUser(data.user)` then `opts.onLoginSuccess()`; on error map `ApiError.status`: 401 → "Invalid email or password.", 429 → "Too many attempts. Please try again later.", else → "Something went wrong. Please try again."; return same props shape: `{ fields, fieldErrors, formError, isSubmitting, handleChange, handleBlur, handleSubmit }` (depends on T004, T006, T007)
- [ ] T017 [US3] Create `web/src/components/forms/LoginForm.tsx` — prop-driven; two Flowbite `<Label>` + `<TextInput>` pairs for email and password; inline field error display; Flowbite `<Alert color="failure">` for `formError`; Flowbite `<Button type="submit">` with `isProcessing={isSubmitting}`; include a "Sign up" link beneath the form pointing to `/sign-up` and a "Forgot password?" link pointing to `/reset-password` (depends on T016)
- [ ] T018 [US3] Create `web/src/pages/login.tsx` — call `useLoginForm({ onLoginSuccess: () => navigate({ to: '/dashboard' }) })`; render `<LoginForm {...formProps} />` (depends on T016, T017)
- [ ] T019 [US3] Create `web/src/routes/_auth/login.tsx` — `createFileRoute('/_auth/login')({ component: LoginPage })` importing from `web/src/pages/login.tsx`; rendered inside the `_auth` centered card layout (depends on T009b, T018)

**Checkpoint (US3 complete)**: `/login` validates, surfaces 401 errors, and navigates to `/dashboard` on success

---

## Phase 6: User Story 4 — User Requests a Password Reset (Priority: P4)

**Goal**: A user on `/reset-password` can enter their email; on submit a success message is shown; validation errors appear on blur and submit.

**Independent Test**: Navigate to `/reset-password`. Submit empty — see required error. Submit valid email — see the success message ("If the account exists, instructions have been sent.") rendered in the UI and `onResetSuccess` invoked.

- [ ] T020 [P] [US4] Create `web/src/hooks/useResetPasswordForm.ts` — `fields: { email }`; validate email required + format; use `useMutation` with `resetPasswordRequest()` from `web/src/api/auth.ts`; on success call `opts.onResetSuccess()`; on error: 429 → "Too many attempts. Please try again later.", else → "Something went wrong. Please try again."; return `{ fields, fieldErrors, formError, isSubmitting, isSuccess, handleChange, handleBlur, handleSubmit }` — include `isSuccess: boolean` from the mutation state so the page can show a confirmation (depends on T004, T006)
- [ ] T021 [US4] Create `web/src/components/forms/ResetPasswordForm.tsx` — prop-driven; one Flowbite `<Label>` + `<TextInput>` for email; inline error; `<Alert color="failure">` for `formError`; when `isSuccess` is true render a Flowbite `<Alert color="success">` with "If the account exists, instructions have been sent." and hide the form fields; `<Button type="submit">` with `isProcessing={isSubmitting}`; include a "Back to Log In" link to `/login` (depends on T020)
- [ ] T022 [US4] Create `web/src/pages/reset-password.tsx` — call `useResetPasswordForm({ onResetSuccess: () => {} })`; render `<ResetPasswordForm {...formProps} />`; `onResetSuccess` is a no-op since the success state is surfaced via `isSuccess` in the form itself (depends on T020, T021)
- [ ] T023 [US4] Create `web/src/routes/_auth/reset-password.tsx` — `createFileRoute('/_auth/reset-password')({ component: ResetPasswordPage })` importing from `web/src/pages/reset-password.tsx`; rendered inside the `_auth` centered card layout (depends on T009b, T022)

**Checkpoint (US4 complete)**: `/reset-password` validates email, shows success message on submit, surfaces rate-limit errors

---

## Phase 7: User Story 5 — Dashboard Placeholder (Priority: P5)

**Goal**: The `/dashboard` route renders without errors, displaying a "Welcome to Dashboard" placeholder.

**Independent Test**: Navigate to `/dashboard`. Confirm the placeholder renders. Confirm the Topbar is visible. No crash or blank screen.

- [ ] T024 [P] [US5] Create `web/src/pages/dashboard.tsx` — render a simple `<main>` with `<h1>Welcome to Dashboard</h1>` placeholder; use Tailwind for basic padding/centering
- [ ] T025 [US5] Create `web/src/routes/dashboard/index.tsx` — `createFileRoute('/dashboard/')({ component: DashboardPage })` importing from `web/src/pages/dashboard.tsx`; this route is a child of the `dashboard.tsx` layout wrapper (depends on T009c, T024)

**Checkpoint (US5 complete)**: `/dashboard` renders the placeholder; all five routes now exist

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T026 Verify `web/src/routeTree.gen.ts` has been regenerated by the TanStack Router Vite plugin to include all new routes (`/_auth/login`, `/_auth/sign-up`, `/_auth/reset-password`, `/dashboard/`); if stale, run `npm run dev` once to trigger regeneration
- [ ] T027 Run `npm run build` in `web/` and fix any TypeScript errors; common issues: missing `import.meta.env` type declaration for `VITE_API_BASE_URL`, untyped hook return values, missing Flowbite component prop types
- [ ] T028 Remove or clear out the boilerplate content from `web/src/App.tsx` if it is still referenced anywhere; confirm it is not imported by any route file (it should not be, given the TanStack Router setup)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 3.5 (Layout group + dashboard layout)**: Depends on Phase 2 — can run in parallel with Phase 3
- **Phase 4 (US2)**: Depends on Phase 2 AND Phase 3.5 (needs `_auth.tsx`)
- **Phase 5 (US3)**: Depends on Phase 2 AND Phase 3.5 (needs `_auth.tsx`)
- **Phase 6 (US4)**: Depends on Phase 2 AND Phase 3.5 (needs `_auth.tsx`)
- **Phase 7 (US5)**: Depends on Phase 2 AND Phase 3.5 (needs `dashboard.tsx`)
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

| Story    | Depends On         | Can parallelize with |
| -------- | ------------------ | -------------------- |
| US1 (P1) | Phase 2 Foundation | US2, US3, US4, US5   |
| US2 (P2) | Phase 2 Foundation | US1, US3, US4, US5   |
| US3 (P3) | Phase 2 Foundation | US1, US2, US4, US5   |
| US4 (P4) | Phase 2 Foundation | US1, US2, US3, US5   |
| US5 (P5) | Phase 2 Foundation | US1, US2, US3, US4   |

### Within Phase 2 (Foundation)

```
T004 (types.ts)  ─┬──────────────────────────► T006 (auth.ts)
T005 (apiClient) ─┘                              │
                                                  ▼
T004 ───────────────────────────────────► T007 (authStore)
                                                  │
                   T004+T005+T006+T007 ──► T008 (main.tsx QueryClientProvider)
```

### Within Each User Story (sequential within story)

```
Hook (Txx) → Form Component (Txx+1) → Page (Txx+2) → Route (Txx+3)
```

---

## Parallel Execution Examples

### Parallel: Foundation (Phase 2)

```
T004 + T005 can start simultaneously (independent files)
Then T006 + T007 can start simultaneously once T004+T005 are done
Then T008 once T006+T007 are done
```

### Parallel: All User Story Hooks (after Foundation)

```
T012 (useSignUpForm) + T016 (useLoginForm) + T020 (useResetPasswordForm)
— all in different files, no shared dependencies within the group
```

### Parallel: All User Story Form Components (after hooks)

```
T013 (SignUpForm) + T017 (LoginForm) + T021 (ResetPasswordForm)
```

### Parallel: All Routes (after pages)

```
T015 (sign-up route) + T019 (login route) + T023 (reset-password route) + T025 (dashboard route)
```

---

## Task Summary

| Phase                         | Tasks        | User Story | Parallelizable |
| ----------------------------- | ------------ | ---------- | -------------- |
| Phase 1: Setup                | T001–T003    | —          | T001, T003     |
| Phase 2: Foundation           | T004–T008    | —          | T004, T005     |
| Phase 3: US1 Landing + Topbar | T009–T011    | US1        | T009           |
| Phase 3.5: Layout Routes      | T009b, T009c | —          | T009b, T009c   |
| Phase 4: US2 Sign Up          | T012–T015    | US2        | T012           |
| Phase 5: US3 Login            | T016–T019    | US3        | T016           |
| Phase 6: US4 Reset Password   | T020–T023    | US4        | T020           |
| Phase 7: US5 Dashboard        | T024–T025    | US5        | T024           |
| Phase 8: Polish               | T026–T028    | —          | T026           |

**Total tasks**: 30  
**Tasks per user story**: US1 → 3, US2 → 4, US3 → 4, US4 → 4, US5 → 2  
**Layout infrastructure (Phase 3.5)**: T009b (`_auth.tsx`), T009c (`dashboard.tsx`)  
**Parallel opportunities**: 10 tasks

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundation)
2. Complete Phase 3 (US1 — Landing + Nav)
3. **Stop and validate**: visit `/`, confirm banner, CTA, and Topbar
4. Demo to stakeholders

### Incremental Delivery

1. Setup + Foundation → compile check passes
2. US1 → home page + nav shell working
3. US2 → sign-up flow working end-to-end
4. US3 → login flow working end-to-end
5. US4 → reset password flow working
6. US5 → dashboard placeholder and all nav links resolve
7. Polish → clean build, no TS errors
