import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/health': { target: 'http://localhost:5001', changeOrigin: true },
      // '/auth/login' and '/auth/register' are also client-side page routes
      // (React Router), so only proxy the backend's actual auth API verbs
      // (POST register/login/refresh/logout, GET me) and let Vite serve the
      // SPA shell for plain GET page navigations to those same paths.
      '/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: (req) => {
          const isPageNavigation =
            req.method === 'GET' &&
            (req.url === '/auth/login' || req.url === '/auth/register') &&
            req.headers.accept?.includes('text/html');
          if (isPageNavigation) {
            return req.url;
          }
          return undefined;
        }
      }
    }
  }
});
