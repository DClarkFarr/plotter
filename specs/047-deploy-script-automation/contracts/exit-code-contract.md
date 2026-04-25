# Exit Code Contract: Deploy Script Automation

**Branch**: `047-deploy-script-automation` | **Date**: April 24, 2026

## Contract Overview

The deploy script communicates deployment status through standard Unix exit codes and structured output. This contract defines the interface that external systems (CI/CD, monitoring, notifications) can rely on.

## Exit Codes

### Success

| Code  | Meaning                           | Deployment State                        | Action                               |
| ----- | --------------------------------- | --------------------------------------- | ------------------------------------ |
| **0** | Deployment completed successfully | All changes pulled, built, and deployed | Notify team of successful deployment |

### Failure Codes

| Code  | Meaning                          | Deployment State                                         | Root Cause                                                                    | Action                                                 |
| ----- | -------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| **1** | Pre-deployment validation failed | No changes made                                          | Working directory dirty, git unreachable, pm2 unavailable, or Node.js missing | Fix the reported issue; retry deploy                   |
| **2** | Git pull failed                  | Changes not pulled; builds not run; server not restarted | Network error, merge conflict, or permission error                            | Resolve git error; retry deploy                        |
| **3** | Build failed                     | Some/all builds failed; server NOT restarted             | Compilation error, missing dependencies, or missing npm script                | Fix source code or dependencies; retry deploy          |
| **4** | Server restart failed            | Builds completed successfully; server NOT restarted      | pm2 process start failed or process crashed immediately                       | Check pm2 logs; fix server startup issue; retry deploy |

## Output Format Contract

### Standard Output (stdout)

All user-facing messages are written to stdout in the following format:

```
[HH:MM:SS] [PHASE_ID] [STATUS] [MESSAGE]
```

Where:

- **HH:MM:SS**: Timestamp in local time (24-hour format)
- **PHASE_ID**: One of: `setup`, `pull`, `detect`, `build`, `restart`, `summary` (optional, used in some messages)
- **STATUS**: One of: `✓` (success), `❌` (error), `→` (in progress), or plain text
- **MESSAGE**: Human-readable status message

### Examples

**Success line**:

```
[14:32:18] ✓ Git pull completed (3 commits pulled)
```

**Error line**:

```
[14:32:15] ❌ Error: Working directory has uncommitted changes
```

**Info line**:

```
[14:32:19] Detected changes in: express web
```

### Standard Error (stderr)

Error messages from git, npm, and pm2 are written to stderr with minimal formatting. The deploy script wraps critical errors with context.

Example:

```
Error: express/ build failed
[stderr from npm]
```

## Behavior Guarantees

### All-or-Nothing Guarantee

Either **all** phases complete successfully, or the script stops at the first failure:

- ✅ Phase 1 (pull) succeeds → continue to Phase 2
- ❌ Phase 2 (detect) has non-fatal warning → log and continue
- ❌ Phase 3 (build) fails → STOP; exit code 3; do NOT restart server
- If any phase fails, server is NEVER restarted

### Idempotency

The script is **safe to run multiple times**:

- Running deploy script twice in a row (no code changes between runs)
  - First run: Pulls any available changes, builds if needed, restarts server
  - Second run: Git pull finds no new commits; detect finds no changes; exits with code 0 (no error) and server continues running
  - Expected behavior: Fast completion, no error

- Running deploy script after failed build
  - First run: Build fails, server not restarted, exit code 3
  - Fix the issue in source code and commit
  - Second run: Pull succeeds, build succeeds, server restarted, exit code 0
  - Expected behavior: Automatic recovery once issue is fixed

### Clean Failure Modes

All error states leave the system in a predictable, recoverable state:

1. **Pre-checks fail**: Nothing changed; user fixes issue and retries
2. **Pull fails**: Working directory unchanged (git didn't complete); user resolves and retries
3. **Build fails**: Source code not deployed; server still running previous version; user fixes and retries
4. **Restart fails**: Builds complete; server attempted restart; pm2 issue; user fixes pm2 and retries

## Output Examples by Scenario

### Scenario 1: Success - Both Projects Built

```
[14:32:15] Starting deployment...
[14:32:15] Checking pre-deployment requirements...
[14:32:15] ✓ Working directory is clean
[14:32:15] ✓ pm2 is installed and responsive
[14:32:15] ✓ Git remote is reachable
[14:32:15]
[14:32:15] Pulling latest changes from origin...
[14:32:18] ✓ Git pull completed (3 commits pulled)
[14:32:18]
[14:32:18] Detecting changed projects...
[14:32:19] Detected changes in: express web
[14:32:19]
[14:32:19] Building express/...
[14:32:35] ✓ express/ build completed successfully
[14:32:35]
[14:32:35] Building web/...
[14:32:52] ✓ web/ build completed successfully
[14:32:52]
[14:32:52] Restarting server...
[14:32:55] ✓ Server restarted successfully (PID: 12345)
[14:32:55]
[14:33:02] ✅ Deployment completed successfully in 47 seconds
```

**Exit code**: 0

### Scenario 2: Failure - Build Error

```
[14:32:15] Starting deployment...
[14:32:15] Checking pre-deployment requirements...
[14:32:15] ✓ Working directory is clean
[14:32:15] ✓ pm2 is installed and responsive
[14:32:15]
[14:32:15] Pulling latest changes from origin...
[14:32:18] ✓ Git pull completed (3 commits pulled)
[14:32:18]
[14:32:18] Detecting changed projects...
[14:32:19] Detected changes in: express
[14:32:19]
[14:32:19] Building express/...
[14:32:45] ❌ Error: express/ build failed

[Error details from npm follow]
... [npm compilation errors] ...

[14:32:45] Build failed. Server NOT restarted.
[14:32:45] ❌ Deployment failed (exit code: 3)
```

**Exit code**: 3

## Integration Points

### CI/CD Pipeline Integration

```bash
# Check if deployment succeeded
./deploy.sh
if [ $? -eq 0 ]; then
  echo "✅ Deploy succeeded"
  # Send success notification
else
  echo "❌ Deploy failed"
  # Send failure alert
fi
```

### Monitoring & Alerting

- Exit code 0 = success; no alert needed
- Exit code 1-4 = failure; trigger incident alert
- Exit code 2-3 = likely recoverable; escalate to on-call developer
- Exit code 4 = server-side issue; escalate immediately

### Logging & Audit

All output can be captured for audit:

```bash
./deploy.sh | tee deploy-$(date +%Y%m%d-%H%M%S).log
```

The log file will contain:

- Exact timestamp of each phase
- Which projects were detected as changed
- Which builds ran and how long they took
- Final success/failure status
- Deployment duration

## Non-Functional Guarantees

### Performance

- **Pre-checks**: < 1 second
- **Git pull**: Typically 1-3 seconds (varies with network/repo size)
- **Change detection**: < 1 second
- **Build time**: Depends on project (typically 15-30 seconds each)
- **Server restart**: 2-5 seconds
- **Total**: Target < 5 minutes (as per spec requirement)

### Robustness

- Script tolerates:
  - Up to 2 minutes of build time without timing out
  - Git pull with slow network (up to 30 second timeout)
  - Transient pm2 responsiveness issues
- Script does NOT tolerate:
  - Dirty working directory (caught in pre-checks)
  - Missing build scripts in package.json
  - Process crashes immediately after pm2 start (< 10s)

### Observability

Every run produces timestamped output that can be:

- Printed to console in real-time
- Captured to log file
- Parsed by CI/CD systems for status
- Searched for debugging failed deployments
