#!/bin/bash

################################################################################
# deploy.sh - One-stop deployment automation script
#
# Automates the deployment process: git pull → detect changes → build → restart
# 
# Usage:
#   ./deploy.sh              # From repo root
#   /path/to/plotter/deploy.sh  # From any directory
#
# Requirements:
#   - git (for version control)
#   - npm (for project builds)
#   - pm2 (for process management)
#
# Exit Codes:
#   0 - Deployment successful
#   1 - Pre-deployment check failed (working directory, pm2, etc.)
#   2 - Git pull failed
#   3 - Build failed
#   4 - Server restart failed
#
################################################################################

set -e  # Exit on error

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_PRECHECK_FAILED=1
readonly EXIT_GIT_FAILED=2
readonly EXIT_BUILD_FAILED=3
readonly EXIT_RESTART_FAILED=4

# Detect repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${REPO_ROOT}/deploy"
LIB_DIR="${DEPLOY_DIR}/lib"

# Create log variables
START_TIME=$(date +%s)
START_TIME_FORMATTED=$(date '+%Y-%m-%d %H:%M:%S')

################################################################################
# Source helper libraries
################################################################################

if [[ ! -d "$LIB_DIR" ]]; then
    echo "❌ Error: Library directory not found at $LIB_DIR"
    exit "$EXIT_PRECHECK_FAILED"
fi

# Source colors first (before we define them as readonly)
if [[ -f "$LIB_DIR/colors.sh" ]]; then
    source "$LIB_DIR/colors.sh"
else
    # Fallback colors if file not available
    readonly GREEN='\033[0;32m'
    readonly RED='\033[0;31m'
    readonly YELLOW='\033[1;33m'
    readonly BLUE='\033[0;34m'
    readonly CYAN='\033[0;36m'
    readonly RESET='\033[0m'
fi

if [[ -f "$LIB_DIR/logging.sh" ]]; then
    source "$LIB_DIR/logging.sh"
fi

if [[ -f "$LIB_DIR/git.sh" ]]; then
    source "$LIB_DIR/git.sh"
fi

################################################################################
# Pre-Deployment Validation Functions
################################################################################

# Check if all prerequisites are available
check_prerequisites() {
    local all_ok=true
    
    log_phase "Pre-Deployment Checks"
    
    # Check git
    if ! command -v git &>/dev/null; then
        log_error "git is not installed"
        all_ok=false
    else
        log_success "git is installed"
    fi
    
    # Check npm
    if ! command -v npm &>/dev/null; then
        log_error "npm is not installed"
        all_ok=false
    else
        log_success "npm is installed"
    fi
    
    # Check pm2
    if ! command -v pm2 &>/dev/null; then
        log_error "pm2 is not installed. Install with: npm install -g pm2"
        all_ok=false
    else
        log_success "pm2 is installed"
    fi
    
    # Check if we're in a valid git repository
    if ! is_valid_git_repo; then
        log_error "Not in a valid git repository"
        all_ok=false
    else
        log_success "Valid git repository detected"
    fi
    
    # Check if working directory is clean
    if ! check_working_directory_clean; then
        log_error "Working directory has uncommitted changes. Please commit or stash them first."
        all_ok=false
    else
        log_success "Working directory is clean"
    fi
    
    log_info ""
    
    if [[ "$all_ok" == "false" ]]; then
        return 1
    fi
    return 0
}

################################################################################
# Fallback functions (used if libraries not yet implemented)
################################################################################

log_info() {
    local message="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo "[${timestamp}] ${message}"
}

log_success() {
    local message="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo -e "[${timestamp}] ${GREEN}✓${RESET} ${message}"
}

log_error() {
    local message="$1"
    local exit_code="${2:-1}"
    local timestamp=$(date '+%H:%M:%S')
    echo -e "[${timestamp}] ${RED}❌ Error: ${message}${RESET}" >&2
}

log_phase() {
    local phase_name="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo ""
    echo -e "[${timestamp}] ${BLUE}→${RESET} Phase: ${phase_name}"
}

log_detail() {
    local message="$1"
    local timestamp=$(date '+%H:%M:%S')
    echo -e "[${timestamp}] ${BLUE}→${RESET}  ${message}"
}

