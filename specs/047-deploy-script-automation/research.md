# Research & Implementation Decisions: Deploy Script Automation

**Branch**: `047-deploy-script-automation` | **Date**: April 24, 2026

## Executive Summary

This document records decisions made during technical research for the deploy script automation feature. All major unknowns from the specification have been resolved, and the implementation strategy is clear.

## Phase 0: Research Findings

### 1. Git Workflow for Pulling Changes

**Decision**: Use `git pull origin` (default branch)

**Rationale**:

- Simple, standard approach for single-branch deployment workflows
- Assumes deployment always targets the default branch (main/master)
- No need for branch switching or complex merge resolution on CI/CD servers

**Alternatives Considered**:

- `git pull origin <branch>`: Rejected—deployment doesn't typically target multiple branches
- `git fetch && git reset --hard origin/HEAD`: Rejected—destructive reset loses local state; `git pull` with error handling is safer

**Implementation Note**: Script will error out if working directory is dirty (uncommitted changes detected), so pull safety is ensured via validation before attempting pull.

---

### 2. Detecting Changed Projects (web/ vs express/)

**Decision**: Use `git diff-index` to compare against HEAD before and after pull

**Rationale**:

- Efficient: Only runs build commands for projects that actually changed
- Reliable: Git tracks exact file modifications; no false positives
- Non-invasive: No need to re-commit or modify working directory

**Technical Approach**:

```bash
# Before pull, capture HEAD commit
BEFORE=$(git rev-parse HEAD)

# After pull, detect which paths changed
git diff-index --name-only $BEFORE HEAD | grep -E '^(web/|express/)' | cut -d/ -f1 | sort -u
```

**Alternatives Considered**:

- File modification time checks: Rejected—unreliable after network changes, timezone issues
- Always build everything: Rejected—violates performance goal (<5 min cycles)
- `git diff` with stashing: Rejected—unnecessary complexity for clean working directories

---

### 3. Project Build Commands

**Decision**: Hardcoded npm build commands for express/ and web/

**Web Project** (`web/`):

- Command: `npm run build` (from package.json scripts)
- Expected output: Compiled React app in web/dist/

**Express Project** (`express/`):

- Command: `npm run build` (from package.json scripts)
- Expected output: Compiled TypeScript in express/dist/

**Rationale**:

- Both projects already have npm build scripts defined
- Consistent, idiomatic approach for Node.js project structure
- Failures in npm scripts propagate correct exit codes to shell

**Alternatives Considered**:

- External build config file: Rejected—adds complexity for single-repo, two-project case
- Dynamic detection of Makefile/gradle/etc: Rejected—over-engineering; all projects use npm

---

### 4. Server Management with PM2

**Decision**: Use pm2 CLI to stop and restart server

**Implementation Strategy**:

1. **Stop existing processes**:

   ```bash
   pm2 stop all && pm2 delete all
   ```

   Rationale: Clean slate ensures no orphaned processes; simple to reason about

2. **Start new server in forever mode**:
   ```bash
   pm2 start express/dist/src/server.js --name "plotter-server" --instances 1 --max-restarts 10 --min-uptime 10s --watch false
   ```
   Rationale:
   - `--instances 1`: Single instance (no clustering for simplicity)
   - `--max-restarts 10`: Allow PM2 to restart on crash up to 10 times
   - `--min-uptime 10s`: Prevent restart loops (if crash cycle < 10s, PM2 stops trying)
   - `--watch false`: Don't restart on file changes during deployment

**Error Handling**: If pm2 start fails, deployment fails with error code

**Alternatives Considered**:

- systemd service restart: Rejected—adds sudo requirement and deployment environment dependency
- Docker container restart: Rejected—no Docker in current stack
- Direct node process with nohup: Rejected—PM2 provides superior process monitoring and restart capabilities

---

### 5. Prerequisites & Safety Checks

**Decision**: Enforce pre-deployment validation

**Checks** (in order):

1. **Working directory clean**: `git status --porcelain` must be empty
   - Prevents loss of uncommitted work
   - Rationale: Deployments should be from clean states
2. **pm2 installed and running**: `pm2 info` succeeds
   - Prevents cryptic failures if pm2 daemon is dead
   - Rationale: Deploy script depends critically on pm2 being available

3. **Git remote reachable**: `git fetch --dry-run origin` succeeds (optional, improves UX)
   - Early failure before long-running operations
   - Rationale: Better to fail fast than after 2 minutes of build time

