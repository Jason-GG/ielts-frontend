#!/usr/bin/env bash
# ==============================================================================
# Git-Driven Implementation Script for ielts-frontend
# Target Host: root@101.37.105.86 (/data/projects/iels-platform-project/ielts-frontend)
# Repository : git@github.com:Jason-GG/ielts-frontend.git (branch: main)
# Systemd    : ielts-frontend.service (Port 5173 -> Proxy /api & /static to :8001)
#
# Usage:
#   ./implementation.sh                  # Auto: SSH to 101.37.105.86 if off-box, or deploy locally if on-box
#   ./implementation.sh remote [host]    # Deploy latest GitHub code to remote SSH host
#   ./implementation.sh local            # Pull latest GitHub code, npm ci & build, restart systemd & verify
#   ./implementation.sh status|health|logs|restart|test
#
# Optional Environment Variables:
#   SSH_TARGET=root@101.37.105.86   BRANCH=main   SERVICE_PORT=5173
#   VITE_BACKEND_URL=http://127.0.0.1:8001        FRONTEND_MODE=preview
#   FORCE_RESET=0                   SKIP_TESTS=0
# ==============================================================================
set -euo pipefail

PROJECT_NAME="ielts-frontend"
SERVICE_NAME="ielts-frontend"
REPO_URL="${REPO_URL:-git@github.com:Jason-GG/ielts-frontend.git}"
BRANCH="${BRANCH:-main}"
SSH_TARGET="${SSH_TARGET:-root@101.37.105.86}"
TARGET_IP="${TARGET_IP:-101.37.105.86}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/data/projects/iels-platform-project}"
REMOTE_PROJECT_DIR="${REMOTE_PROJECT_DIR:-${REMOTE_BASE_DIR}/${PROJECT_NAME}}"
SERVICE_PORT="${SERVICE_PORT:-5173}"
BACKEND_URL="${VITE_BACKEND_URL:-http://127.0.0.1:8001}"
FRONTEND_MODE="${FRONTEND_MODE:-preview}"
NODE_VERSION="${NODE_VERSION:-v22.14.0}"
FORCE_RESET="${FORCE_RESET:-0}"
SKIP_TESTS="${SKIP_TESTS:-0}"

export PATH="/usr/local/node/bin:/usr/local/bin:$PATH"

SCRIPT_PATH="${BASH_SOURCE[0]:-}"
LOCAL_SCRIPT_DIR=""
if [ -n "$SCRIPT_PATH" ] && [ -f "$SCRIPT_PATH" ]; then
    LOCAL_SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
fi

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

sync_git_repo() {
    mkdir -p "$REMOTE_BASE_DIR"
    export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new}"

    if [ ! -d "$REMOTE_PROJECT_DIR/.git" ]; then
        log "Cloning ${REPO_URL} (branch ${BRANCH}) into ${REMOTE_PROJECT_DIR} ..."
        git clone --branch "$BRANCH" "$REPO_URL" "$REMOTE_PROJECT_DIR"
        local new_sha
        new_sha="$(git -C "$REMOTE_PROJECT_DIR" rev-parse --short HEAD)"
        log "Cloned commit: ${new_sha}"
        return 0
    fi

    cd "$REMOTE_PROJECT_DIR"
    local current_remote
    current_remote="$(git remote get-url origin 2>/dev/null || true)"
    if [ "$current_remote" != "$REPO_URL" ]; then
        log "Updating origin URL to ${REPO_URL}"
        git remote set-url origin "$REPO_URL"
    fi

    local old_sha
    old_sha="$(git rev-parse --short HEAD)"

    if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
        if [ "$FORCE_RESET" = "1" ]; then
            log "WARNING: Dirty tracked files detected; FORCE_RESET=1 will reset tracked files to origin/${BRANCH}."
        else
            log "ERROR: Dirty tracked files in ${REMOTE_PROJECT_DIR}. Commit/stash them or re-run with FORCE_RESET=1."
            git status --short --untracked-files=no
            exit 1
        fi
    fi

    log "Fetching latest code from origin/${BRANCH} ..."
    git fetch origin "$BRANCH"
    git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -B "$BRANCH" "origin/${BRANCH}"

    if [ "$FORCE_RESET" = "1" ]; then
        git reset --hard "origin/${BRANCH}"
    else
        git pull --ff-only origin "$BRANCH"
    fi

    local new_sha
    new_sha="$(git rev-parse --short HEAD)"
    log "Git synced: ${old_sha} -> ${new_sha} (branch ${BRANCH})"
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
    cd "$REMOTE_PROJECT_DIR"
    log "Installing npm dependencies..."
    if [ -f "$REMOTE_PROJECT_DIR/package-lock.json" ]; then
        npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com \
            || npm ci --no-audit --no-fund
    else
        npm install --no-audit --no-fund --registry=https://registry.npmmirror.com \
            || npm install --no-audit --no-fund
    fi

    log "Building production TypeScript + Vite bundle..."
    NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}" npm run build
}

