import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo local (npm run dev), /api se reenvía al backend en localhost:8080.
// En Docker, ese reenvío lo hace Nginx (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
