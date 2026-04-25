# Implementation Tasks: Deploy Script Automation

**Branch**: `047-deploy-script-automation`  
**Feature**: Deploy Script Automation  
**Created**: April 24, 2026  
**Status**: Ready for Implementation

## Overview

This tasks list breaks down the implementation of the deploy.sh script into actionable, dependency-ordered tasks. Tasks are organized by user story to enable independent implementation and testing.

## Phase 1: Setup & Infrastructure

### Project Structure & Prerequisites

- [ ] T001 Create directory structure at repository root: `mkdir -p deploy/lib` in `/Users/daniel/git/plotter/`
- [ ] T002 [P] Create `deploy.sh` skeleton script at `/Users/daniel/git/plotter/deploy.sh` with shebang, error handling, and repo root detection
- [ ] T003 [P] Validate prerequisites in system: git, npm, and pm2 installed with version checks
- [ ] T004 Create helper library structure: `/Users/daniel/git/plotter/deploy/lib/colors.sh` for terminal colors
- [ ] T005 [P] Create logging utility in `/Users/daniel/git/plotter/deploy/lib/logging.sh` with timestamped output functions
- [ ] T006 [P] Create git utility in `/Users/daniel/git/plotter/deploy/lib/git.sh` for change detection and status checks
- [ ] T007 Make `deploy.sh` executable with `chmod +x /Users/daniel/git/plotter/deploy.sh`

---

## Phase 2: Foundational (Blocking Prerequisites)

### Utility Functions & Error Handling

- [ ] T008 [P] Implement error handling function in `/Users/daniel/git/plotter/deploy/lib/logging.sh`: `log_error()` with exit code support
- [ ] T009 [P] Implement success logging function in `/Users/daniel/git/plotter/deploy/lib/logging.sh`: `log_success()`
- [ ] T010 [P] Implement phase header function in `/Users/daniel/git/plotter/deploy/lib/logging.sh`: `log_phase()`
- [ ] T011 Implement terminal color codes in `/Users/daniel/git/plotter/deploy/lib/colors.sh`: GREEN, RED, YELLOW, BLUE, RESET constants
- [ ] T012 [P] Create exit code constants and documentation in main `deploy.sh` (0=success, 1=pre-check failed, 2=git failed, 3=build failed, 4=restart failed)
- [ ] T013 [P] Implement pre-deployment validation function in `deploy.sh`: check working directory clean, pm2 available, git reachable

### Git Utilities

- [ ] T014 [P] Implement `capture_before_commit()` in `/Users/daniel/git/plotter/deploy/lib/git.sh` to record HEAD before pull
- [ ] T015 [P] Implement `git_pull_origin()` in `/Users/daniel/git/plotter/deploy/lib/git.sh` with error handling
- [ ] T016 [P] Implement `detect_changed_projects()` in `/Users/daniel/git/plotter/deploy/lib/git.sh` using `git diff-index` for web/ and express/
- [ ] T017 [P] Add `check_working_directory_clean()` in `/Users/daniel/git/plotter/deploy/lib/git.sh` using `git status --porcelain`
- [ ] T018 [P] Add `check_git_remote_reachable()` in `/Users/daniel/git/plotter/deploy/lib/git.sh` for network validation

---

## Phase 3: User Story 1 - Quick Deploy with Single Command (Priority: P1)

### Core Deployment Flow

- [ ] T019 [US1] Implement main deployment loop in `/Users/daniel/git/plotter/deploy.sh` orchestrating phases in sequence
- [ ] T020 [US1] Implement git pull phase in `deploy.sh`: call `git_pull_origin()` from git utility with error handling
- [ ] T021 [US1] Implement change detection phase in `deploy.sh`: call `detect_changed_projects()` and store results
- [ ] T022 [US1] [P] Implement conditional build phase in `deploy.sh`: iterate over changed projects and run `npm run build` for each
- [ ] T023 [US1] Implement build execution in `deploy.sh` for web/ project: `cd web && npm run build` with error capture
- [ ] T024 [US1] Implement build execution in `deploy.sh` for express/ project: `cd express && npm run build` with error capture
- [ ] T025 [US1] Implement server restart phase in `deploy.sh`: pm2 stop all, pm2 delete all, then pm2 start
- [ ] T026 [US1] Configure pm2 start command in `deploy.sh` for `express/dist/src/server.js` with name "plotter-server"
- [ ] T027 [US1] Configure pm2 flags in `deploy.sh`: `--instances 1 --max-restarts 10 --min-uptime 10s`
- [ ] T028 [US1] Implement deployment completion summary in `deploy.sh`: calculate and display total execution time
- [ ] T029 [US1] Test core deployment flow with manual verification: git pull succeeds, changed projects detected, builds run, server restarts

