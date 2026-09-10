import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import expressApp from './backend/src/app.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'express-backend-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
            return expressApp(req, res, next);
          }
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      ...(process.env.VITE_API_URL
        ? {
            '/api': {
              target: process.env.VITE_API_URL,
              changeOrigin: true,
            },
          }
        : {}),
    },
  },
});