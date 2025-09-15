/**
 * Script pour supprimer tous les JWT côté client
 * Supprime tous les tokens stockés dans localStorage et sessionStorage
 */

// Fonction pour supprimer tous les JWT du localStorage
export const clearLocalStorageJWT = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Parcourir toutes les clés du localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Supprimer toutes les clés liées aux JWT et à l'authentification
        if (
          key.includes('token') ||
          key.includes('jwt') ||
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('user') ||
          key.includes('login') ||
          key === 'pigeon_user' ||
          key === 'pigeon_token' ||
          key === 'pigeon_session'
        ) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Supprimer les clés identifiées
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`✅ ${keysToRemove.length} éléments JWT supprimés du localStorage`);
    return;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du localStorage:', error);
  }
};

// Fonction pour supprimer tous les JWT du sessionStorage
export const clearSessionStorageJWT = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Parcourir toutes les clés du sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        // Supprimer toutes les clés liées aux JWT et à l'authentification
        if (
          key.includes('token') ||
          key.includes('jwt') ||
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('user') ||
          key.includes('login') ||
          key === 'pigeon_user' ||
          key === 'pigeon_token' ||
          key === 'pigeon_session'
        ) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Supprimer les clés identifiées
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log(`✅ ${keysToRemove.length} éléments JWT supprimés du sessionStorage`);
    return;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du sessionStorage:', error);
  }
};

// Fonction pour supprimer tous les cookies liés aux JWT
export const clearJWTCookies = (): void => {
  try {
    // Liste des cookies liés aux JWT à supprimer
    const jwtCookies = [
      'token',
      'jwt',
      'auth_token',
      'session_token',
      'user_token',
      'pigeon_token',
      'pigeon_session',
      'pigeon_auth'
    ];
    
    // Supprimer chaque cookie
    jwtCookies.forEach(cookieName => {
      // Supprimer le cookie pour le domaine actuel
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    });
    
    console.log(`✅ ${jwtCookies.length} cookies JWT supprimés`);
    return;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des cookies:', error);
  }
};

// Fonction principale pour supprimer tous les JWT
export const clearAllJWT = (): void => {
  console.log('🗑️ SUPPRESSION DE TOUS LES JWT CÔTÉ CLIENT');
  console.log('===========================================');
  
  clearLocalStorageJWT();
  clearSessionStorageJWT();
  clearJWTCookies();
  
  console.log('✅ Tous les JWT côté client ont été supprimés !');
  console.log('⚠️ Vous devrez vous reconnecter');
  
  // Rediriger vers la page de connexion
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
};

// Fonction pour supprimer complètement tout le stockage (optionnel)
export const clearAllStorage = (): void => {
  console.log('🗑️ SUPPRESSION COMPLÈTE DU STOCKAGE');
  console.log('====================================');
  
  try {
    // Vider complètement localStorage
    localStorage.clear();
    console.log('✅ localStorage vidé complètement');
    
    // Vider complètement sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage vidé complètement');
    
    // Supprimer tous les cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    console.log('✅ Tous les cookies supprimés');
    
    console.log('✅ Stockage complètement vidé !');
    console.log('⚠️ Vous devrez vous reconnecter');
    
    // Rediriger vers la page de connexion
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression complète:', error);
  }
};

// Export par défaut
export default clearAllJWT;
