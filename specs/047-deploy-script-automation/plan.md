# Implementation Plan: Deploy Script Automation

**Branch**: `047-deploy-script-automation` | **Date**: April 24, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/047-deploy-script-automation/spec.md`

## Summary

A bash deployment script that automates the server deployment process in a single command. The script:

1. Pulls latest changes from the git remote (origin)
2. Detects which projects changed (web/ and/or express/) using git diff-index
3. Runs appropriate npm build commands for changed projects
4. Manages server lifecycle using pm2 (stop existing processes, start in forever mode)
5. Provides clear progress feedback and fail-fast error handling

## Technical Context

**Language/Version**: Bash (sh-compatible, targeting Linux/macOS)  
**Primary Dependencies**: git, npm, pm2 (Node.js ecosystem)  
**Storage**: N/A (script only, no persistent storage)  
**Testing**: Manual testing and shell script validation (shellcheck)  
**Target Platform**: Linux/macOS servers (development and production)
**Project Type**: DevOps/CLI deployment automation tool  
**Performance Goals**: Complete deployment cycle (pull + build + restart) in under 5 minutes for typical changes  
**Constraints**: Must preserve uncommitted changes detection; must not corrupt working directory; pm2 must be installed system-wide  
**Scale/Scope**: Single repository with two main projects (express/ and web/); scalable to additional projects via configuration

## Constitution Check

_GATE: Deployment automation is outside core application stack._

**Applicability**: The deploy script is DevOps infrastructure, not part of the Express backend
or React frontend applications governed by the Plotter Constitution. Constitution
principles do not apply to this feature.

**Notes**:

- The script orchestrates building the express/ and web/ projects, which internally must
  follow their respective constitution guardrails
- The script itself has no dependencies on the constitutional technology stack
- No violations; no justification required

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
deploy.sh                 # Main deployment script (executable, at repo root)
deploy/                   # Optional: helper utilities and configuration
├── lib/
│   ├── colors.sh        # Terminal color utilities
│   ├── logging.sh       # Timestamped logging functions
│   └── git.sh           # Git utilities (detect changes)
└── config.example.sh    # Example configuration (optional, for future extensibility)
```

**Structure Decision**: Single executable script at repository root (`deploy.sh`) that can be
invoked from any directory. Optional helper libraries in `deploy/lib/` for code organization
and reusability. Configuration remains minimal initially; hardcoded project paths (express/,
web/) with potential for environment variable overrides in future versions.
