# Implementation Plan: Forgot Password Email Flow

**Branch**: `048-password-reset-email` | **Date**: April 24, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/048-password-reset-email/spec.md`

## Summary

Complete the forgot/reset password flow end-to-end by extending the existing auth reset implementation to send a real password reset email and support a code-based confirmation step. The backend will issue a reset credential, deliver it via email, and verify code + new password. The frontend will support the full two-step UX (request and confirm). Gmail SMTP placeholder configuration will be added via environment variables so local setup works quickly.

## Technical Context

**Language/Version**: TypeScript (Node.js backend, React frontend)  
**Primary Dependencies**: Express, MongoDB driver, Nodemailer, TanStack Query/Router, Flowbite React  
**Storage**: MongoDB (`users`, `passwordResets`, `authAttempts`)  
**Testing**: Manual API/UI verification + backend route/service checks + existing lint/type/build commands  
**Target Platform**: Web application (browser + Express API)  
**Project Type**: Monorepo web app (`express/` + `web/`)  
**Performance Goals**: Reset request responds quickly (<3s typical), reset confirm in one round trip  
**Constraints**: Security-first reset flow (single-use, expiry, non-enumeration), preserve current auth/session behavior  
**Scale/Scope**: Existing user auth base with incremental reset flow enhancement

## Constitution Check

_GATE: Must pass before implementation._

- Stack guardrails honored: backend changes remain in Express service/router/model layers, frontend uses existing TanStack + Flowbite patterns.
- Clean Architecture preserved: router thin, service orchestration in auth/email services, model layer remains CRUD-focused.
- Security expectations preserved: no account existence leakage, reset artifacts remain expiring and single-use.
- No new framework introduced beyond Nodemailer dependency.

## Project Structure

### Documentation (this feature)

```text
specs/048-password-reset-email/
├── spec.md
├── plan.md
└── checklists/
    └── requirements.md
```

### Source Code (planned touch points)

```text
express/
├── package.json                               # add nodemailer dependency
└── src/
    ├── routers/
    │   └── authRouter.ts                      # request + confirm endpoints (confirm accepts code + password)
    ├── services/
    │   ├── authService.ts                     # generate code, persist hash, verify code, update password
    │   ├── emailService.ts                    # nodemailer transport + send helper
    │   └── emailTemplates/
    │       └── passwordResetEmail.ts          # reset email template and copy
    ├── models/
    │   └── passwordResets.ts                  # fields/helpers for code lifecycle if needed
    └── utils/
        ├── env.ts                             # add Gmail/email env config keys
        └── app.ts                             # pass new env vars via setupEnvironment

web/
└── src/
    ├── api/
    │   └── auth.ts                            # reset request + confirm(code,password) API calls
    ├── hooks/
    │   ├── useResetPasswordForm.ts            # request step
    │   └── useResetPasswordConfirmForm.ts     # new confirm step (code + new password)
    ├── components/forms/
    │   ├── ResetPasswordForm.tsx              # request form UX polish
    │   └── ResetPasswordConfirmForm.tsx       # new code/password form
    ├── pages/
    │   └── reset-password.tsx                 # orchestrate two-step flow
    └── routes/_auth/reset-password.tsx        # existing route entry remains
