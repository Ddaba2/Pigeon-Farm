// Service API centralisé pour l'authentification par session
import { getSessionId, setSessionId, removeSessionId, isLocalStorageAvailable } from './cookies';
import { edgeLocalStorage } from './storageManager';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3002/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Récupérer le sessionId (compatible Edge)
    const sessionId = getSessionId();
    
    // Fallback: récupérer depuis localStorage si disponible
    let finalSessionId = sessionId;
    if (!finalSessionId && isLocalStorageAvailable()) {
      try {
        finalSessionId = edgeLocalStorage.getItem('sessionId');
      } catch (error) {
        // Erreur localStorage ignorée
      }
    }
    
    // Configuration par défaut pour l'authentification par session
    const defaultOptions: RequestInit = {
      credentials: 'include', // Inclure les cookies de session
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Pour la compatibilité Edge
        ...(finalSessionId && { 'x-session-id': finalSessionId }),
        ...options.headers,
      },
      ...options,
    };

    // Debug API désactivé

    try {
      // Utiliser fetch avec fallback XMLHttpRequest pour Edge Legacy
      let response: Response;
      
      if (window.fetch) {
        response = await fetch(url, defaultOptions);
      } else {
        // Fallback XMLHttpRequest pour Edge Legacy
        response = await this.xhrRequest(url, defaultOptions);
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentification requise');
        }
        throw new Error(`Erreur de requête: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Erreur API gérée silencieusement
      throw error;
    }
  }

  // Fallback XMLHttpRequest pour Edge Legacy
  private xhrRequest(url: string, options: RequestInit): Promise<Response> {
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
        reject(new Error('Erreur réseau XMLHttpRequest'));
      };
      
      xhr.ontimeout = () => {
        reject(new Error('Timeout XMLHttpRequest'));
      };
      
      // Envoyer la requête
      if (options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    });
  }

  // Authentification
  async register(userData: { username: string; email: string; password: string; fullName?: string; acceptTerms: boolean }) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'inscription');
    }

    const data = await response.json();
    return data;
  }

  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // Inclure les cookies de session
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Erreur de connexion');
    }

    const data = await response.json();
    
    // Stocker les informations utilisateur et sessionId
    if (data.success && data.user) {
      try {
        if (isLocalStorageAvailable()) {
          edgeLocalStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.sessionId) {
          setSessionId(data.sessionId);
          
          // Stocker aussi dans localStorage comme fallback
          if (isLocalStorageAvailable()) {
            try {
              edgeLocalStorage.setItem('sessionId', data.sessionId);
            } catch (error) {
              // Erreur localStorage ignorée
            }
          }
        }
      } catch (error) {
        // Erreur stockage ignorée
        // Continuer sans stockage local
      }
    }

    return data;
  }

  async logout() {
    try {
      // Appeler l'API de déconnexion
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Silencieux - pas de message de console
    } finally {
      // Nettoyer le stockage local
      try {
        if (isLocalStorageAvailable()) {
          edgeLocalStorage.removeItem('user');
        }
        removeSessionId();
      } catch (error) {
        // Erreur nettoyage ignorée
        // Continuer sans nettoyage
      }
    }
  }

  // Méthodes génériques CRUD
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Méthodes spécifiques pour le tableau de bord
  async getDashboardStats() {
    return this.get('/statistics/dashboard');
  }

  async getRecentActivities(limit: number = 10) {
    return this.get(`/statistics/recent-activities?limit=${limit}`);
  }

  // Méthodes pour la gestion des couples
  async getCouples() {
    return this.get('/couples');
  }

  async createCouple(coupleData: any) {
    return this.post('/couples', coupleData);
  }

  async updateCouple(id: number, coupleData: any) {
    return this.put(`/couples/${id}`, coupleData);
  }

  async deleteCouple(id: number) {
    return this.delete(`/couples/${id}`);
  }

  // Méthodes pour la gestion des œufs
  async getEggs() {
    return this.get('/eggs');
  }

  async createEgg(eggData: any) {
    return this.post('/eggs', eggData);
  }

  async updateEgg(id: number, eggData: any) {
    return this.put(`/eggs/${id}`, eggData);
  }

  async deleteEgg(id: number) {
    return this.delete(`/eggs/${id}`);
  }

  // Méthodes pour la gestion des pigeonneaux
  async getPigeonneaux() {
    return this.get('/pigeonneaux');
  }

  async createPigeonneau(pigeonneauData: any) {
    return this.post('/pigeonneaux', pigeonneauData);
  }

  async updatePigeonneau(id: number, pigeonneauData: any) {
    return this.put(`/pigeonneaux/${id}`, pigeonneauData);
  }

  async deletePigeonneau(id: number) {
    return this.delete(`/pigeonneaux/${id}`);
  }

  // Méthodes pour la gestion de la santé
  async getHealthRecords() {
    return this.get('/health-records');
  }

  async createHealthRecord(healthData: any) {
    return this.post('/health-records', healthData);
  }

  async updateHealthRecord(id: number, healthData: any) {
    return this.put(`/health-records/${id}`, healthData);
  }

  async deleteHealthRecord(id: number) {
    return this.delete(`/health-records/${id}`);
  }

  // Méthodes pour la gestion des ventes
  async getSales() {
    return this.get('/sales');
  }

  async createSale(saleData: any) {
    return this.post('/sales', saleData);
  }

  async updateSale(id: number, saleData: any) {
    return this.put(`/sales/${id}`, saleData);
  }

  async deleteSale(id: number) {
    return this.delete(`/sales/${id}`);
  }

  // Méthodes pour la gestion des utilisateurs
  async getUsers() {
    return this.get('/users');
  }

  async createUser(userData: any) {
    return this.post('/users', userData);
  }

  async updateUser(id: number, userData: any) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id: number) {
    return this.delete(`/users/${id}`);
  }

  // Méthodes pour la gestion du profil
  async getProfile() {
    return this.get('/profile');
  }

  async updateProfile(profileData: any) {
    return this.put('/profile', profileData);
  }

  async changePassword(passwordData: any) {
    return this.post('/profile/change-password', passwordData);
  }

  // Méthodes pour la sécurité
  async verifyEmail(token: string) {
    return this.post('/auth/verify-email', { token });
  }

  async resendVerification(email: string) {
    return this.post('/auth/resend-verification', { email });
  }

  async getCSRFToken() {
    return this.get('/auth/csrf-token');
  }

  // Méthodes de récupération de mot de passe
  async forgotPassword(email: string) {
    return this.post('/forgot-password', { email });
  }

  async verifyResetCode(email: string, code: string) {
    return this.post('/verify-reset-code', { email, code });
  }

  async resetPassword(data: { email: string; code: string; newPassword: string }) {
    return this.post('/reset-password', data);
  }
}

// Instance unique du service API
const apiService = new ApiService();

export default apiService;

// Fonctions utilitaires
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Gestion des erreurs
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Validation des données
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} est requis`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Format de téléphone invalide';
  }
  return null;
};

