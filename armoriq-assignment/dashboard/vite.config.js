import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const agentUrl = env.VITE_AGENT_URL || 'http://localhost:8001'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: agentUrl,
          changeOrigin: true,
        },
        '/socket.io': {
          target: agentUrl,
          ws: true,
        },
      },
    },
  }
})
