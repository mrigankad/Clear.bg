import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/remove': BACKEND,
      '/health': BACKEND,
      '/models': BACKEND,
      '/api': BACKEND,
      '/download': BACKEND,
    },
  },
})
