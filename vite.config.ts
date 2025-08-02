import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2015', // Compatible avec Edge
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    host: true,
    port: parseInt(process.env.VITE_PORT || '5173'),
    strictPort: false,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002', // Proxy vers HTTP backend
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  define: {
    // Définir des variables globales pour la compatibilité Edge
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global': 'globalThis',
    // Variables pour la compatibilité Edge
    'process.env.EDGE_COMPATIBILITY': JSON.stringify(process.env.EDGE_COMPATIBILITY || 'false'),
  },
  // Configuration pour améliorer la compatibilité Edge
  esbuild: {
    target: 'es2015', // Compatible avec Edge
  },
});
