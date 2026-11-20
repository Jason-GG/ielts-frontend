#!/usr/bin/env bash
# ==============================================================================
# Implementation & Deployment Script for ielts-frontend
# Target Host: root@101.37.105.86 (Port 5173 -> Proxy /api & /static to :8001)
# Usage:
#   ./deploy.sh                  # Auto: deploy to SSH_TARGET if off-box, or setup locally if on-box
#   ./deploy.sh remote [host]    # Sync code & implement on remote SSH host (default: root@101.37.105.86)
#   ./deploy.sh local            # Install Node.js 22 LTS, npm install & build, systemd start & verify
#   ./deploy.sh start|stop|restart|status|health|logs|test
# ==============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ielts-frontend"
SERVICE_NAME="ielts-frontend"
SSH_TARGET="${SSH_TARGET:-root@101.37.105.86}"
TARGET_IP="${TARGET_IP:-101.37.105.86}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/data/projects/iels-platform-project}"
REMOTE_PROJECT_DIR="${REMOTE_BASE_DIR}/${PROJECT_NAME}"
SERVICE_PORT="${SERVICE_PORT:-5173}"
BACKEND_URL="${VITE_BACKEND_URL:-http://127.0.0.1:8001}"
FRONTEND_MODE="${FRONTEND_MODE:-preview}"
NODE_VERSION="${NODE_VERSION:-v22.14.0}"

export PATH="/usr/local/node/bin:/usr/local/bin:$PATH"

log() {
    printf '[%s] [%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$PROJECT_NAME" "$*"
}

is_on_target_host() {
    if [ "$(hostname 2>/dev/null || true)" = "long-you-project" ]; then
        return 0
    fi
    if hostname -I 2>/dev/null | grep -qw "$TARGET_IP"; then
        return 0
    fi
    return 1
}

ensure_node_22() {
    local need_install=1
    if command -v node >/dev/null 2>&1; then
        local major
        major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
        if [ "$major" -ge 22 ]; then
            need_install=0
        fi
    fi

    if [ "$need_install" -eq 1 ]; then
        log "Installing Node.js ${NODE_VERSION} LTS (linux-x64)..."
        if command -v dnf >/dev/null 2>&1; then
            command -v xz >/dev/null 2>&1 || dnf install -y xz tar >/dev/null
        fi
        local tmp_tar="/tmp/node-${NODE_VERSION}-linux-x64.tar.xz"
        curl -fSL --connect-timeout 15 \
            "https://npmmirror.com/mirrors/node/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" \
            -o "$tmp_tar" \
        || curl -fSL --connect-timeout 15 \
            "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" \
            -o "$tmp_tar"

        rm -rf /usr/local/node
        mkdir -p /usr/local/node
        tar -xJf "$tmp_tar" -C /usr/local/node --strip-components=1
        rm -f "$tmp_tar"
        ln -sf /usr/local/node/bin/node /usr/local/bin/node
        ln -sf /usr/local/node/bin/npm /usr/local/bin/npm
        ln -sf /usr/local/node/bin/npx /usr/local/bin/npx
        export PATH="/usr/local/node/bin:/usr/local/bin:$PATH"
    fi
    log "Using Node $(node -v) / npm $(npm -v)"
}

build_frontend() {
    cd "$PROJECT_DIR"
    log "Installing npm dependencies..."
    npm install --no-audit --no-fund --registry=https://registry.npmmirror.com \
        || npm install --no-audit --no-fund

    log "Building production TypeScript + Vite bundle..."
    NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}" npm run build
}

configure_local_env() {
    local env_file="$PROJECT_DIR/.env"
    cat > "$env_file" <<EOF
HOST=0.0.0.0
PORT=${SERVICE_PORT}
VITE_BACKEND_URL=${BACKEND_URL}
FRONTEND_MODE=${FRONTEND_MODE}
EOF
    chmod 600 "$env_file"
    log "Configured .env (PORT=${SERVICE_PORT}, VITE_BACKEND_URL=${BACKEND_URL}, FRONTEND_MODE=${FRONTEND_MODE})"
}

