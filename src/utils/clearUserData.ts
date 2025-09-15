/**
 * Script pour nettoyer complètement les données utilisateur
 * et résoudre les problèmes de session/cache
 */

// Fonction pour nettoyer complètement le stockage
export const clearAllUserData = (): void => {
  console.log('🧹 NETTOYAGE COMPLET DES DONNÉES UTILISATEUR');
  console.log('===========================================');
  
  try {
    // 1. Nettoyer localStorage
    if (typeof localStorage !== 'undefined') {
      const localStorageKeys = Object.keys(localStorage);
      console.log(`🗑️ Suppression de ${localStorageKeys.length} éléments du localStorage`);
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.clear();
      console.log('✅ localStorage vidé');
    }

    // 2. Nettoyer sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionStorageKeys = Object.keys(sessionStorage);
      console.log(`🗑️ Suppression de ${sessionStorageKeys.length} éléments du sessionStorage`);
      
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      sessionStorage.clear();
      console.log('✅ sessionStorage vidé');
    }

    // 3. Nettoyer les cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(";");
      console.log(`🗑️ Suppression de ${cookies.length} cookies`);
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Supprimer le cookie pour tous les chemins et domaines
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      });
      console.log('✅ Cookies supprimés');
    }

    console.log('✅ NETTOYAGE TERMINÉ !');
    console.log('======================');
    console.log('🔄 Rechargez la page pour appliquer les changements');
    
    // Rediriger vers la page de connexion
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

// Fonction pour vérifier les données utilisateur actuelles
export const checkUserData = (): void => {
  console.log('🔍 VÉRIFICATION DES DONNÉES UTILISATEUR');
  console.log('======================================');
  
  try {
    // Vérifier localStorage
    if (typeof localStorage !== 'undefined') {
      const userData = localStorage.getItem('user');
      const sessionData = localStorage.getItem('sessionId');
      
      console.log('📦 localStorage:');
      console.log(`   user: ${userData ? 'Présent' : 'Absent'}`);
      console.log(`   sessionId: ${sessionData ? 'Présent' : 'Absent'}`);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log(`   Données utilisateur:`, user);
        } catch (e) {
          console.log(`   Données utilisateur: Corrompues`);
        }
      }
    }

    // Vérifier sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionUserData = sessionStorage.getItem('user');
      console.log('📦 sessionStorage:');
      console.log(`   user: ${sessionUserData ? 'Présent' : 'Absent'}`);
    }

    // Vérifier les cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      console.log('🍪 Cookies:');
      console.log(`   Contenu: ${cookies || 'Aucun cookie'}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
};

// Fonction pour forcer la reconnexion admin
export const forceAdminLogin = (): void => {
  console.log('🔑 FORÇAGE DE LA CONNEXION ADMIN');
  console.log('===============================');
  
  try {
    // Nettoyer d'abord
    clearAllUserData();
    
    // Attendre un peu puis rediriger vers la connexion
    setTimeout(() => {
      console.log('🔄 Redirection vers la page de connexion...');
      window.location.href = '/';
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erreur lors du forçage de connexion:', error);
  }
};

// Export par défaut
export default clearAllUserData;
