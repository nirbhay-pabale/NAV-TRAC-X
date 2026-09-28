import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api/engine': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/benchmarks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/artifacts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/analysis': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/cases': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/reports': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/evidence': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api/notifications/security': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