install_systemd_service() {
    local unit_path="/etc/systemd/system/${SERVICE_NAME}.service"
    log "Installing systemd service ${unit_path} (port ${SERVICE_PORT})..."
    cat > "$unit_path" <<EOF
[Unit]
Description=IELTS Study Platform Frontend (${PROJECT_NAME})
After=network.target ielts-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=${PROJECT_DIR}
Environment="PATH=/usr/local/node/bin:/usr/local/bin:/usr/bin:/bin"
Environment="PORT=${SERVICE_PORT}"
Environment="VITE_BACKEND_URL=${BACKEND_URL}"
Environment="FRONTEND_MODE=${FRONTEND_MODE}"
ExecStart=${PROJECT_DIR}/start.sh
Restart=always
RestartSec=3
StandardOutput=append:${PROJECT_DIR}/ielts_frontend.log
StandardError=append:${PROJECT_DIR}/ielts_frontend.log

[Install]
WantedBy=multi-user.target
EOF
    chmod +x "$PROJECT_DIR/start.sh"
    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}.service" >/dev/null
    systemctl restart "${SERVICE_NAME}.service"
}

check_health() {
    local port="${SERVICE_PORT}"
    log "Waiting for ${PROJECT_NAME} on http://127.0.0.1:${port}/ ..."
    local attempt=0
    until curl -fsS "http://127.0.0.1:${port}/" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge 25 ]; then
            log "ERROR: Frontend failed to respond on port ${port}. Recent logs:"
            tail -n 40 "$PROJECT_DIR/ielts_frontend.log" 2>/dev/null || journalctl -u "${SERVICE_NAME}.service" -n 40 --no-pager
            exit 1
        fi
        sleep 1
    done

    if curl -fsS "${BACKEND_URL}/api/health" >/dev/null 2>&1; then
        log "Backend detected at ${BACKEND_URL}; running full frontend-backend proxy contract suite..."
        FRONTEND_URL="http://127.0.0.1:${port}" npm test
    else
        log "Frontend HTML reachable on http://127.0.0.1:${port}/ (backend ${BACKEND_URL} not yet up; skipping proxy test)."
    fi
}

run_local_setup() {
    cd "$PROJECT_DIR"
    ensure_node_22
    build_frontend
    configure_local_env
    install_systemd_service
    check_health
    log "Local implementation complete for ${PROJECT_NAME} on port ${SERVICE_PORT}."
}

run_remote_deploy() {
    local target="${1:-$SSH_TARGET}"
    log "Deploying ${PROJECT_NAME} to ${target}:${REMOTE_PROJECT_DIR} (port ${SERVICE_PORT})..."

    ssh -o BatchMode=yes "$target" "mkdir -p '$REMOTE_PROJECT_DIR'"

    if command -v rsync >/dev/null 2>&1; then
        rsync -az --delete \
            --exclude='node_modules/' \
            --exclude='dist/' \
            --exclude='*.log' \
            --exclude='*.pid' \
            --exclude='.env' \
            "$PROJECT_DIR/" "${target}:${REMOTE_PROJECT_DIR}/"
    else
        tar -C "$PROJECT_DIR" \
            --exclude='node_modules' \
            --exclude='dist' \
            --exclude='*.log' \
            --exclude='*.pid' \
            --exclude='.env' \
            -czf - . | ssh -o BatchMode=yes "$target" "tar -xzf - -C '$REMOTE_PROJECT_DIR'"
    fi

    ssh -o BatchMode=yes "$target" "chmod +x '${REMOTE_PROJECT_DIR}/deploy.sh' '${REMOTE_PROJECT_DIR}/start.sh' && SERVICE_PORT='${SERVICE_PORT}' VITE_BACKEND_URL='${BACKEND_URL}' FRONTEND_MODE='${FRONTEND_MODE}' '${REMOTE_PROJECT_DIR}/deploy.sh' local"
    log "Remote deployment to ${target} succeeded."
}

ACTION="${1:-auto}"
case "$ACTION" in
    auto)
        if is_on_target_host; then
            run_local_setup
        else
            run_remote_deploy "$SSH_TARGET"
        fi
        ;;
    remote|--remote)
        run_remote_deploy "${2:-$SSH_TARGET}"
        ;;
    local|--local|setup)
        run_local_setup
        ;;
    test)
        FRONTEND_URL="http://127.0.0.1:${SERVICE_PORT}" npm test
        ;;
    start)
        systemctl start "${SERVICE_NAME}.service" && check_health
        ;;
    stop)
        systemctl stop "${SERVICE_NAME}.service" || "$PROJECT_DIR/start.sh" stop
        ;;
    restart)
        systemctl restart "${SERVICE_NAME}.service" && check_health
        ;;
    status)
        systemctl status "${SERVICE_NAME}.service" --no-pager
        ;;
    health)
        check_health
        ;;
    logs)
        tail -n 60 "$PROJECT_DIR/ielts_frontend.log" 2>/dev/null || journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager
        ;;
    *)
        echo "Usage: $0 [auto|remote [user@host]|local|setup|test|start|stop|restart|status|health|logs]" >&2
        exit 1
        ;;
esac