ensure_env_file() {
    local env_file="$REMOTE_PROJECT_DIR/.env"
    if [ -f "$env_file" ]; then
        chmod 600 "$env_file"
        log "Verified existing ${env_file} (0600, preserved without overwrite)."
        return 0
    fi

    cat > "$env_file" <<EOF
HOST=0.0.0.0
PORT=${SERVICE_PORT}
VITE_BACKEND_URL=${BACKEND_URL}
FRONTEND_MODE=${FRONTEND_MODE}
EOF
    chmod 600 "$env_file"
    log "Created default ${env_file} (0600, PORT=${SERVICE_PORT}, VITE_BACKEND_URL=${BACKEND_URL})."
}

ensure_systemd_unit() {
    local unit_path="/etc/systemd/system/${SERVICE_NAME}.service"
    local tmp_unit
    tmp_unit="$(mktemp)"
    cat > "$tmp_unit" <<EOF
[Unit]
Description=IELTS Study Platform Frontend (${PROJECT_NAME})
After=network.target ielts-backend.service
Wants=ielts-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=${REMOTE_PROJECT_DIR}
EnvironmentFile=${REMOTE_PROJECT_DIR}/.env
Environment="PATH=/usr/local/node/bin:/usr/local/bin:/usr/bin:/bin"
Environment="HOST=0.0.0.0"
Environment="PORT=${SERVICE_PORT}"
Environment="VITE_BACKEND_URL=${BACKEND_URL}"
Environment="FRONTEND_MODE=${FRONTEND_MODE}"
ExecStart=${REMOTE_PROJECT_DIR}/node_modules/.bin/vite preview --host \${HOST} --port \${PORT} --strictPort
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    if [ ! -f "$unit_path" ] || ! cmp -s "$tmp_unit" "$unit_path"; then
        mv "$tmp_unit" "$unit_path"
        chmod 644 "$unit_path"
        log "Updated systemd unit ${unit_path}"
    else
        rm -f "$tmp_unit"
        log "Systemd unit ${unit_path} already up to date."
    fi

    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}.service" >/dev/null
    log "Restarting ${SERVICE_NAME}.service ..."
    systemctl restart "${SERVICE_NAME}.service"
}

resolve_port() {
    local port="${SERVICE_PORT}"
    if [ -f "$REMOTE_PROJECT_DIR/.env" ]; then
        local env_port
        env_port="$(grep -E '^PORT=' "$REMOTE_PROJECT_DIR/.env" | tail -n1 | cut -d= -f2 || true)"
        if [ -n "$env_port" ]; then
            port="$env_port"
        fi
    fi
    echo "$port"
}

check_health() {
    local port
    port="$(resolve_port)"
    log "Waiting for ${SERVICE_NAME} on http://127.0.0.1:${port}/ ..."
    local attempt=0
    until curl -fsS "http://127.0.0.1:${port}/" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge 30 ]; then
            log "ERROR: Frontend failed to respond on port ${port}. Recent journalctl logs:"
            journalctl -u "${SERVICE_NAME}.service" -n 40 --no-pager
            exit 1
        fi
        sleep 1
    done
    log "Frontend HTML reachable on http://127.0.0.1:${port}/"
}

run_tests() {
    local port
    port="$(resolve_port)"
    if curl -fsS "${BACKEND_URL}/api/health" >/dev/null 2>&1; then
        log "Backend detected at ${BACKEND_URL}; running frontend-backend proxy contract suite..."
        (
            cd "$REMOTE_PROJECT_DIR"
            FRONTEND_URL="http://127.0.0.1:${port}" npm test
        )
    else
        log "WARNING: Backend ${BACKEND_URL} not reachable; skipping proxy contract test suite."
    fi
}

