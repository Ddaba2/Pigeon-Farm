// Gestion de la compatibilité avec Edge et autres navigateurs
// qui peuvent bloquer localStorage

let localStorageAvailable = false;

// Test de disponibilité de localStorage
function testLocalStorage(): boolean {
  try {
    // Test simple sans écriture pour éviter les erreurs
    const testKey = '__test_storage__';
    const originalValue = window.localStorage.getItem(testKey);
    
    // Test d'écriture sécurisé
    try {
      window.localStorage.setItem(testKey, 'test');
      const readValue = window.localStorage.getItem(testKey);
      
      // Restaurer la valeur originale
      if (originalValue === null) {
        window.localStorage.removeItem(testKey);
      } else {
        window.localStorage.setItem(testKey, originalValue);
      }
      
      if (readValue === 'test') {
        console.log('✅ localStorage fonctionnel');
        localStorageAvailable = true;
        return true;
      } else {
        console.warn('🚫 localStorage test échoué (lecture/écriture incorrecte)');
        localStorageAvailable = false;
        return false;
      }
    } catch (writeError) {
      console.warn('🚫 localStorage bloqué par Edge, utilisation du stockage en mémoire:', writeError);
      localStorageAvailable = false;
      return false;
    }
  } catch (error) {
    console.warn('🚫 localStorage non disponible:', error);
    localStorageAvailable = false;
    return false;
  }
}

// Stockage en mémoire de fallback
const memoryStorage = new Map<string, string>();

// Interface pour le stockage sécurisé
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (localStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.warn('Erreur lors de la lecture depuis localStorage:', error);
        return memoryStorage.get(key) || null;
      }
    }
    return memoryStorage.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    if (localStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Erreur lors de l\'écriture dans localStorage:', error);
        memoryStorage.set(key, value);
      }
    } else {
      memoryStorage.set(key, value);
    }
  },

  removeItem: (key: string): void => {
    if (localStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn('Erreur lors de la suppression depuis localStorage:', error);
        memoryStorage.delete(key);
      }
    } else {
      memoryStorage.delete(key);
    }
  },

  clear: (): void => {
    if (localStorageAvailable) {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.warn('Erreur lors du nettoyage de localStorage:', error);
        memoryStorage.clear();
      }
    } else {
      memoryStorage.clear();
    }
  },

  key: (index: number): string | null => {
    if (localStorageAvailable) {
      try {
        return window.localStorage.key(index);
      } catch (error) {
        console.warn('Erreur lors de l\'accès à la clé localStorage:', error);
        return Array.from(memoryStorage.keys())[index] || null;
      }
    }
    return Array.from(memoryStorage.keys())[index] || null;
  },

  get length(): number {
    if (localStorageAvailable) {
      try {
        return window.localStorage.length;
      } catch (error) {
        console.warn('Erreur lors de l\'accès à la longueur localStorage:', error);
        return memoryStorage.size;
      }
    }
    return memoryStorage.size;
  }
};

// Initialiser le test de localStorage
testLocalStorage();

// Fonction pour récupérer le token d'authentification
export function getAuthToken(): string | null {
  return safeLocalStorage.getItem('token');
}

// Fonction pour l'export PDF compatible avec Edge
export function edgeCompatiblePDFExport(content: string, filename: string): void {
  try {
    // Créer un blob avec le contenu
    const blob = new Blob([content], { type: 'application/pdf' });
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    // Fallback : ouvrir dans un nouvel onglet
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  }
}

// Fonction pour appliquer les polyfills Edge
export function applyPolyfills(): void {
  // Polyfills pour les fonctionnalités manquantes dans Edge
  if (typeof window !== 'undefined') {
    // Polyfill pour URL.createObjectURL si nécessaire
    if (!window.URL || !window.URL.createObjectURL) {
      console.warn('URL.createObjectURL non disponible, utilisation du fallback');
    }
    
    // Polyfill pour Blob si nécessaire
    if (!window.Blob) {
      console.warn('Blob non disponible, certaines fonctionnalités peuvent ne pas fonctionner');
    }
  }
}

// Fonction pour vérifier la compatibilité Edge
export function checkEdgeCompatibility(): boolean {
  const userAgent = navigator.userAgent;
  const isEdge = userAgent.includes('Edg');
  const isEdgeLegacy = userAgent.includes('Edge');
  
  if (isEdge || isEdgeLegacy) {
    console.log('Navigateur Edge détecté');
    return true;
  }
  
  return false;
}

// Fonction pour afficher un avertissement Edge
export function showEdgeWarning(): void {
  if (checkEdgeCompatibility()) {
    console.warn('⚠️ Navigateur Edge détecté - Certaines fonctionnalités peuvent être limitées');
    
    // Notifications supprimées
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      color: #92400e;
      padding: 12px;
      border-radius: 6px;
      z-index: 9999;
      font-size: 14px;
      max-width: 300px;
    `;
    warningDiv.innerHTML = `
      <strong>⚠️ Compatibilité Edge</strong><br>
      Certaines fonctionnalités peuvent être limitées dans ce navigateur.
      <button onclick="this.parentElement.remove()" style="
        background: #f59e0b;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 8px;
        cursor: pointer;
      ">Fermer</button>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-suppression après 10 secondes
    setTimeout(() => {
      if (warningDiv.parentElement) {
        warningDiv.remove();
      }
    }, 10000);
  }
}