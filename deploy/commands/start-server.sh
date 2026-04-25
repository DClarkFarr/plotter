#!/bin/bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log_phase "Starting Server"

LOG_DIR="${REPO_ROOT}/deploy/logs"
RUN_TIMESTAMP="$(date '+%Y-%m-%d-%H%M%S')-$$"
RUN_LOG="${LOG_DIR}/${RUN_TIMESTAMP}-plotter-server.log"

mkdir -p "${LOG_DIR}"
: > "${RUN_LOG}"

{
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting plotter-server via PM2"
    echo "Log file: ${RUN_LOG}"
    echo "Command: pm2 start ${REPO_ROOT}/deploy/commands/run-server.sh --name plotter-server"
} >> "${RUN_LOG}"

if ! RUN_LOG_FILE="${RUN_LOG}" pm2 start "${REPO_ROOT}/deploy/commands/run-server.sh" \
    --name "plotter-server" \
    --instances 1 \
    --max-restarts 10 \
    --watch false \
    --time \
    --merge-logs \
    --output "${RUN_LOG}" \
    --error "${RUN_LOG}" >> "${RUN_LOG}" 2>&1; then
    log_error "Server start failed"
    log_info "Server log file: ${RUN_LOG}"
    log_info "Last 80 lines of the server log:"
    tail -n 80 "${RUN_LOG}" >&2 || true
    exit "${EXIT_RESTART_FAILED}"
fi

log_success "Server started successfully"
log_info "Server log file: ${RUN_LOG}"
exit "${EXIT_SUCCESS}"