---

## Phase 4: User Story 2 - Monitor Deployment Progress (Priority: P2)

### Status Output & Logging

- [ ] T030 [US2] Add initialization message in `deploy.sh`: "[HH:MM:SS] Starting deployment..."
- [ ] T031 [US2] Add pre-checks phase header in `deploy.sh`: log_phase "Pre-Deployment Checks"
- [ ] T032 [US2] Add git pull phase header in `deploy.sh`: log_phase "Pulling Latest Changes"
- [ ] T033 [US2] Add change detection status in `deploy.sh`: display which projects have changes or "No changes detected"
- [ ] T034 [US2] Add build phase headers in `deploy.sh`: log progress for each project being built (web/ and express/)
- [ ] T035 [US2] Add build completion messages in `deploy.sh`: log success with build duration for each project
- [ ] T036 [US2] Add server restart phase header in `deploy.sh`: log_phase "Restarting Server"
- [ ] T037 [US2] Add server restart success message in `deploy.sh`: display new process PID and status
- [ ] T038 [US2] Add final summary message in `deploy.sh`: "[HH:MM:SS] ✅ Deployment completed successfully in X minutes Y seconds"
- [ ] T039 [US2] Implement `calculate_duration()` in `/Users/daniel/git/plotter/deploy/lib/logging.sh` to format elapsed time
- [ ] T040 [US2] Test output formatting with manual run: verify all phase messages appear with timestamps, no garbled output

---

## Phase 5: User Story 3 - Graceful Error Handling (Priority: P3)

### Error Detection & Validation

- [ ] T041 [US3] Add working directory clean check in `deploy.sh`: abort with error code 1 if uncommitted changes found
- [ ] T042 [US3] Add pm2 availability check in `deploy.sh`: abort with error code 1 if pm2 not installed or daemon dead
- [ ] T043 [US3] Add git remote reachability check in `deploy.sh`: early warning or abort if origin unreachable
- [ ] T044 [US3] Implement git pull error handling in `deploy.sh`: capture stderr, display error message, exit code 2
- [ ] T045 [US3] Implement build error handling in `deploy.sh`: capture npm stderr, display error, exit code 3, skip server restart
- [ ] T046 [US3] Implement server restart error handling in `deploy.sh`: capture pm2 stderr, display error, exit code 4

### Error Messages & User Guidance

- [ ] T047 [US3] Create error message for dirty working directory in `deploy.sh`: include `git status` suggestion
- [ ] T048 [US3] Create error message for missing pm2 in `deploy.sh`: include `npm install -g pm2` suggestion
- [ ] T049 [US3] Create error message for git pull failure in `deploy.sh`: include git error and conflict resolution hints
- [ ] T050 [US3] Create error message for build failure in `deploy.sh`: include project name and build error details
- [ ] T051 [US3] Create error message for server restart failure in `deploy.sh`: include pm2 log location hint
- [ ] T052 [US3] Add edge case handling in `deploy.sh` for no changes detected: success message with early exit code 0
- [ ] T053 [US3] Test error handling with manual scenarios: dirty working directory, build failure, pm2 issues; verify correct exit codes and messages

---

## Phase 6: Polish & Cross-Cutting Concerns

### Code Quality & Validation

- [ ] T054 Run shellcheck validation on `deploy.sh`: fix any warnings or errors
- [ ] T055 Run shellcheck validation on `/Users/daniel/git/plotter/deploy/lib/*.sh`: fix any warnings
- [ ] T056 Add script header comments in `deploy.sh`: description, usage, requirements
- [ ] T057 [P] Add inline comments in main deployment loop in `deploy.sh` for clarity
- [ ] T058 [P] Add function documentation in `/Users/daniel/git/plotter/deploy/lib/git.sh` for all exported functions
- [ ] T059 [P] Add function documentation in `/Users/daniel/git/plotter/deploy/lib/logging.sh` for all exported functions

### Testing & Documentation

