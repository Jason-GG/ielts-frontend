#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

export PATH="/usr/local/node/bin:/usr/local/bin:$PATH"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$PROJECT_DIR/.env"
    set +a
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-5173}"
FRONTEND_MODE="${FRONTEND_MODE:-dev}"
VITE_BIN="$PROJECT_DIR/node_modules/.bin/vite"

run_vite() {
    if [ "$FRONTEND_MODE" = "preview" ] && [ -f "$PROJECT_DIR/dist/index.html" ]; then
        exec "$VITE_BIN" preview --host "$HOST" --port "$PORT" --strictPort
    else
        exec "$VITE_BIN" --host "$HOST" --port "$PORT" --strictPort
    fi
}

case "${1:-}" in
    daemon|-d|--daemon)
        LOG_FILE="$PROJECT_DIR/ielts_frontend.log"
        PID_FILE="$PROJECT_DIR/ielts_frontend.pid"
        echo "Starting IELTS Frontend (${FRONTEND_MODE}) in background on ${HOST}:${PORT}..."
        if [ "$FRONTEND_MODE" = "preview" ] && [ -f "$PROJECT_DIR/dist/index.html" ]; then
            nohup "$VITE_BIN" preview --host "$HOST" --port "$PORT" --strictPort >> "$LOG_FILE" 2>&1 &
        else
            nohup "$VITE_BIN" --host "$HOST" --port "$PORT" --strictPort >> "$LOG_FILE" 2>&1 &
        fi
        echo $! > "$PID_FILE"
        echo "Started with PID $(cat "$PID_FILE"). Logs: $LOG_FILE"
        ;;
    preview)
        FRONTEND_MODE="preview"
        echo "Starting IELTS Frontend preview server on http://${HOST}:${PORT} ..."
        run_vite
        ;;
    stop)
        PID_FILE="$PROJECT_DIR/ielts_frontend.pid"
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            kill "$(cat "$PID_FILE")"
            rm -f "$PID_FILE"
            echo "Stopped ielts-frontend server."
        else
            pkill -f "vite.*--port ${PORT}" || true
            echo "Stopped any running ielts-frontend process on port ${PORT}."
        fi
        ;;
    *)
        echo "Starting IELTS Frontend (${FRONTEND_MODE}) on http://${HOST}:${PORT} ..."
        run_vite
        ;;
esac
