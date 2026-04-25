#!/bin/bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log_phase "Starting Server"

LOG_DIR="${REPO_ROOT}/deploy/logs"
START_LOG="${LOG_DIR}/start-server.log"
SERVER_OUT_LOG="${LOG_DIR}/plotter-server.out.log"
SERVER_ERR_LOG="${LOG_DIR}/plotter-server.err.log"

mkdir -p "${LOG_DIR}"

{
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting plotter-server via PM2"
    echo "Command: pm2 start ${REPO_ROOT}/express/dist/src/server.js --name plotter-server"
} >> "${START_LOG}"

if ! pm2 start "${REPO_ROOT}/express/dist/src/server.js" \
    --name "plotter-server" \
    --instances 1 \
    --max-restarts 10 \
    --watch false \
    --time \
    --output "${SERVER_OUT_LOG}" \
    --error "${SERVER_ERR_LOG}" >> "${START_LOG}" 2>&1; then
    log_error "Server start failed"
    log_info "PM2 start output log: ${START_LOG}"
    log_info "Server stdout log: ${SERVER_OUT_LOG}"
    log_info "Server stderr log: ${SERVER_ERR_LOG}"
    log_info "Last 40 lines of PM2 start output:"
    tail -n 40 "${START_LOG}" >&2 || true
    exit "${EXIT_RESTART_FAILED}"
fi

log_success "Server started successfully"
log_info "PM2 start output log: ${START_LOG}"
log_info "Server stdout log: ${SERVER_OUT_LOG}"
log_info "Server stderr log: ${SERVER_ERR_LOG}"
exit "${EXIT_SUCCESS}"
