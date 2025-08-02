// Configuration de l'API avec compatibilité Edge
import { safeLocalStorage } from './edgeCompatibility';

// Configuration de l'URL de base selon l'environnement
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'http://api.pigeonfarm.com'; // URL de production
  }
  
  // En développement, utiliser HTTP et le port 3002
  const host = window.location.hostname;
  const port = process.env.VITE_API_PORT || '3002';
  
  return `http://${host}:${port}`;
};

const API_BASE_URL = getBaseURL();

// Configuration des headers par défaut
const getDefaultHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Ajouter le token d'authentification si disponible
  const token = safeLocalStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ajouter le token CSRF si disponible
  const csrfToken = safeLocalStorage.getItem('csrfToken');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
};

// Fonction pour gérer les erreurs de manière compatible avec Edge
const handleError = (error: any, url: string) => {
  console.error(`❌ Erreur API (${url}):`, error);
  
  // Gestion spécifique pour Edge
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    console.warn('⚠️ Problème de compatibilité Edge détecté');
    return {
      error: 'Problème de compatibilité avec le navigateur',
      details: 'Veuillez utiliser un navigateur plus récent ou activer JavaScript'
    };
  }
  
  return {
    error: error.message || 'Erreur de connexion',
    details: error.toString()
  };
};

// Fonction pour faire des requêtes API avec retry et compatibilité Edge
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
    credentials: 'include', // Important pour les cookies de session
  };

  // Configuration spécifique pour Edge
  if (process.env.EDGE_COMPATIBILITY === 'true') {
    // Utiliser des options plus compatibles avec Edge
    config.mode = 'cors';
    config.cache = 'no-cache';
  }

  try {
    const response = await fetch(url, config);
    
    // Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Vérifier le type de contenu
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    return handleError(error, url);
  }
};

// Fonctions API spécifiques
export const api = {
  // Authentification
  login: (credentials: { username: string; password: string }) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { username: string; email: string; password: string }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),

  // Méthodes d'authentification supplémentaires
  forgotPassword: (data: { email: string }) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyResetCode: (data: { email: string; code: string }) =>
    apiRequest('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyEmail: (data: { email: string }) =>
    apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendVerification: (data: { email: string }) =>
    apiRequest('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyToken: () =>
    apiRequest('/api/auth/verify', {
      method: 'GET',
    }),

  // CSRF
  getCSRFToken: () => apiRequest('/api/csrf-token'),

  // Profil utilisateur
  getProfile: () => apiRequest('/api/users/me'),
  updateProfile: (profileData: any) =>
    apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  deleteAccount: () =>
    apiRequest('/api/users/me', {
      method: 'DELETE',
    }),

  // Couples
  getCouples: () => apiRequest('/api/couples'),
  createCouple: (coupleData: any) =>
    apiRequest('/api/couples', {
      method: 'POST',
      body: JSON.stringify(coupleData),
    }),
  updateCouple: (id: number, coupleData: any) =>
    apiRequest(`/api/couples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupleData),
    }),
  deleteCouple: (id: number) =>
    apiRequest(`/api/couples/${id}`, {
      method: 'DELETE',
    }),

  // Œufs
  getEggs: () => apiRequest('/api/eggs'),
  createEgg: (eggData: any) =>
    apiRequest('/api/eggs', {
      method: 'POST',
      body: JSON.stringify(eggData),
    }),
  updateEgg: (id: number, eggData: any) =>
    apiRequest(`/api/eggs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eggData),
    }),
  deleteEgg: (id: number) =>
    apiRequest(`/api/eggs/${id}`, {
      method: 'DELETE',
    }),

  // Pigeonneaux
  getPigeonneaux: () => apiRequest('/api/pigeonneaux'),
  createPigeonneau: (pigeonneauData: any) =>
    apiRequest('/api/pigeonneaux', {
      method: 'POST',
      body: JSON.stringify(pigeonneauData),
    }),
  updatePigeonneau: (id: number, pigeonneauData: any) =>
    apiRequest(`/api/pigeonneaux/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pigeonneauData),
    }),
  deletePigeonneau: (id: number) =>
    apiRequest(`/api/pigeonneaux/${id}`, {
      method: 'DELETE',
    }),

  // Santé - Correction de la route
  getHealthRecords: () => apiRequest('/api/healthRecords'),
  createHealthRecord: (healthData: any) =>
    apiRequest('/api/healthRecords', {
      method: 'POST',
      body: JSON.stringify(healthData),
    }),
  updateHealthRecord: (id: number, healthData: any) =>
    apiRequest(`/api/healthRecords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    }),
  deleteHealthRecord: (id: number) =>
    apiRequest(`/api/healthRecords/${id}`, {
      method: 'DELETE',
    }),

  // Utilisateurs
  getUsers: () => apiRequest('/api/users'),
  createUser: (userData: any) =>
    apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id: number, userData: any) =>
    apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id: number) =>
    apiRequest(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Statistiques
  getStatistics: () => apiRequest('/api/statistics'),
  getStatisticsByPeriod: (period: string) =>
    apiRequest(`/api/statistics?period=${period}`),

  // Ventes
  createSale: (saleData: any) =>
    apiRequest('/api/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    }),

  // Exports
  exportData: (format: 'pdf' | 'excel' | 'csv', filters?: any) =>
    apiRequest(`/api/exports/${format}`, {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),

  // Backup
  createBackup: () =>
    apiRequest('/api/backup', {
      method: 'POST',
    }),
  restoreBackup: (backupData: any) =>
    apiRequest('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    }),

  // Notifications
  getNotifications: () => apiRequest('/api/notifications'),
  markNotificationAsRead: (id: number) =>
    apiRequest(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // Audit
  getAuditLogs: (filters?: any) =>
    apiRequest('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),

  // Santé du serveur
  healthCheck: () => apiRequest('/api/health'),
};

// Fonction pour tester la connectivité
export const testConnectivity = async () => {
  try {
    const response = await api.healthCheck();
    console.log('✅ Connectivité API OK:', response);
    return true;
  } catch (error) {
    console.error('❌ Problème de connectivité API:', error);
    return false;
  }
};

// Fonction pour initialiser l'API
export const initializeAPI = async () => {
  console.log('🌐 Initialisation de l\'API...');
  console.log('📍 URL de base:', API_BASE_URL);
  
  const isConnected = await testConnectivity();
  
  if (!isConnected) {
    console.warn('⚠️ Impossible de se connecter à l\'API');
    console.log('💡 Vérifiez que le serveur backend est démarré');
  }
  
  return isConnected;
};

export default api;