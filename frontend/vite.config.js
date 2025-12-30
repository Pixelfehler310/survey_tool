import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3010,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        // Use 'backend' hostname in Docker, 'localhost' for local dev
        target: process.env.VITE_BACKEND_HOST
          ? `http://${process.env.VITE_BACKEND_HOST}:8000`
          : 'http://localhost:8010',
        changeOrigin: true,
      },
    },
  },
})
