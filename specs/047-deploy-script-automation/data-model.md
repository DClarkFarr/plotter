# Data Model: Deploy Script Automation

**Branch**: `047-deploy-script-automation` | **Date**: April 24, 2026

## Overview

The deploy script is a stateless automation tool with no persistent data storage. This document describes the runtime data structures and execution context that flow through the script during deployment.

## Runtime State

### Execution Context

The script maintains context throughout the deployment lifecycle:

```
REPO_ROOT          : string  # Repository root directory (auto-detected)
BEFORE_COMMIT      : string  # Git commit hash before pull
AFTER_COMMIT       : string  # Git commit hash after pull
CHANGED_PROJECTS   : array   # Projects with file changes ["express", "web", ...]
START_TIME         : number  # Unix timestamp when deployment began
DEPLOY_STATUS      : enum    # "in_progress" | "success" | "failed"
ERROR_MESSAGE      : string  # (if DEPLOY_STATUS == "failed")
EXIT_CODE          : number  # 0 = success, non-zero = failure
```

### Phase Tracking

Each deployment phase has metadata:

```
Phase {
  name            : string   # "git_pull" | "detect_changes" | "build_web" | "build_express" | "restart_server"
  status          : enum     # "pending" | "in_progress" | "completed" | "failed"
  start_time      : number   # Unix timestamp
  end_time        : number   # Unix timestamp
  duration_ms     : number   # end_time - start_time
  command         : string   # Shell command executed
  return_code     : number   # 0 = success, non-zero = failure
  output          : string   # Last line or error message (optional, for logging)
}
```

## Data Flows

### Input Sources

1. **Git Repository State**
   - Current working directory status
   - Remote origin URL and reachability
   - HEAD commit hash before/after pull

2. **File System**
   - Existence of web/ and express/ directories
   - Presence of package.json in each directory
   - Ability to write to directories (permissions)

3. **System Services**
   - pm2 daemon availability and configuration
   - npm executable and version
   - User permissions for process management

### Output Flows

1. **Standard Output**
   - Timestamped status messages
   - Phase progress indicators
   - Success/failure summaries

2. **Standard Error**
   - Error messages from git, npm, pm2
   - Diagnostic information on failures

3. **Exit Code**
   - 0 if deployment succeeded
   - Non-zero if any phase failed

4. **Side Effects**
   - Modified git working directory (pulled changes)
   - Rebuilt artifacts in express/dist/ and/or web/dist/
   - Server process restarted via pm2

## Validation Rules

### Pre-Deployment Validation

| Field             | Rule                                      | Error Action                 |
| ----------------- | ----------------------------------------- | ---------------------------- |
| Working Directory | Must be clean (no uncommitted changes)    | Abort with error message     |
| Git Remote        | origin must exist and be reachable        | Abort or warn (configurable) |
| pm2 Daemon        | Must be running and responsive            | Abort with error message     |
| Node.js           | Must be installed; npm must be accessible | Abort with error message     |

### Project Change Detection

```
Changed := any file in path [web/**, express/**] has been modified
          (detected via git diff-index before..after)
```

### Build Validation

For each project to be built:

- package.json must exist in project root
- `npm run build` script must be defined
- Build must exit with code 0

If any build fails, subsequent phases (server restart) are skipped.

### Server Start Validation

- pm2 must successfully start the process
- Process must stay alive for > 10 seconds (indicating it didn't immediately crash)
- exit code from pm2 start must be 0

## Error States & Recovery

### Non-Recoverable Errors

These errors prevent deployment and require manual intervention:

1. **Dirty working directory**
   - User must commit or stash changes manually
   - Script aborts before any modifications

2. **Build failure**
   - User must fix source code
   - Server is NOT restarted (prevents deploying broken builds)

3. **pm2 failure**
   - User must check pm2 logs: `pm2 logs`
   - May require pm2 restart or reinstall

### Transient Errors (Potential Retry Points)

These could theoretically be retried in future versions:

1. **Network timeout on git pull**
   - Could retry git pull with backoff
   - Currently: single attempt, fail if timeout

2. **npm package installation issues**
   - Could retry npm install
   - Currently: fails if build fails

## Logging & Audit Trail

The script produces structured output suitable for audit/debugging:

```
[TIMESTAMP] [PHASE] [STATUS] [MESSAGE]

Example:
[2026-04-24 14:32:15] [git_pull] [START] Running git pull origin
[2026-04-24 14:32:18] [git_pull] [DONE] Successfully pulled 3 commits
[2026-04-24 14:32:19] [detect] [START] Detecting changed projects
[2026-04-24 14:32:19] [detect] [DONE] Found changes in: express web
[2026-04-24 14:32:20] [build:web] [START] Running npm run build in web/
[2026-04-24 14:32:45] [build:web] [DONE] Build completed successfully
[2026-04-24 14:32:46] [build:express] [START] Running npm run build in express/
[2026-04-24 14:32:58] [build:express] [DONE] Build completed successfully
[2026-04-24 14:32:59] [restart] [START] Restarting server via pm2
[2026-04-24 14:33:02] [restart] [DONE] Server online; PID: 12345
[2026-04-24 14:33:02] [summary] [SUCCESS] Deployment completed in 47 seconds
```

Future: Logs could be written to file (e.g., `deploy.log`) for audit trail.

## Configuration & Future Extensibility

### Current State (MVP)

- Project directories hardcoded: `web/`, `express/`
- Build commands hardcoded: `npm run build` for each
- Server entry point hardcoded: `express/dist/src/server.js`
- pm2 app name hardcoded: `plotter-server`

### Future Enhancement Opportunities

If needed, could externalize to `deploy.config.sh` or environment variables:

```bash
# deploy.config.sh (future)
PROJECTS=("web" "express")
BUILD_COMMANDS=("npm run build" "npm run build")
SERVER_ENTRY_POINT="express/dist/src/server.js"
PM2_APP_NAME="plotter-server"
```

This would allow single script to work across different repositories/configurations.
