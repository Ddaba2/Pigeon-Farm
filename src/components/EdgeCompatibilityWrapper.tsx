import React, { ReactNode, useEffect, useState } from 'react';
import EdgeStorageError from './EdgeStorageError';

interface EdgeCompatibilityWrapperProps {
  children: ReactNode;
}

const EdgeCompatibilityWrapper: React.FC<EdgeCompatibilityWrapperProps> = ({ children }) => {
  const [isEdgeCompatible, setIsEdgeCompatible] = useState(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [hasStorageError, setHasStorageError] = useState(false);
  const [hasLoggedIssues, setHasLoggedIssues] = useState(false);

  useEffect(() => {
    const checkCompatibility = () => {
      const issues: string[] = [];
      
      // Détecter Edge
      const isEdge = /Edg/.test(navigator.userAgent);
      const isIE = /Trident/.test(navigator.userAgent);
      

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
      
      // Vérifier les APIs modernes (optionnelles)
      // IntersectionObserver et ResizeObserver non critiques
      
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
      
      // Vérifier les cookies (test optionnel - désactivé pour éviter les faux positifs)
      // Note: Les cookies SameSite sont optionnels et ne bloquent pas l'application
      const testCookies = false; // Mettre à true si vous avez besoin des cookies SameSite
      
      if (testCookies) {
        try {
          const testCookie = 'edge_compat_test=1; SameSite=Lax; Path=/';
          document.cookie = testCookie;
          const cookieTest = document.cookie.includes('edge_compat_test=1');
          // Cookies SameSite non critiques
          // Nettoyer le cookie de test
          document.cookie = 'edge_compat_test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        } catch (error) {
          // Test des cookies échoué (non critique)
        }
      }
      
      // Vérifier les APIs Fetch (optionnelles pour compatibilité)
      // Headers, Request, Response APIs optionnelles
      
      // Filtrer les problèmes critiques seulement
      const criticalIssues = issues.filter(issue => 
        !issue.includes('IntersectionObserver') && 
        !issue.includes('ResizeObserver') &&
        !issue.includes('Headers API') &&
        !issue.includes('Request API') &&
        !issue.includes('Response API') &&
        !issue.includes('Cookies SameSite') &&
        !issue.includes('cookies')
      );
      
      setCompatibilityIssues(criticalIssues);
      
      // Appliquer les polyfills nécessaires
      applyPolyfills();
      
      // Configuration spécifique Edge
      if (isEdge || isIE) {
        configureForEdge();
      }
      
      setIsEdgeCompatible(true);
    };

    const applyPolyfills = () => {
      // Polyfills appliqués silencieusement
      if (!window.localStorage) {
        (window as any).localStorage = createMemoryStorage();
      }
      
      if (!window.sessionStorage) {
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
      // Configuration spécifique Edge
      
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

  // Logs de compatibilité désactivés

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
