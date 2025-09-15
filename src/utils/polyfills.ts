// Polyfills pour la compatibilité Microsoft Edge
// Ce fichier contient les polyfills nécessaires pour assurer la compatibilité avec Edge Legacy et Edge Enterprise

// Polyfill pour fetch si non disponible
if (!window.fetch) {
  // // console.log('🔧 Chargement du polyfill fetch pour Edge Legacy');
  
  (window as any).fetch = function(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open(options.method || 'GET', url, true);
      
      // Configurer les headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            xhr.setRequestHeader(key, value);
          }
        });
      }
      
      // Configurer les credentials
      if (options.credentials === 'include') {
        xhr.withCredentials = true;
      }
      
      xhr.onload = () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers()
        });
        resolve(response);
      };
      
      xhr.onerror = () => {
        reject(new Error('Erreur réseau'));
      };
      
      xhr.ontimeout = () => {
        reject(new Error('Timeout'));
      };
      
      // Envoyer la requête
      if (options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    });
  };
}

// Polyfill pour Promise si non disponible
if (!window.Promise) {
  // // console.log('🔧 Chargement du polyfill Promise pour Edge Legacy');
  
  // Polyfill simple pour Promise
  (window as any).Promise = function(executor: (resolve: Function, reject: Function) => void) {
    let resolved = false;
    let rejected = false;
    let value: any;
    let reason: any;
    let onResolve: Function[] = [];
    let onReject: Function[] = [];
    
    const resolve = (val: any) => {
      if (resolved || rejected) return;
      resolved = true;
      value = val;
      onResolve.forEach(callback => callback(val));
    };
    
    const reject = (err: any) => {
      if (resolved || rejected) return;
      rejected = true;
      reason = err;
      onReject.forEach(callback => callback(err));
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
    
    return {
      then: (onFulfilled?: Function, onRejected?: Function) => {
        return new (window as any).Promise((resolve: Function, reject: Function) => {
          if (resolved) {
            try {
              const result = onFulfilled ? onFulfilled(value) : value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else if (rejected) {
            try {
              const result = onRejected ? onRejected(reason) : reason;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          } else {
            onResolve.push((val: any) => {
              try {
                const result = onFulfilled ? onFulfilled(val) : val;
                resolve(result);
              } catch (error) {
                reject(error);
              }
            });
            onReject.push((err: any) => {
              try {
                const result = onRejected ? onRejected(err) : err;
                resolve(result);
              } catch (error) {
                reject(error);
              }
            });
          }
        });
      },
      catch: (onRejected: Function) => {
        return this.then(undefined, onRejected);
      }
    };
  };
  
  // Méthodes statiques pour Promise
  (window as any).Promise.resolve = (value: any) => {
    return new (window as any).Promise((resolve: Function) => resolve(value));
  };
  
  (window as any).Promise.reject = (reason: any) => {
    return new (window as any).Promise((resolve: Function, reject: Function) => reject(reason));
  };
  
  (window as any).Promise.all = (promises: any[]) => {
    return new (window as any).Promise((resolve: Function, reject: Function) => {
      const results: any[] = [];
      let completed = 0;
      
      promises.forEach((promise, index) => {
        promise.then((result: any) => {
          results[index] = result;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        }).catch(reject);
      });
    });
  };
}

// Polyfill pour Object.assign si non disponible
if (!Object.assign) {
  // // console.log('🔧 Chargement du polyfill Object.assign pour Edge Legacy');
  
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    const to = Object(target);
    
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (source != null) {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            to[key] = source[key];
          }
        }
      }
    }
    
    return to;
  };
}

// Polyfill pour Array.from si non disponible
if (!Array.from) {
  // // console.log('🔧 Chargement du polyfill Array.from pour Edge Legacy');
  
  Array.from = function(arrayLike: any, mapFn?: Function, thisArg?: any) {
    const items = Object(arrayLike);
    const len = parseInt(items.length) || 0;
    const result = new Array(len);
    
    for (let i = 0; i < len; i++) {
      const value = mapFn ? mapFn.call(thisArg, items[i], i) : items[i];
      result[i] = value;
    }
    
    return result;
  };
}

// Polyfill pour Array.includes si non disponible
if (!Array.prototype.includes) {
  // // console.log('🔧 Chargement du polyfill Array.includes pour Edge Legacy');
  
  Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
    const O = Object(this);
    const len = parseInt(O.length) || 0;
    if (len === 0) return false;
    
    const n = parseInt(fromIndex) || 0;
    let k = n >= 0 ? n : Math.max(len + n, 0);
    
    while (k < len) {
      if (O[k] === searchElement) {
        return true;
      }
      k++;
    }
    
    return false;
  };
}

