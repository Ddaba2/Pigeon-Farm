// Utilitaire pour gérer les cookies côté client (compatible Edge)
import { edgeLocalStorage, isEdgeLocalStorageAvailable } from './storageManager';

export const getCookie = (name: string): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  } catch (error) {
    console.warn('Erreur lors de la lecture du cookie:', error);
    return null;
  }
};

export const setCookie = (name: string, value: string, days: number = 1): void => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Configuration compatible Edge avec fallbacks
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
    
    // Essayer d'abord avec SameSite=Lax
    document.cookie = cookieString;
    
    // Vérifier si le cookie a été défini
    if (!document.cookie.includes(`${name}=${value}`)) {
      // Fallback sans SameSite pour Edge Legacy
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
      console.log(`🍪 Cookie ${name} défini avec fallback Edge`);
    } else {
      console.log(`🍪 Cookie ${name} défini avec SameSite=Lax`);
    }
  } catch (error) {
    console.warn('Erreur lors de l\'écriture du cookie:', error);
  }
};

export const removeCookie = (name: string): void => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.warn('Erreur lors de la suppression du cookie:', error);
  }
};

// Fonction pour vérifier si localStorage est disponible (utilise notre gestionnaire Edge)
export const isLocalStorageAvailable = (): boolean => {
  return isEdgeLocalStorageAvailable();
};

// Fonction pour obtenir le sessionId (priorité: localStorage, puis cookie)
export const getSessionId = (): string | null => {
  if (isLocalStorageAvailable()) {
    try {
      return edgeLocalStorage.getItem('sessionId');
    } catch {
      // Fallback vers cookie
    }
  }
  return getCookie('sessionId');
};

// Fonction pour stocker le sessionId (priorité: localStorage, puis cookie)
export const setSessionId = (sessionId: string): void => {
  if (isLocalStorageAvailable()) {
    try {
      edgeLocalStorage.setItem('sessionId', sessionId);
      return;
    } catch {
      // Fallback vers cookie
    }
  }
  setCookie('sessionId', sessionId, 1);
};

// Fonction pour supprimer le sessionId
export const removeSessionId = (): void => {
  if (isLocalStorageAvailable()) {
    try {
      edgeLocalStorage.removeItem('sessionId');
    } catch {
      // Fallback vers cookie
    }
  }
  removeCookie('sessionId');
};