- [ ] T060 Create test scenario: successful deployment with changes in both projects; verify output and exit code 0
- [ ] T061 Create test scenario: no changes detected after pull; verify early exit and exit code 0
- [ ] T062 Create test scenario: build failure in express/; verify server not restarted and exit code 3
- [ ] T063 Create test scenario: git conflict on pull; verify error message and exit code 2
- [ ] T064 Create test scenario: uncommitted changes before deploy; verify pre-check catch and exit code 1
- [ ] T065 Create configuration example file at `/Users/daniel/git/plotter/deploy/config.example.sh` for future extensibility (projects list, build commands)
- [ ] T066 Verify script works from any directory: test `./deploy.sh` from repo root, /tmp, and other directories
- [ ] T067 Verify pm2 process monitoring works: after deploy, check `pm2 list` shows "plotter-server" running

### Documentation & Examples

- [ ] T068 Create usage documentation in repository root (optional README for deploy.sh): basic usage and common commands
- [ ] T069 Verify quickstart.md is accurate: test all scenarios match actual script behavior
- [ ] T070 Test integration with CI/CD: verify exit codes work correctly in shell conditionals
- [ ] T071 Document pm2 management commands: how to check logs, restart, stop server post-deployment

---

## Dependencies & Execution Strategy

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1 - Core Deploy) ← US1 fully testable after this phase
    ↓
Phase 4 (US2 - Progress Monitoring) ← US2 fully testable after this phase
    ↓
Phase 5 (US3 - Error Handling) ← US3 fully testable after this phase
    ↓
Phase 6 (Polish)
```

### Parallel Opportunities

**Within Phase 1**: T001-T007 are independent (create different files)

- T001 and T002 can be done together (structure + skeleton)
- T003-T006 can be done in parallel (all creating different files)

**Within Phase 2**: Most tasks are independent

- T008-T013 can be done in parallel (different utility functions)
- T014-T018 can be done in parallel (different git utilities)

**Within Phase 3**: T023-T024 (web vs express builds) can be done in parallel

- Both build implementations are similar but independent

**Within Phase 4**: T030-T039 can be partially parallelized

- Different phase headers (T030-T037) are independent
- Duration calculation (T039) needed before testing (T040)

**Within Phase 6**: T054-T059 can be done in parallel (different code quality checks)

### Independent Test Criteria

**After Phase 1**: Directory structure exists, script skeleton created
**After Phase 2**: All utilities implemented and testable in isolation
**After Phase 3** (MVP Complete - US1):

- ✅ Can run `./deploy.sh` successfully with clean repo
- ✅ Pulls latest changes
- ✅ Detects changed projects
- ✅ Builds changed projects
- ✅ Restarts server
- ✅ Exits with code 0 on success
- ✅ Can be invoked from any directory

**After Phase 4** (US2):

- ✅ All MVP features from Phase 3
- ✅ Timestamped status output for all phases
- ✅ Clear progress indicators
- ✅ Deployment time displayed at end

**After Phase 5** (US3):

- ✅ All Phase 4 features
- ✅ Pre-deployment validation blocks bad states
- ✅ Each failure mode exits with correct code
- ✅ Error messages include helpful guidance
- ✅ No partial deployments (fail-fast)

**After Phase 6** (Complete):

- ✅ Code passes shellcheck
- ✅ All edge cases tested
- ✅ Works from any directory
- ✅ Documentation matches behavior
- ✅ Ready for production use

---

## Success Criteria Mapping

| Success Criterion                 | Implemented By                  | Verified By                       |
| --------------------------------- | ------------------------------- | --------------------------------- |
| SC-001: Deploy cycle < 5 min      | T022-T027 (build orchestration) | T060-T062 (timing tests)          |
| SC-002: 99% success rate          | T041-T053 (error handling)      | T053, T061-T065 (error scenarios) |
| SC-003: Clear error messages      | T047-T051 (error messages)      | T062-T065 (error scenario tests)  |
| SC-004: Ordered phase execution   | T019 (main loop)                | T060-T062 (sequence tests)        |
| SC-005: Abstraction of complexity | T056 (documentation)            | T071 (user guidance)              |

---

## Estimates & Scheduling

**Total Tasks**: 71  
**Estimated Duration**:

- Phase 1 (Setup): 30 mins
- Phase 2 (Foundational): 1-2 hours
- Phase 3 (US1 - Core): 2-3 hours
- Phase 4 (US2 - Progress): 1-1.5 hours
- Phase 5 (US3 - Error): 1.5-2 hours
- Phase 6 (Polish): 1-1.5 hours
- **Total**: ~8-12 hours for complete implementation

**Recommended Schedule**:

- Day 1: Phases 1-2 (foundational setup)
- Day 1-2: Phase 3 (MVP core functionality)
- Day 2: Phase 4-5 (polish features and error handling)
- Day 2-3: Phase 6 (testing and refinement)
