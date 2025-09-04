

// Diagnostic et résolution des problèmes Edge
export const runEdgeDiagnostic = () => {
  const issues: string[] = [];
  const solutions: string[] = [];
  
  // Vérifier la version d'Edge
  const userAgent = navigator.userAgent;
  const isEdge = userAgent.includes('Edg');
  const isEdgeLegacy = userAgent.includes('Edge/');
  
  if (isEdgeLegacy) {
    issues.push('Version ancienne d\'Edge détectée');
    solutions.push('Mettre à jour vers Microsoft Edge basé sur Chromium');
  }
  
  // Vérifier localStorage
  try {
    const testKey = '__diagnostic_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
  } catch {
    issues.push('localStorage bloqué par Edge');
    solutions.push('Utilisation du stockage en mémoire activée');
  }
  
  // Vérifier les APIs modernes
  if (!window.fetch) {
    issues.push('Fetch API non supportée');
    solutions.push('Polyfill Fetch chargé');
  }
  
  if (!window.Promise) {
    issues.push('Promise non supporté');
    solutions.push('Polyfill Promise chargé');
  }
  
  // Vérifier les fonctionnalités CSS
  if (!CSS.supports('display', 'flex')) {
    issues.push('CSS Flexbox non supporté');
    solutions.push('Mise à jour du navigateur recommandée');
  }
  
  // Vérifier les modules ES6
  try {
    eval('import("").catch(()=>{})');
  } catch {
    issues.push('Modules ES6 non supportés');
    solutions.push('Configuration Vite adaptée');
  }
  
  // Afficher le rapport
  if (issues.length > 0) {
    console.warn('⚠️ Problèmes détectés:', issues);
    console.warn('💡 Solutions appliquées:', solutions);
  }
  
  return { issues, solutions, isEdge, isEdgeLegacy };
};

// Diagnostic spécifique pour Edge
export const isEdgeBrowser = (): boolean => {
  return navigator.userAgent.includes('Edg') || navigator.userAgent.includes('Edge');
};

export const isEdgeLegacy = (): boolean => {
  return navigator.userAgent.includes('Edge/');
};

export const isEdgeChromium = (): boolean => {
  return navigator.userAgent.includes('Edg/');
};

// Test de localStorage pour Edge
export const testEdgeLocalStorage = (): { available: boolean; error?: string } => {
  try {
    // Test de base
    if (typeof window === 'undefined') {
      return { available: false, error: 'Window non défini' };
    }

    if (!window.localStorage) {
      return { available: false, error: 'localStorage non supporté' };
    }

    // Test d'écriture
    const testKey = `edge_test_${Date.now()}`;
    const testValue = 'test_value';
    
    window.localStorage.setItem(testKey, testValue);
    
    // Test de lecture
    const readValue = window.localStorage.getItem(testKey);
    
    // Test de suppression
    window.localStorage.removeItem(testKey);
    
    // Vérification finale
    const finalCheck = window.localStorage.getItem(testKey);
    
    if (readValue === testValue && finalCheck === null) {
      return { available: true };
    } else {
      return { available: false, error: 'Test de lecture/écriture échoué' };
    }
    
  } catch (error) {
    return { 
      available: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
};

// Gestionnaire de stockage sécurisé pour Edge
export const createEdgeSafeStorage = () => {
  let memoryStorage: { [key: string]: string } = {};
  let localStorageAvailable = false;
  let lastTestTime = 0;
  const TEST_INTERVAL = 30000; // 30 secondes

  const testLocalStorage = (): boolean => {
    const now = Date.now();
    if (now - lastTestTime < TEST_INTERVAL) {
      return localStorageAvailable;
    }

    const test = testEdgeLocalStorage();
    localStorageAvailable = test.available;
    lastTestTime = now;

    if (!test.available) {
      console.warn('🚫 localStorage non disponible dans Edge:', test.error);
    }

    return localStorageAvailable;
  };

  return {
    getItem: (key: string): string | null => {
      if (testLocalStorage()) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          console.warn('Erreur localStorage.getItem, basculement vers mémoire');
          localStorageAvailable = false;
        }
      }
      return memoryStorage[key] || null;
    },

    setItem: (key: string, value: string): boolean => {
      if (testLocalStorage()) {
        try {
          window.localStorage.setItem(key, value);
          return true;
        } catch {
          console.warn('Erreur localStorage.setItem, basculement vers mémoire');
          localStorageAvailable = false;
        }
      }
      memoryStorage[key] = value;
      return true;
    },

    removeItem: (key: string): boolean => {
      if (testLocalStorage()) {
        try {
          window.localStorage.removeItem(key);
          return true;
        } catch {
          console.warn('Erreur localStorage.removeItem, basculement vers mémoire');
          localStorageAvailable = false;
        }
      }
      delete memoryStorage[key];
      return true;
    },

    clear: (): boolean => {
      if (testLocalStorage()) {
        try {
          window.localStorage.clear();
          return true;
        } catch {
          console.warn('Erreur localStorage.clear, basculement vers mémoire');
          localStorageAvailable = false;
        }
      }
      memoryStorage = {};
      return true;
    },

    getStorageType: (): string => {
      return localStorageAvailable ? 'localStorage' : 'memory';
    },

    getMemorySize: (): number => {
      return Object.keys(memoryStorage).length;
    },

    isAvailable: (): boolean => {
      return localStorageAvailable;
    },

    // Méthodes de diagnostic
    getDiagnosticInfo: () => {
      return {
        isEdge: isEdgeBrowser(),
        isEdgeLegacy: isEdgeLegacy(),
        isEdgeChromium: isEdgeChromium(),
        localStorageAvailable,
        memorySize: Object.keys(memoryStorage).length,
        lastTestTime: new Date(lastTestTime).toISOString(),
        userAgent: navigator.userAgent
      };
    }
  };
};

