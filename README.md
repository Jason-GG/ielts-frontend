# IELTS Study Platform Frontend (`ielts-frontend`)

React 19 + TypeScript + Tailwind CSS v4 + Vite 8 frontend for the IELTS Study Platform (**点对点英语学习网**), proxying `/api` and `/static` requests to `ielts-backend` (`http://127.0.0.1:8001`).

## Quick Start

### Development / Preview Server (`port 5173`)
```bash
npm install
npm run build
./start.sh              # Foreground
./start.sh --daemon     # Background daemon (ielts_frontend.log)
./start.sh stop         # Stop daemon
```

### Contract & Build Tests
```bash
npm test
```

### Automated Implementation & Remote Deployment (`deploy.sh`)
Provisions Node.js 22 LTS, installs dependencies, builds `dist/`, configures `.env`, registers and starts `ielts-frontend.service` on port `5173`, and executes the end-to-end proxy contract tests:

```bash
# Deploy remotely over SSH to root@101.37.105.86 (or setup locally when run on the server)
./deploy.sh

# Run local setup & systemd service registration directly on the server
./deploy.sh local

# Lifecycle & verification commands
./deploy.sh status
./deploy.sh health
```