**Alternatives Considered**:

- No validation: Rejected—violates error handling requirement (FR-006)
- Only warn, don't stop: Rejected—user would miss warnings in output

---

### 6. Status Output & Progress Tracking

**Decision**: Timestamped, structured output with clear phase markers

**Format**:

```
[HH:MM:SS] Starting deployment...
[HH:MM:SS] Phase 1: Git pull origin
[HH:MM:SS] ✓ Git pull completed
[HH:MM:SS] Phase 2: Detecting changed projects
[HH:MM:SS] Detected changes in: express web
[HH:MM:SS] Phase 3: Building web/
[HH:MM:SS] ✓ web/ build completed
[HH:MM:SS] Phase 4: Building express/
[HH:MM:SS] ✓ express/ build completed
[HH:MM:SS] Phase 5: Restarting server
[HH:MM:SS] ✓ Server restarted successfully
[HH:MM:SS] ✅ Deployment completed in 2m 34s
```

**Rationale**:

- Timestamps aid debugging and performance analysis
- Phase markers show progress to user (especially valuable for >1 min build times)
- Checkmarks provide immediate visual feedback on success

**Alternatives Considered**:

- No output: Rejected—violates requirement (FR-005)
- Minimal output: Rejected—users wouldn't know what's happening
- Verbose npm/git output directly: Rejected—noisy, hard to parse; wrap in structured output

---

### 7. Failure Modes & Graceful Degradation

**Decision**: Fail fast with clear error messages

**Scenarios**:

| Failure Point            | Behavior             | Error Message                                                                          |
| ------------------------ | -------------------- | -------------------------------------------------------------------------------------- |
| Dirty working directory  | Stop; exit code 1    | "Error: Working directory has uncommitted changes. Please commit or stash them first." |
| Git pull fails           | Stop; exit code 1    | "Error: Git pull failed. [Show git error]"                                             |
| pm2 not found            | Stop; exit code 1    | "Error: pm2 is not installed. Please install with: npm install -g pm2"                 |
| Build failure (web/)     | Stop; exit code 1    | "Error: web/ build failed. [Show npm error]" + do NOT restart server                   |
| Build failure (express/) | Stop; exit code 1    | "Error: express/ build failed. [Show npm error]" + do NOT restart server               |
| pm2 restart fails        | Stop; exit code 1    | "Error: Failed to restart server. [Show pm2 error]"                                    |
| No projects changed      | Success; exit code 0 | "No changes detected. Server already up-to-date."                                      |

**Rationale**: Fail-fast prevents partial deployments; clear messages enable user action

---

### 8. Script Location & Invocation

**Decision**: Place at repository root as `deploy.sh`, executable from any directory

**Implementation**:

```bash
#!/bin/bash
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"
# Rest of script...
```

**Rationale**:

- Users can invoke with `./deploy.sh` from repo root or `/path/to/repo/deploy.sh` from anywhere
- Self-contained: finds repo root independently of cwd
- Portable: works with absolute paths in cron jobs, CI/CD, etc.

**Alternatives Considered**:

- Require cwd to be repo root: Rejected—less flexible; violates requirement (FR-008)
- Install in /usr/local/bin: Rejected—deployment tooling should live in repo for version control

---

## Phase 1: Unknowns Resolved

All specification unknowns have been resolved:

| Unknown                             | Resolution                                                          |
| ----------------------------------- | ------------------------------------------------------------------- |
| Which projects to detect and build? | web/ and express/ (user-provided guidance)                          |
| How to detect changes?              | git diff-index against previous HEAD                                |
| Which server management tool?       | pm2 (user-provided guidance)                                        |
| How to restart server?              | pm2 stop all + delete all, then pm2 start [server.js]               |
| How to handle errors in git pull?   | Fail fast; display git error; exit code 1                           |
| How to handle build failures?       | Fail fast before restart; display build error; exit code 1          |
| Should all projects always build?   | No—detect changes via git to save time                              |
| Output format and clarity?          | Timestamped, phase-marked, structured output with visual indicators |

---

## Next Steps

Proceed to **Phase 1: Design** to create:

- `data-model.md` (minimal—script has no persistent data)
- `quickstart.md` (usage instructions)
- `contracts/` (optional exit code contract)

Then proceed to **Phase 2: Tasks** to generate `tasks.md` with specific implementation steps.
