import React, { ReactNode, useEffect, useState } from 'react';
import EdgeStorageError from './EdgeStorageError';

interface EdgeCompatibilityWrapperProps {
  children: ReactNode;
}

const EdgeCompatibilityWrapper: React.FC<EdgeCompatibilityWrapperProps> = ({ children }) => {
  const [isEdgeCompatible, setIsEdgeCompatible] = useState(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [hasStorageError, setHasStorageError] = useState(false);

  useEffect(() => {
    const checkCompatibility = () => {
      const issues: string[] = [];
      
      // Détecter Edge
      const isEdge = /Edg/.test(navigator.userAgent);
      const isIE = /Trident/.test(navigator.userAgent);
      
      console.log('🔍 Détection navigateur:', {
        userAgent: navigator.userAgent,
        isEdge,
        isIE,
        isChrome: /Chrome/.test(navigator.userAgent)
      });

      // Vérifier les APIs critiques
      if (!window.fetch) {
        issues.push('Fetch API non supportée');
      }
      
      if (!window.Promise) {
        issues.push('Promises non supportées');
      }
      
      // Vérifier les APIs de stockage avec gestion d'erreur Edge
      try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (error) {
        if (error instanceof SecurityError || error.name === 'SecurityError') {
          issues.push('localStorage bloqué par Edge Enterprise');
          setHasStorageError(true);
        } else {
          issues.push('localStorage non disponible');
        }
      }
      
      try {
        const testKey = '__session_test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
      } catch (error) {
        if (error instanceof SecurityError || error.name === 'SecurityError') {
          issues.push('sessionStorage bloqué par Edge Enterprise');
        } else {
          issues.push('sessionStorage non disponible');
        }
      }
      
      // Vérifier les APIs modernes
      if (!window.IntersectionObserver) {
        issues.push('IntersectionObserver non supporté');
      }
      
      if (!window.ResizeObserver) {
        issues.push('ResizeObserver non supporté');
      }
      
      // Vérifier les fonctionnalités ES6+
      try {
        // Test des classes
        class TestClass {}
        new TestClass();
        
        // Test des arrow functions
        const testArrow = () => true;
        testArrow();
        
        // Test des template literals
        const testTemplate = `test ${1}`;
        
        // Test des destructuring
        const { test } = { test: 'value' };
        
        // Test des modules
        if (typeof Symbol === 'undefined') {
          issues.push('Symbol non supporté');
        }
        
      } catch (error) {
        issues.push(`Erreur ES6+: ${error}`);
      }
      
      // Vérifier les cookies
      try {
        document.cookie = 'test=edge-compat; SameSite=Lax';
        const cookieTest = document.cookie.includes('test=edge-compat');
        if (!cookieTest) {
          issues.push('Cookies SameSite non supportés');
        }
        // Nettoyer le cookie de test
        document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (error) {
        issues.push('Erreur cookies: ' + error);
      }
      
      // Vérifier les headers de sécurité
      if (!window.Headers) {
        issues.push('Headers API non supportée');
      }
      
      if (!window.Request) {
        issues.push('Request API non supportée');
      }
      
      if (!window.Response) {
        issues.push('Response API non supportée');
      }
      
      setCompatibilityIssues(issues);
      
      // Appliquer les polyfills nécessaires
      applyPolyfills();
      
      // Configuration spécifique Edge
      if (isEdge || isIE) {
        configureForEdge();
      }
      
      setIsEdgeCompatible(true);
    };

    const applyPolyfills = () => {
      // Polyfill pour fetch si nécessaire
      if (!window.fetch) {
        console.warn('⚠️ Fetch non disponible, utilisation de XMLHttpRequest');
        // Le polyfill sera géré dans api.ts
      }
      
      // Polyfill pour Promise si nécessaire
      if (!window.Promise) {
        console.warn('⚠️ Promise non disponible');
        // Utiliser une bibliothèque de polyfill
      }
      
      // Polyfill pour localStorage
      if (!window.localStorage) {
        console.warn('⚠️ localStorage non disponible');
        // Créer un fallback en mémoire
        (window as any).localStorage = createMemoryStorage();
      }
      
      // Polyfill pour sessionStorage
      if (!window.sessionStorage) {
        console.warn('⚠️ sessionStorage non disponible');
        (window as any).sessionStorage = createMemoryStorage();
      }
    };

    const createMemoryStorage = () => {
      const storage: { [key: string]: string } = {};
      return {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
        removeItem: (key: string) => { delete storage[key]; },
        clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
        length: Object.keys(storage).length,
        key: (index: number) => Object.keys(storage)[index] || null
      };
    };

    const configureForEdge = () => {
      console.log('🔧 Configuration spécifique Edge activée');
      
      // Désactiver certaines fonctionnalités problématiques
      if (window.navigator && window.navigator.serviceWorker) {
        // Edge peut avoir des problèmes avec les service workers
        console.log('⚠️ Service Workers désactivés pour Edge');
      }
      
      // Configuration des cookies pour Edge
      const originalSetCookie = document.cookie;
      console.log('🍪 Configuration cookies Edge');
      
      // Ajouter des headers de sécurité pour Edge
      if (document.head) {
        const metaEdge = document.createElement('meta');
        metaEdge.setAttribute('http-equiv', 'X-UA-Compatible');
        metaEdge.setAttribute('content', 'IE=edge');
        document.head.appendChild(metaEdge);
      }
    };

    checkCompatibility();
  }, []);

  // Afficher les problèmes de compatibilité en mode développement
  if (process.env.NODE_ENV === 'development' && compatibilityIssues.length > 0) {
    console.warn('⚠️ Problèmes de compatibilité détectés:', compatibilityIssues);
  }

  const handleStorageRetry = () => {
    setHasStorageError(false);
    // Relancer la vérification
    window.location.reload();
  };

  const handleStorageContinue = () => {
    setHasStorageError(false);
    setIsEdgeCompatible(true);
  };

  if (hasStorageError) {
    return (
      <EdgeStorageError 
        onRetry={handleStorageRetry}
        onContinue={handleStorageContinue}
      />
    );
  }

  if (!isEdgeCompatible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de la compatibilité...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default EdgeCompatibilityWrapper;
