// Configuration spécifique pour Microsoft Edge
// Ce fichier contient les configurations et optimisations pour Edge

export interface EdgeConfig {
  isEdge: boolean;
  isIELegacy: boolean;
  version: string;
  features: {
    fetch: boolean;
    promise: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    cookies: boolean;
    sameSite: boolean;
    webSockets: boolean;
    serviceWorkers: boolean;
  };
  optimizations: {
    disableServiceWorkers: boolean;
    useXHRFallback: boolean;
    useMemoryStorage: boolean;
    disableAdvancedFeatures: boolean;
  };
}

// Détecter la version d'Edge
const detectEdgeVersion = (): string => {
  const userAgent = navigator.userAgent;
  const edgeMatch = userAgent.match(/Edg\/(\d+)/);
  if (edgeMatch) {
    return edgeMatch[1];
  }
  
  const ieMatch = userAgent.match(/Trident\/\d+\.\d+.*rv:(\d+)/);
  if (ieMatch) {
    return `IE${ieMatch[1]}`;
  }
  
  return 'Unknown';
};

// Détecter les fonctionnalités supportées
const detectFeatures = (): EdgeConfig['features'] => {
  return {
    fetch: !!window.fetch,
    promise: !!window.Promise,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    cookies: !!document.cookie,
    sameSite: (() => {
      try {
        document.cookie = 'test=sameSite; SameSite=Lax';
        const supported = document.cookie.includes('test=sameSite');
        document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return supported;
      } catch {
        return false;
      }
    })(),
    webSockets: !!window.WebSocket,
    serviceWorkers: !!navigator.serviceWorker
  };
};

// Configuration des optimisations
const getOptimizations = (features: EdgeConfig['features']): EdgeConfig['optimizations'] => {
  return {
    disableServiceWorkers: !features.serviceWorkers,
    useXHRFallback: !features.fetch,
    useMemoryStorage: !features.localStorage || !features.sessionStorage,
    disableAdvancedFeatures: !features.promise || !features.fetch
  };
};

// Créer la configuration Edge
export const createEdgeConfig = (): EdgeConfig => {
  const isEdge = /Edg/.test(navigator.userAgent);
  const isIELegacy = /Trident/.test(navigator.userAgent);
  const version = detectEdgeVersion();
  const features = detectFeatures();
  const optimizations = getOptimizations(features);

  return {
    isEdge,
    isIELegacy,
    version,
    features,
    optimizations
  };
};

// Configuration globale Edge
export const edgeConfig = createEdgeConfig();

// Fonctions utilitaires pour Edge
export const isEdgeBrowser = (): boolean => edgeConfig.isEdge || edgeConfig.isIELegacy;

export const needsPolyfill = (feature: keyof EdgeConfig['features']): boolean => {
  return !edgeConfig.features[feature];
};

export const shouldUseFallback = (fallback: keyof EdgeConfig['optimizations']): boolean => {
  return edgeConfig.optimizations[fallback];
};

// Configuration des cookies pour Edge
export const configureCookiesForEdge = (): void => {
  if (isEdgeBrowser()) {
    // console.log('🍪 Configuration des cookies pour Edge');
    
    // Override de la fonction setCookie pour Edge
    const originalSetCookie = (name: string, value: string, options: any = {}) => {
      let cookieString = `${name}=${value}`;
      
      if (options.expires) {
        cookieString += `; expires=${options.expires}`;
      }
      
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      
      if (options.secure) {
        cookieString += `; secure`;
      }
      
      // Essayer SameSite=Lax d'abord
      if (edgeConfig.features.sameSite) {
        cookieString += `; SameSite=Lax`;
      }
      
      document.cookie = cookieString;
      
      // Vérifier si le cookie a été défini
      if (!document.cookie.includes(`${name}=${value}`)) {
        // Fallback sans SameSite
        document.cookie = `${name}=${value}; expires=${options.expires || ''}; path=${options.path || '/'}`;
        // console.log(`🍪 Cookie ${name} défini avec fallback Edge`);
      }
    };
    
    // Exposer la fonction globalement
    (window as any).setCookieEdge = originalSetCookie;
  }
};

// Configuration des headers pour Edge
export const configureHeadersForEdge = (): void => {
  if (isEdgeBrowser()) {
    // console.log('📋 Configuration des headers pour Edge');
    
    // Ajouter des meta tags pour la compatibilité
    if (document.head) {
      const existingMeta = document.querySelector('meta[http-equiv="X-UA-Compatible"]');
      if (!existingMeta) {
        const metaEdge = document.createElement('meta');
        metaEdge.setAttribute('http-equiv', 'X-UA-Compatible');
        metaEdge.setAttribute('content', 'IE=edge');
        document.head.appendChild(metaEdge);
      }
      
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (!existingViewport) {
        const metaViewport = document.createElement('meta');
        metaViewport.setAttribute('name', 'viewport');
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
        document.head.appendChild(metaViewport);
      }
    }
  }
};

// Configuration des APIs pour Edge
export const configureAPIsForEdge = (): void => {
  if (isEdgeBrowser()) {
    // console.log('🔧 Configuration des APIs pour Edge');
    
    // Désactiver les service workers si problématiques
    if (edgeConfig.optimizations.disableServiceWorkers) {
      // console.log('⚠️ Service Workers désactivés pour Edge');
      // Service workers peuvent causer des problèmes avec Edge Legacy
    }
    
    // Configurer les timeouts pour les requêtes
    if (edgeConfig.optimizations.useXHRFallback) {
      // console.log('⚠️ Utilisation du fallback XMLHttpRequest pour Edge');
    }
  }
};

// Initialisation de la configuration Edge
export const initializeEdgeConfig = (): void => {
  // console.log('🚀 Initialisation de la configuration Edge');
  // console.log('📊 Configuration Edge:', edgeConfig);
  
  configureCookiesForEdge();
  configureHeadersForEdge();
  configureAPIsForEdge();
  
  // console.log('✅ Configuration Edge initialisée');
};

// Export par défaut
export default edgeConfig;
