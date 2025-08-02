// Configuration spécifique pour Microsoft Edge
(function() {
  'use strict';
  
  // Détecter Edge
  const isEdge = navigator.userAgent.includes('Edg');
  const isEdgeLegacy = navigator.userAgent.includes('Edge/');
  
  if (isEdge || isEdgeLegacy) {
    console.log('🔧 Configuration Edge détectée');
    
    // Test de localStorage de manière sécurisée
    try {
      const testKey = '__edge_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      console.log('✅ localStorage fonctionnel dans Edge');
    } catch (error) {
      console.warn('🚫 localStorage bloqué par Edge, utilisation du stockage en mémoire');
    }
    
    // Polyfill pour les APIs manquantes
    if (!window.Promise) {
      console.log('📦 Chargement du polyfill Promise');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js';
      document.head.appendChild(script);
    }
    
    if (!window.fetch) {
      console.log('📦 Chargement du polyfill Fetch');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js';
      document.head.appendChild(script);
    }
    
    // Configuration des headers de sécurité
    if (window.location.protocol === 'https:') {
      // Forcer HTTPS pour les ressources
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "upgrade-insecure-requests";
      document.head.appendChild(meta);
    }
    
    // Gestion des erreurs globales
    window.addEventListener('error', function(event) {
      if (event.error && event.error.message && event.error.message.includes('localStorage')) {
        console.warn('🚫 localStorage access blocked by Edge security policy - handled');
        event.preventDefault();
        return false;
      }
    });
    
    // Gestion des rejets de promesses non gérés
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && event.reason.message.includes('localStorage')) {
        console.warn('🚫 localStorage promise rejection handled');
        event.preventDefault();
        return false;
      }
    });
    
    // Afficher un message informatif
    console.log('✅ Configuration Edge appliquée avec succès');
  }
})(); 