// Gestionnaire de stockage compatible Edge Enterprise
// Évite les problèmes de modification des propriétés Window

interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
  key(index: number): string | null;
}

class MemoryStorage implements StorageInterface {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  clear(): void {
    this.storage = {};
  }

  get length(): number {
    return Object.keys(this.storage).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.storage);
    return keys[index] || null;
  }
}

class EdgeStorageManager {
  private localStorageImpl: StorageInterface;
  private sessionStorageImpl: StorageInterface;
  private isLocalStorageBlocked: boolean = false;
  private isSessionStorageBlocked: boolean = false;

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Tester localStorage
    try {
      const testKey = '__edge_storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      this.localStorageImpl = window.localStorage;
      console.log('✅ localStorage Edge accessible');
    } catch (error) {
      console.log('🔧 localStorage Edge bloqué, utilisation du stockage en mémoire');
      this.localStorageImpl = new MemoryStorage();
      this.isLocalStorageBlocked = true;
    }

    // Tester sessionStorage
    try {
      const testKey = '__edge_session_test__';
      window.sessionStorage.setItem(testKey, 'test');
      window.sessionStorage.removeItem(testKey);
      this.sessionStorageImpl = window.sessionStorage;
      console.log('✅ sessionStorage Edge accessible');
    } catch (error) {
      console.log('🔧 sessionStorage Edge bloqué, utilisation du stockage en mémoire');
      this.sessionStorageImpl = new MemoryStorage();
      this.isSessionStorageBlocked = true;
    }
  }

  // Méthodes pour localStorage
  getLocalStorageItem(key: string): string | null {
    return this.localStorageImpl.getItem(key);
  }

  setLocalStorageItem(key: string, value: string): void {
    this.localStorageImpl.setItem(key, value);
  }

  removeLocalStorageItem(key: string): void {
    this.localStorageImpl.removeItem(key);
  }

  clearLocalStorage(): void {
    this.localStorageImpl.clear();
  }

  getLocalStorageLength(): number {
    return this.localStorageImpl.length;
  }

  getLocalStorageKey(index: number): string | null {
    return this.localStorageImpl.key(index);
  }

  // Méthodes pour sessionStorage
  getSessionStorageItem(key: string): string | null {
    return this.sessionStorageImpl.getItem(key);
  }

  setSessionStorageItem(key: string, value: string): void {
    this.sessionStorageImpl.setItem(key, value);
  }

  removeSessionStorageItem(key: string): void {
    this.sessionStorageImpl.removeItem(key);
  }

  clearSessionStorage(): void {
    this.sessionStorageImpl.clear();
  }

  getSessionStorageLength(): number {
    return this.sessionStorageImpl.length;
  }

  getSessionStorageKey(index: number): string | null {
    return this.sessionStorageImpl.key(index);
  }

  // Vérifications de statut
  isLocalStorageAvailable(): boolean {
    return !this.isLocalStorageBlocked;
  }

  isSessionStorageAvailable(): boolean {
    return !this.isSessionStorageBlocked;
  }

  // Obtenir les implémentations pour compatibilité
  getLocalStorage(): StorageInterface {
    return this.localStorageImpl;
  }

  getSessionStorage(): StorageInterface {
    return this.sessionStorageImpl;
  }

  // Méthodes de diagnostic
  getStorageStatus(): {
    localStorage: { available: boolean; type: string };
    sessionStorage: { available: boolean; type: string };
  } {
    return {
      localStorage: {
        available: this.isLocalStorageAvailable(),
        type: this.isLocalStorageBlocked ? 'memory' : 'native'
      },
      sessionStorage: {
        available: this.isSessionStorageAvailable(),
        type: this.isSessionStorageBlocked ? 'memory' : 'native'
      }
    };
  }
}

// Instance globale du gestionnaire de stockage
const storageManager = new EdgeStorageManager();

// Exporter les méthodes compatibles
export const edgeLocalStorage = {
  getItem: (key: string) => storageManager.getLocalStorageItem(key),
  setItem: (key: string, value: string) => storageManager.setLocalStorageItem(key, value),
  removeItem: (key: string) => storageManager.removeLocalStorageItem(key),
  clear: () => storageManager.clearLocalStorage(),
  get length() { return storageManager.getLocalStorageLength(); },
  key: (index: number) => storageManager.getLocalStorageKey(index)
};

export const edgeSessionStorage = {
  getItem: (key: string) => storageManager.getSessionStorageItem(key),
  setItem: (key: string, value: string) => storageManager.setSessionStorageItem(key, value),
  removeItem: (key: string) => storageManager.removeSessionStorageItem(key),
  clear: () => storageManager.clearSessionStorage(),
  get length() { return storageManager.getSessionStorageLength(); },
  key: (index: number) => storageManager.getSessionStorageKey(index)
};

// Fonctions utilitaires
export const isEdgeLocalStorageAvailable = (): boolean => {
  return storageManager.isLocalStorageAvailable();
};

export const isEdgeSessionStorageAvailable = (): boolean => {
  return storageManager.isSessionStorageAvailable();
};

export const getEdgeStorageStatus = () => {
  return storageManager.getStorageStatus();
};

// Export par défaut
export default storageManager;
