# Quick Start: Deploy Script Automation

**Branch**: `047-deploy-script-automation` | **Date**: April 24, 2026

## Overview

The `deploy.sh` script automates the complete deployment process: pulling latest code, building changed projects, and restarting the server.

## Prerequisites

Before using the deploy script, ensure the following are installed on your system:

- **Git**: For pulling changes from the repository
- **Node.js & npm**: For building the web and express projects
- **pm2**: Global npm package for process management

```bash
# Install pm2 (one-time setup)
npm install -g pm2
```

## Basic Usage

### Running the Deploy Script

From the repository root:

```bash
./deploy.sh
```

Or from any directory:

```bash
/path/to/plotter/deploy.sh
```

## What the Script Does

The script executes the following steps in order:

1. **Pre-Deployment Checks**
   - Verifies working directory is clean (no uncommitted changes)
   - Checks that pm2 is installed and running
   - Validates git remote is reachable

2. **Pull Latest Changes**

   ```bash
   git pull origin
   ```

3. **Detect Changed Projects**
   - Uses git to identify which projects (web/ and/or express/) have file changes
   - Skips unchanged projects to save time

4. **Build Changed Projects**
   - Runs `npm run build` in each changed project directory
   - Waits for all builds to complete

5. **Restart Server**
   - Stops any running pm2 processes
   - Starts the server in forever mode with automatic restart on crash

## Output Example

```
[14:32:15] Starting deployment...
[14:32:15] Checking pre-deployment requirements...
[14:32:15] ✓ Working directory is clean
[14:32:15] ✓ pm2 is installed and responsive
[14:32:15] ✓ Git remote is reachable
[14:32:15]
[14:32:15] Phase 1: Pulling latest changes...
[14:32:18] ✓ Git pull completed (3 commits pulled)
[14:32:18]
[14:32:18] Phase 2: Detecting changed projects...
[14:32:19] Detected changes in: express web
[14:32:19]
[14:32:19] Phase 3: Building express/...
[14:32:35] ✓ express/ build completed successfully
[14:32:35]
[14:32:35] Phase 4: Building web/...
[14:32:52] ✓ web/ build completed successfully
[14:32:52]
[14:32:52] Phase 5: Restarting server...
[14:32:55] ✓ Server stopped and restarted successfully (PID: 12345)
[14:32:55]
[14:33:02] ✅ Deployment completed successfully in 47 seconds
```

## Scenarios

### Scenario 1: Successful Deployment (Both Projects Changed)

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
...
[14:33:02] ✅ Deployment completed successfully in 47 seconds
```

**What happened**: Both web/ and express/ were rebuilt, and the server restarted.

### Scenario 2: No Changes Detected

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
...
[14:32:19] No changes detected in web/ or express/
[14:32:19] ✅ Deployment completed successfully (nothing to deploy) in 4 seconds
```

**What happened**: Git pull succeeded, but no file changes were found in web/ or express/. Server remained running.

### Scenario 3: Uncommitted Changes (Deployment Aborted)

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
[14:32:15] Checking pre-deployment requirements...
[14:32:15] ❌ Error: Working directory has uncommitted changes
Please commit or stash your changes before deploying:
  git status                    # See what has changed
  git add .                     # Stage changes
  git commit -m "Your message"  # Commit changes
  git stash                     # Or stash temporarily

[14:32:15] Deployment aborted.
```

**What to do**: Commit or stash your changes, then run `./deploy.sh` again.

### Scenario 4: Build Failure (Server Not Restarted)

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
...
[14:32:35] Phase 3: Building express/...
[14:32:41] ❌ Error: express/ build failed
See full error above. Common fixes:
  - Check for TypeScript errors: cd express && npm run build
  - Verify package.json dependencies are installed: cd express && npm install
  - Check git diff: git diff HEAD~1..HEAD express/

[14:32:41] Deployment aborted. Server was NOT restarted.
```

**What to do**: Fix the build error, commit the fix, and run `./deploy.sh` again.

### Scenario 5: Git Pull Conflict

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
...
[14:32:18] ❌ Error: Git pull failed
Conflict at src/services/PlotService.ts

Manual resolution required:
  1. Resolve conflicts in your working directory: git status
  2. Then run: git add [files] && git commit -m "Resolved merge conflicts"
  3. Finally run: ./deploy.sh again

[14:32:18] Deployment aborted.
```

**What to do**: Resolve the merge conflict manually, commit the resolution, and run `./deploy.sh` again.

### Scenario 6: pm2 Not Installed

```bash
$ ./deploy.sh
[14:32:15] Starting deployment...
[14:32:15] Checking pre-deployment requirements...
[14:32:15] ❌ Error: pm2 is not installed

Install pm2 with:
  npm install -g pm2

Then run: ./deploy.sh

[14:32:15] Deployment aborted.
```

**What to do**: Install pm2 globally and run `./deploy.sh` again.

## Checking Deployment Status

After successful deployment, check that the server is running:

```bash
# List running pm2 processes
pm2 list

# View server logs
pm2 logs plotter-server

# Stop the server (if needed)
pm2 stop plotter-server

# Restart manually
pm2 restart plotter-server

# Remove from pm2 (if needed)
pm2 delete plotter-server
```

## Troubleshooting

### Build Takes Too Long

If a build takes more than a couple of minutes, check:

```bash
# Check which file changes triggered the build
git diff HEAD~1..HEAD express/ web/

# Manually test the build
cd express && npm run build
cd ../web && npm run build
```

### Server Crashes After Restart

Check pm2 logs:

```bash
pm2 logs plotter-server

# If process keeps crashing, check the server startup
node express/dist/src/server.js
```

### Previous Deployment Still Running

If the script warns that processes are already running:

```bash
# Force cleanup
pm2 delete all
pm2 kill

# Then run deploy again
./deploy.sh
```

### Undo Last Deployment

If the deployment was bad and you need to revert:

```bash
# Revert changes
git reset --hard HEAD~1

# Redeploy
./deploy.sh
```

## Advanced: Integrating with CI/CD

The deploy script's exit codes make it suitable for CI/CD pipelines:

```bash
#!/bin/bash
# Example: deploy-from-ci.sh

/path/to/plotter/deploy.sh
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Deployment successful"
  # Send notification to team
else
  echo "❌ Deployment failed (exit code: $EXIT_CODE)"
  # Send alert to on-call engineer
  exit 1
fi
```

## Exit Codes

The script uses standard exit codes:

| Exit Code | Meaning                     | Action Required                                     |
| --------- | --------------------------- | --------------------------------------------------- |
| 0         | Deployment successful       | None; deployment complete                           |
| 1         | Pre-deployment check failed | Fix the reported issue (git, pm2, etc.) and retry   |
| 2         | Git pull failed             | Resolve merge conflicts or network issues and retry |
| 3         | Build failed                | Fix the source code error and retry                 |
| 4         | Server restart failed       | Check pm2 logs and fix the issue                    |

## Getting Help

If you encounter issues not covered here:

1. **Check the full error message** in the deploy script output
2. **Review logs** with: `pm2 logs plotter-server`
3. **Manual verification** of individual steps:
   - `git pull origin`
   - `cd express && npm run build`
   - `cd ../web && npm run build`
   - `pm2 list` (check running processes)