// Instance globale du stockage sécurisé Edge
export const edgeSafeStorage = createEdgeSafeStorage();

// Fonction d'initialisation pour Edge
export const initializeEdgeCompatibility = (): void => {
  const diagnostic = edgeSafeStorage.getDiagnosticInfo();

  if (diagnostic.isEdge) {
    // Ajouter des classes CSS spécifiques à Edge
    document.documentElement.classList.add('edge-browser');
    
    if (diagnostic.isEdgeLegacy) {
      document.documentElement.classList.add('edge-legacy');
      console.warn('⚠️ Version Edge legacy détectée, certaines fonctionnalités peuvent être limitées');
    }
    
    if (diagnostic.isEdgeChromium) {
      document.documentElement.classList.add('edge-chromium');
    }
  }
};



export default {
  isEdgeBrowser,
  isEdgeLegacy,
  isEdgeChromium,
  testEdgeLocalStorage,
  createEdgeSafeStorage,
  edgeSafeStorage,
  initializeEdgeCompatibility
};

// Fonction pour vérifier si l'application fonctionne
export const checkAppFunctionality = () => {
  const checks = {
    localStorage: false,
    fetch: false,
    promise: false,
    css: false,
    modules: false
  };
  
  try {
    // Test localStorage
    const testKey = '__functionality_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    checks.localStorage = true;
  } catch {
    console.warn('localStorage non fonctionnel');
  }
  
  // Test fetch
  if (typeof window.fetch === 'function') {
    checks.fetch = true;
  }
  
  // Test Promise
  if (window.Promise) {
    checks.promise = true;
  }
  
  // Test CSS
  if (CSS.supports('display', 'flex')) {
    checks.css = true;
  }
  
  // Test modules
  try {
    eval('import("").catch(()=>{})');
    checks.modules = true;
  } catch {
    console.warn('Modules non supportés');
  }
  
  const allWorking = Object.values(checks).every(check => check);
  
  return { checks, allWorking };
}; 

// Diagnostic pour les problèmes d'export PDF avec Edge
export const diagnoseEdgePDFIssues = (): {
  isEdge: boolean;
  isLegacyEdge: boolean;
  blobSupport: boolean;
  fileReaderSupport: boolean;
  createObjectURLSupport: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  const isEdge = navigator.userAgent.includes('Edg');
  const isLegacyEdge = navigator.userAgent.includes('Edge/');
  
  // Vérifier le support des blobs
  const blobSupport = typeof Blob !== 'undefined';
  if (!blobSupport) {
    issues.push('Blob API non supportée');
  }
  
  // Vérifier FileReader
  const fileReaderSupport = typeof FileReader !== 'undefined';
  if (!fileReaderSupport) {
    issues.push('FileReader API non supportée');
  }
  
  // Vérifier createObjectURL
  const createObjectURLSupport = typeof window.URL !== 'undefined' && typeof window.URL.createObjectURL === 'function';
  if (!createObjectURLSupport) {
    issues.push('URL.createObjectURL non supportée');
  }
  
  // Vérifier les fonctionnalités spécifiques à Edge
  if (isEdge || isLegacyEdge) {
    // Vérifier la taille maximale des blobs
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      if (testBlob.size === 0) {
        issues.push('Problème avec la création de blobs');
      }
    } catch {
      issues.push('Erreur lors de la création de blob de test');
    }
    
    // Vérifier les permissions de téléchargement
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'persistent-storage' as PermissionName })
        .then(result => {
          if (result.state === 'denied') {
            issues.push('Permissions de stockage refusées');
          }
        })
        .catch(() => {
          // Permissions API non supportée, pas un problème
        });
    }
  }
  
  return {
    isEdge,
    isLegacyEdge,
    blobSupport,
    fileReaderSupport,
    createObjectURLSupport,
    issues
  };
};

// Fonction pour tester l'export PDF
export const testPDFExport = async (): Promise<{
  success: boolean;
  error?: string;
  details: Record<string, unknown>;
}> => {
  try {
    // Créer un blob de test
    const testContent = 'Test PDF content';
    const testBlob = new Blob([testContent], { type: 'application/pdf' });
    
    // Tester FileReader
    const fileReaderTest = await new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(true);
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(testBlob);
    });
    
    // Tester createObjectURL
    let createObjectURLTest = false;
    try {
      const url = window.URL.createObjectURL(testBlob);
      createObjectURLTest = !!url;
      window.URL.revokeObjectURL(url);
    } catch {
      createObjectURLTest = false;
    }
    
    return {
      success: fileReaderTest && createObjectURLTest,
      details: {
        fileReaderTest,
        createObjectURLTest,
        blobSize: testBlob.size,
        userAgent: navigator.userAgent
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: { userAgent: navigator.userAgent }
    };
  }
}; 