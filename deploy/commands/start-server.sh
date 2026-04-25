#!/bin/bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log_phase "Starting Server"

if ! pm2 start "${REPO_ROOT}/express/dist/src/server.js" \
    --name "plotter-server" \
    --instances 1 \
    --max-restarts 10 \
    --min-uptime 10s \
    --watch false >/dev/null 2>&1; then
    log_error "Server start failed"
    exit "${EXIT_RESTART_FAILED}"
fi

log_success "Server started successfully"
exit "${EXIT_SUCCESS}"