// ========== MÉTHODES D'ADMINISTRATION ==========

// Récupérer les statistiques d'administration
export const getAdminStats = async () => {
  return apiService.get('/admin/stats');
};

// Récupérer tous les utilisateurs pour l'admin
export const getAllUsersForAdmin = async () => {
  return apiService.get('/admin/users');
};

// Récupérer les utilisateurs récents
export const getRecentUsers = async (limit = 10) => {
  return apiService.get(`/admin/users/recent?limit=${limit}`);
};

// Bloquer un utilisateur
export const blockUser = async (userId: number) => {
  return apiService.put(`/admin/users/${userId}/block`, {});
};

// Débloquer un utilisateur
export const unblockUser = async (userId: number) => {
  return apiService.put(`/admin/users/${userId}/unblock`, {});
};

// Supprimer un utilisateur
export const deleteUserAdmin = async (userId: number) => {
  return apiService.delete(`/admin/users/${userId}`);
};

// ========== MÉTHODES DE PROFIL UTILISATEUR ==========

// Récupérer le profil de l'utilisateur connecté
export const getUserProfile = async () => {
  return apiService.get('/users/profile/me');
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (profileData: any) => {
  return apiService.put('/users/profile/me', profileData);
};

// Changer le mot de passe
export const changeUserPassword = async (passwordData: any) => {
  return apiService.put('/users/profile/me/password', passwordData);
};

// Mettre à jour l'avatar
export const updateUserAvatar = async (avatarUrl: string) => {
  return apiService.put('/users/profile/me/avatar', { avatarUrl });
};

// Supprimer le compte utilisateur
export const deleteUserAccount = async (password: string, confirmDelete: string) => {
  return apiService.delete('/users/profile/me', { password, confirmDelete });
};

// ========== MÉTHODES DE NOTIFICATIONS ==========

// Récupérer toutes les notifications
export const getNotifications = async (limit = 50, offset = 0) => {
  return apiService.get(`/notifications?limit=${limit}&offset=${offset}`);
};

// Récupérer les notifications non lues
export const getUnreadNotifications = async () => {
  return apiService.get('/notifications/unread');
};

// Compter les notifications non lues
export const getNotificationCount = async () => {
  return apiService.get('/notifications/count');
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: number) => {
  return apiService.put(`/notifications/${notificationId}/read`);
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async () => {
  return apiService.put('/notifications/read-all');
};

// Supprimer une notification
export const deleteNotification = async (notificationId: number) => {
  return apiService.delete(`/notifications/${notificationId}`);
};

// Supprimer toutes les notifications lues
export const deleteReadNotifications = async () => {
  return apiService.delete('/notifications/read');
};

// Créer une notification (admin seulement)
export const createNotification = async (userId: number, title: string, message: string, type = 'info') => {
  return apiService.post('/notifications', { userId, title, message, type });
};

// ========== EXPORT DU SERVICE ==========

// ========== EXPORT NOMÉ DU SERVICE ==========

// Exporter apiService comme export nommé pour compatibilité
export { apiService };