calculate_duration() {
    local start_seconds="$1"
    local end_seconds="$2"
    local duration=$((end_seconds - start_seconds))
    
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    if [[ $minutes -gt 0 ]]; then
        printf "%dm %ds" "$minutes" "$seconds"
    else
        printf "%ds" "$seconds"
    fi
}

log_summary() {
    local success="$1"
    local duration="$2"
    local timestamp=$(date '+%H:%M:%S')
    
    if [[ "$success" == "true" ]]; then
        echo ""
        echo -e "[${timestamp}] ${GREEN}✅ Deployment completed successfully in ${duration}${RESET}"
    else
        echo ""
        echo -e "[${timestamp}] ${RED}❌ Deployment failed${RESET}"
    fi
}

# Fallback git functions
is_valid_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

check_working_directory_clean() {
    local status_output
    status_output=$(git status --porcelain 2>&1)
    
    if [[ -n "$status_output" ]]; then
        return 1  # Not clean
    fi
    return 0  # Clean
}

capture_before_commit() {
    git rev-parse HEAD 2>/dev/null || echo "unknown"
}

git_pull_origin() {
    git pull origin 2>&1
}

detect_changed_projects() {
    local before_commit="$1"
    local after_commit="${2:-HEAD}"
    local repo_root="$3"
    
    local changed_projects=""
    local projects=("web" "express")
    
    for project in "${projects[@]}"; do
        if git diff-index --quiet "$before_commit" "$after_commit" -- "$repo_root/$project/" 2>/dev/null; then
            :
        else
            changed_projects="$changed_projects $project"
        fi
    done
    
    echo "$changed_projects" | xargs
}

################################################################################
# Deployment flow entry point
################################################################################

main() {
    local exit_code="$EXIT_SUCCESS"
    
    log_info "Starting deployment..."
    log_info "Repository root: $REPO_ROOT"
    log_info ""
    
    # Run pre-deployment checks
    if ! check_prerequisites; then
        log_error "Pre-deployment checks failed"
        return "$EXIT_PRECHECK_FAILED"
    fi
    
    # Phase 1: Git pull
    log_phase "Pulling Latest Changes from Origin"
    
    local before_commit
    before_commit=$(capture_before_commit)
    
    if ! git_pull_origin; then
        log_error "Git pull failed"
        return "$EXIT_GIT_FAILED"
    fi
    
    log_success "Git pull completed"
    log_info ""
    
    # Phase 2: Detect changed projects
    log_phase "Detecting Changed Projects"
    
    local after_commit
    after_commit=$(git rev-parse HEAD)
    
    local changed_projects
    changed_projects=$(detect_changed_projects "$before_commit" "$after_commit" "$REPO_ROOT")
    
    if [[ -z "$changed_projects" ]]; then
        log_info "No changes detected in web/ or express/"
        log_success "Deployment completed (nothing to deploy)"
        return "$EXIT_SUCCESS"
    fi
    
    log_success "Detected changes in: $changed_projects"
    log_info ""
    
    # Phase 3: Build projects
    log_phase "Building Changed Projects"
    
    for project in $changed_projects; do
        log_detail "Building $project/..."
        
        if ! (cd "$REPO_ROOT/$project" && npm run build); then
            log_error "$project/ build failed"
            return "$EXIT_BUILD_FAILED"
        fi
        
        log_success "$project/ build completed"
    done
    
    log_info ""
    
    # Phase 4: Restart server
    log_phase "Restarting Server"
    
    # Stop existing pm2 processes
    if pm2 stop all >/dev/null 2>&1; then
        pm2 delete all >/dev/null 2>&1
    fi
    
    # Start new server
    if ! pm2 start "$REPO_ROOT/express/dist/src/server.js" \
        --name "plotter-server" \
        --instances 1 \
        --max-restarts 10 \
        --min-uptime 10s \
        --watch false >/dev/null 2>&1; then
        log_error "Server restart failed"
        return "$EXIT_RESTART_FAILED"
    fi
    
    log_success "Server restarted successfully"
    
    # Calculate and display duration
    local end_time
    end_time=$(date +%s)
    local duration
    duration=$(calculate_duration "$START_TIME" "$end_time")
    
    log_info ""
    log_summary "true" "$duration"
    
    return "$EXIT_SUCCESS"
}

# Trap errors for cleanup
trap 'log_error "Deployment interrupted"; exit "$EXIT_PRECHECK_FAILED"' INT TERM

# Execute main
main "$@"
exit $?