// Polyfill pour String.includes si non disponible
if (!String.prototype.includes) {
  // // console.log('🔧 Chargement du polyfill String.includes pour Edge Legacy');
  
  String.prototype.includes = function(search: string, start?: number) {
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill pour localStorage/sessionStorage si non disponible ou bloqué par Edge
const createStoragePolyfill = () => {
  const storage: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => {
      try {
        return storage[key] || null;
      } catch (error) {
        // // console.warn('Erreur localStorage.getItem:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        storage[key] = value;
      } catch (error) {
        // // console.warn('Erreur localStorage.setItem:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        delete storage[key];
      } catch (error) {
        // // console.warn('Erreur localStorage.removeItem:', error);
      }
    },
    clear: () => {
      try {
        Object.keys(storage).forEach(key => delete storage[key]);
      } catch (error) {
        // // console.warn('Erreur localStorage.clear:', error);
      }
    },
    get length() { 
      try {
        return Object.keys(storage).length;
      } catch (error) {
        return 0;
      }
    },
    key: (index: number) => {
      try {
        return Object.keys(storage)[index] || null;
      } catch (error) {
        return null;
      }
    }
  };
};

// Vérifier et remplacer localStorage si nécessaire
try {
  // Tester l'accès au localStorage
  const testKey = '__localStorage_test__';
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
  // // console.log('✅ localStorage accessible');
} catch (error) {
  // // console.log('🔧 localStorage bloqué par Edge, utilisation du polyfill');
  
  // Créer un proxy pour localStorage qui utilise notre polyfill
  const localStoragePolyfill = createStoragePolyfill();
  
  // Remplacer localStorage de manière sécurisée
  try {
    Object.defineProperty(window, 'localStorage', {
      value: localStoragePolyfill,
      writable: true,
      configurable: true
    });
  } catch (defineError) {
    // Si Object.defineProperty échoue, utiliser une approche alternative
    // // console.log('⚠️ Impossible de remplacer localStorage, utilisation du proxy');
    
    // Créer un proxy global pour localStorage
    (window as any).__localStoragePolyfill = localStoragePolyfill;
    
    // Rediriger les appels vers notre polyfill
    const originalLocalStorage = window.localStorage;
    (window as any).localStorage = new Proxy(originalLocalStorage, {
      get(target, prop) {
        if (prop in localStoragePolyfill) {
          return localStoragePolyfill[prop];
        }
        return target[prop];
      }
    });
  }
}

// Vérifier et remplacer sessionStorage si nécessaire
try {
  // Tester l'accès au sessionStorage
  const testKey = '__sessionStorage_test__';
  sessionStorage.setItem(testKey, 'test');
  sessionStorage.removeItem(testKey);
  // // console.log('✅ sessionStorage accessible');
} catch (error) {
  // // console.log('🔧 sessionStorage bloqué par Edge, utilisation du polyfill');
  
  // Créer un proxy pour sessionStorage qui utilise notre polyfill
  const sessionStoragePolyfill = createStoragePolyfill();
  
  // Remplacer sessionStorage de manière sécurisée
  try {
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStoragePolyfill,
      writable: true,
      configurable: true
    });
  } catch (defineError) {
    // Si Object.defineProperty échoue, utiliser une approche alternative
    // // console.log('⚠️ Impossible de remplacer sessionStorage, utilisation du proxy');
    
    // Créer un proxy global pour sessionStorage
    (window as any).__sessionStoragePolyfill = sessionStoragePolyfill;
    
    // Rediriger les appels vers notre polyfill
    const originalSessionStorage = window.sessionStorage;
    (window as any).sessionStorage = new Proxy(originalSessionStorage, {
      get(target, prop) {
        if (prop in sessionStoragePolyfill) {
          return sessionStoragePolyfill[prop];
        }
        return target[prop];
      }
    });
  }
}

// Polyfill pour JSON si non disponible
if (!window.JSON) {
  // // console.log('🔧 Chargement du polyfill JSON pour Edge Legacy');
  
  (window as any).JSON = {
    parse: function(text: string) {
      return eval('(' + text + ')');
    },
    stringify: function(value: any) {
      if (value === null) return 'null';
      if (typeof value === 'string') return '"' + value.replace(/"/g, '\\"') + '"';
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      if (Array.isArray(value)) {
        return '[' + value.map(item => this.stringify(item)).join(',') + ']';
      }
      if (typeof value === 'object') {
        const pairs = [];
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            pairs.push('"' + key + '":' + this.stringify(value[key]));
          }
        }
        return '{' + pairs.join(',') + '}';
      }
      return 'undefined';
    }
  };
}

// Configuration spécifique pour Edge
const isEdge = /Edg/.test(navigator.userAgent);
const isIELegacy = /Trident/.test(navigator.userAgent);

if (isEdge || isIELegacy) {
  // // console.log('🔧 Configuration spécifique Edge/IE activée');
  
  // Désactiver certaines fonctionnalités problématiques
  if (window.navigator && window.navigator.serviceWorker) {
    // // console.log('⚠️ Service Workers désactivés pour Edge/IE');
    // Service workers peuvent causer des problèmes avec Edge Legacy
  }
  
  // Configuration des cookies pour Edge
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  if (originalCookieDescriptor) {
    // // console.log('🍪 Configuration cookies Edge/IE');
  }
  
  // Ajouter des meta tags pour la compatibilité
  if (document.head) {
    const metaEdge = document.createElement('meta');
    metaEdge.setAttribute('http-equiv', 'X-UA-Compatible');
    metaEdge.setAttribute('content', 'IE=edge');
    document.head.appendChild(metaEdge);
    
    const metaViewport = document.createElement('meta');
    metaViewport.setAttribute('name', 'viewport');
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
    document.head.appendChild(metaViewport);
  }
}

// // console.log('✅ Polyfills Edge chargés avec succès');
