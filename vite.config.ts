import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_LOG_FILE = path.join(__dirname, 'ielts_frontend.log')
const frontendPort = Number(process.env.PORT || 5173)
const backendTarget = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001'

const proxyRules = {
  '/api': {
    target: backendTarget,
    changeOrigin: true,
    xfwd: true,
  },
  '/static': {
    target: backendTarget,
    changeOrigin: true,
    xfwd: true,
  },
}

function attachAccessMiddleware(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  },
  modeLabel: string,
) {
  const bootLine = `[${new Date().toISOString()}] [BOOT] Vite ${modeLabel} server ready on :${frontendPort} (proxy -> ${backendTarget})\n`
  try {
    fs.appendFileSync(FRONTEND_LOG_FILE, bootLine)
  } catch {
    // ignore log write errors
  }
  middlewares.use((req, res, next) => {
    const url = req.url || '/'
    const isInternalAsset =
      url.startsWith('/@') ||
      url.startsWith('/node_modules/') ||
      url.startsWith('/src/')
    if (isInternalAsset) {
      next()
      return
    }
    const start = Date.now()
    const method = req.method || 'GET'
    const clientIp = req.socket.remoteAddress || '-'
    res.on('finish', () => {
      const ms = Date.now() - start
      const tag = url.startsWith('/api') || url.startsWith('/static') ? 'PROXY' : 'PAGE'
      const line = `[${new Date().toISOString()}] [${tag}] ${clientIp} "${method} ${url}" ${res.statusCode} (${ms}ms)`
      console.log(line)
      try {
        fs.appendFileSync(FRONTEND_LOG_FILE, `${line}\n`)
      } catch {
        // ignore log write errors
      }
    })
    next()
  })
}

function frontendAccessLogger(): Plugin {
  return {
    name: 'ielts-frontend-access-logger',
    configureServer(server) {
      attachAccessMiddleware(server.middlewares, 'dev')
    },
    configurePreviewServer(server) {
      attachAccessMiddleware(server.middlewares, 'preview')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), frontendAccessLogger()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: true,
    allowedHosts: true,
    proxy: proxyRules,
  },
  preview: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: true,
    allowedHosts: true,
    proxy: proxyRules,
  },
})