```

**Structure Decision**: Extend existing auth and reset code paths in place; add focused email service/template modules and confirm-form UI to avoid mixing transport logic with auth logic.

## Implementation Phases

### Phase 1: Add Nodemailer + Gmail Environment Wiring

Goal: Establish outbound email capability with safe placeholder config.

1. Add Nodemailer dependency to [express/package.json](../../express/package.json).
2. Extend env configuration in [express/src/utils/env.ts](../../express/src/utils/env.ts) with keys for:
   - `MAILER_GMAIL_USER`
   - `MAILER_GMAIL_PASS`
   - `MAILER_FROM_EMAIL`
   - `MAILER_FROM_NAME`
3. Pass new environment values in [express/src/utils/app.ts](../../express/src/utils/app.ts) `setupEnvironment()`.
4. Implement [express/src/services/emailService.ts](../../express/src/services/emailService.ts):
   - Create Nodemailer transport using Gmail service config
   - Provide `sendEmail` function
   - Fail clearly when required mailer env vars are missing
5. Document placeholder values for local setup (to be captured in quickstart/task docs):
   - `MAILER_GMAIL_USER=your-gmail@gmail.com`
   - `MAILER_GMAIL_PASS=your-gmail-app-password`
   - `MAILER_FROM_EMAIL=your-gmail@gmail.com`
   - `MAILER_FROM_NAME=Plotter`

### Phase 2: Build Password Reset Email Template + Code Generation

Goal: Send a real, user-facing reset email that contains a short code.

1. Add [express/src/services/emailTemplates/passwordResetEmail.ts](../../express/src/services/emailTemplates/passwordResetEmail.ts):
   - Plain text + HTML versions
   - Includes reset code and brief instructions
2. Update [express/src/services/authService.ts](../../express/src/services/authService.ts) request flow:
   - Generate short verification code (human-enterable)
   - Hash and store code in password reset record
   - Set expiry and single-use semantics
   - Send template email using `emailService`
3. Keep response message generic for account enumeration protection.
4. Preserve audit logging for request events.

### Phase 3: Confirm Endpoint for Code + New Password

Goal: Accept code-based reset confirmation via API.

1. Update [express/src/routers/authRouter.ts](../../express/src/routers/authRouter.ts):
   - Confirm endpoint accepts `email`, `code`, and `password` (or equivalent validated identity + code)
2. Update [express/src/services/authService.ts](../../express/src/services/authService.ts):
   - Validate input payload and password policy
   - Resolve active reset request for user
   - Compare submitted code against stored hash
   - Enforce expiry and single-use checks
   - Update user password and invalidate existing sessions
   - Mark reset as used and log reset-confirm event
3. Return clear but safe error responses for invalid/expired/used code.

### Phase 4: Complete Reset Password Form Flow in Web App

Goal: Ensure user can complete request + confirmation in UI.

1. Keep request form behavior in [web/src/hooks/useResetPasswordForm.ts](../../web/src/hooks/useResetPasswordForm.ts) and [web/src/components/forms/ResetPasswordForm.tsx](../../web/src/components/forms/ResetPasswordForm.tsx), including success state and validation.
2. Add confirm API function in [web/src/api/auth.ts](../../web/src/api/auth.ts) for code + new password submission.
3. Add new hook [web/src/hooks/useResetPasswordConfirmForm.ts](../../web/src/hooks/useResetPasswordConfirmForm.ts) with field validation and API mutation.
4. Add form component [web/src/components/forms/ResetPasswordConfirmForm.tsx](../../web/src/components/forms/ResetPasswordConfirmForm.tsx) for:
   - Email
   - Verification code
   - New password
5. Update [web/src/pages/reset-password.tsx](../../web/src/pages/reset-password.tsx) to orchestrate two-step flow:
   - Step A: request reset email
   - Step B: submit code + new password
   - Show completion confirmation and link to login

### Phase 5: Verification, Hardening, and Developer Setup

Goal: Validate that all required user outcomes and integration points work.

1. Backend checks:
   - Request endpoint sends email through Gmail transport (with placeholders configured)
   - Confirm endpoint blocks invalid/expired/used codes
   - Password actually changes and old password no longer authenticates
2. Frontend checks:
   - Request form success/error states are clear
   - Confirm form validates fields and handles API errors
   - End-to-end flow works from request to successful login with new password
3. Security checks:
   - Generic request response for unknown emails
   - Rate limiting behavior still applies to reset attempts
4. Developer notes:
   - Capture required env vars and Gmail app-password requirement in feature docs

## API Contract Changes (Planned)

1. Existing endpoint remains: `POST /api/auth/reset-password/request`
   - Request: `{ email }`
   - Response: generic success message
2. Confirm endpoint payload becomes code-based:
   - `POST /api/auth/reset-password/confirm`
   - Request: `{ email, code, password }`
   - Response: password updated message

## Risks and Mitigations

1. Gmail SMTP auth failures in development.
   - Mitigation: explicit startup/runtime error messages and documented app-password requirement.
2. Code brute force risk.
   - Mitigation: keep auth attempt throttling for reset actions and short code expiration.
3. Token-to-code migration mismatch with existing reset records.
   - Mitigation: handle legacy records safely or invalidate pre-change reset artifacts.

## Definition of Done

1. Nodemailer is installed and Gmail-configured via env placeholders.
2. Password reset email template exists and is used for request flow.
3. Confirm endpoint accepts code + new password and updates credentials securely.
4. Reset password UI supports full request/confirm workflow.
5. Manual end-to-end test confirms successful reset and login with new password.