run_local_implement() {
    sync_git_repo
    ensure_node_22
    build_frontend
    ensure_env_file
    ensure_systemd_unit
    check_health
    if [ "$SKIP_TESTS" != "1" ]; then
        run_tests
    else
        log "Skipping npm test (SKIP_TESTS=1)."
    fi
    log "Implementation complete for ${PROJECT_NAME} (${SERVICE_NAME}.service active on port ${SERVICE_PORT})."
}

warn_if_local_unpushed() {
    if [ -n "$LOCAL_SCRIPT_DIR" ] && [ -d "$LOCAL_SCRIPT_DIR/.git" ]; then
        if [ -n "$(git -C "$LOCAL_SCRIPT_DIR" status --porcelain --untracked-files=no)" ]; then
            log "WARNING: Local workspace has uncommitted changes; remote server pulls from GitHub origin/${BRANCH}."
        fi
        local local_head remote_head
        local_head="$(git -C "$LOCAL_SCRIPT_DIR" rev-parse HEAD 2>/dev/null || true)"
        remote_head="$(git -C "$LOCAL_SCRIPT_DIR" rev-parse "origin/${BRANCH}" 2>/dev/null || true)"
        if [ -n "$local_head" ] && [ -n "$remote_head" ] && [ "$local_head" != "$remote_head" ]; then
            log "WARNING: Local HEAD (${local_head:0:7}) differs from origin/${BRANCH} (${remote_head:0:7}). Push to GitHub first to deploy local commits."
        fi
    fi
}

run_remote_action() {
    local target="$1"
    local remote_action="$2"
    if [ -z "$SCRIPT_PATH" ] || [ ! -f "$SCRIPT_PATH" ]; then
        log "ERROR: Cannot forward to remote host because script path is unavailable."
        exit 1
    fi
    if [ "$remote_action" = "local" ]; then
        warn_if_local_unpushed
    fi
    log "Connecting via SSH to ${target} (action: ${remote_action}, branch: ${BRANCH}) ..."
    ssh -o BatchMode=yes -o ConnectTimeout=15 "$target" \
        "REPO_URL='${REPO_URL}' BRANCH='${BRANCH}' REMOTE_BASE_DIR='${REMOTE_BASE_DIR}' REMOTE_PROJECT_DIR='${REMOTE_PROJECT_DIR}' SERVICE_PORT='${SERVICE_PORT}' VITE_BACKEND_URL='${BACKEND_URL}' FRONTEND_MODE='${FRONTEND_MODE}' NODE_VERSION='${NODE_VERSION}' FORCE_RESET='${FORCE_RESET}' SKIP_TESTS='${SKIP_TESTS}' bash -s -- '${remote_action}'" \
        < "$SCRIPT_PATH"
}

ACTION="${1:-auto}"
case "$ACTION" in
    auto)
        if is_on_target_host; then
            run_local_implement
        else
            run_remote_action "$SSH_TARGET" "local"
        fi
        ;;
    remote|--remote)
        run_remote_action "${2:-$SSH_TARGET}" "local"
        ;;
    local|--local)
        run_local_implement
        ;;
    restart)
        if is_on_target_host; then
            systemctl restart "${SERVICE_NAME}.service" && check_health
        else
            run_remote_action "${2:-$SSH_TARGET}" "restart"
        fi
        ;;
    status)
        if is_on_target_host; then
            systemctl status "${SERVICE_NAME}.service" --no-pager
        else
            run_remote_action "${2:-$SSH_TARGET}" "status"
        fi
        ;;
    health)
        if is_on_target_host; then
            check_health
        else
            run_remote_action "${2:-$SSH_TARGET}" "health"
        fi
        ;;
    logs)
        if is_on_target_host; then
            journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager
        else
            run_remote_action "${2:-$SSH_TARGET}" "logs"
        fi
        ;;
    test)
        if is_on_target_host; then
            run_tests
        else
            run_remote_action "${2:-$SSH_TARGET}" "test"
        fi
        ;;
    *)
        echo "Usage: $0 [auto|remote [user@host]|local|restart|status|health|logs|test]" >&2
        exit 1
        ;;
esac
