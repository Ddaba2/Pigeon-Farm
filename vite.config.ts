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
    assetsDir: 'assets',
    base: './', // Chemins relatifs pour Electron
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
    port: 5174,
    strictPort: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      // Headers de compatibilité Edge
      'X-UA-Compatible': 'IE=edge',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Erreur proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Requête envoyée vers le backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Réponse reçue du backend:', proxyRes.statusCode, req.url);
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
    // Variables pour l'API
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3002'),
    'process.env.VITE_API_PORT': JSON.stringify(process.env.VITE_API_PORT || '3002'),
  },
  // Configuration pour améliorer la compatibilité Edge
  esbuild: {
    target: 'es2015', // Compatible avec Edge
  },
});
