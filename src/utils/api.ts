// Configuration de l'API pour PigeonFarm
const API_BASE_URL = 'http://localhost:3002/api';

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Classe principale pour les appels API
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem('token');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Méthodes pour les couples
  async getCouples(): Promise<ApiResponse<any>> {
    return this.request('/couples');
  }

  async createCouple(coupleData: any): Promise<ApiResponse<any>> {
    return this.request('/couples', {
      method: 'POST',
      body: JSON.stringify(coupleData),
    });
  }

  async updateCouple(id: number, coupleData: any): Promise<ApiResponse<any>> {
    return this.request(`/couples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupleData),
    });
  }

  async deleteCouple(id: number): Promise<ApiResponse<any>> {
    return this.request(`/couples/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour les œufs
  async getEggs(): Promise<ApiResponse<any>> {
    return this.request('/eggs');
  }

  async createEgg(eggData: any): Promise<ApiResponse<any>> {
    return this.request('/eggs', {
      method: 'POST',
      body: JSON.stringify(eggData),
    });
  }

  async updateEgg(id: number, eggData: any): Promise<ApiResponse<any>> {
    return this.request(`/eggs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eggData),
    });
  }

  async deleteEgg(id: number): Promise<ApiResponse<any>> {
    return this.request(`/eggs/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour les pigeonneaux
  async getPigeonneaux(): Promise<ApiResponse<any>> {
    return this.request('/pigeonneaux');
  }

  async createPigeonneau(pigeonneauData: any): Promise<ApiResponse<any>> {
    return this.request('/pigeonneaux', {
      method: 'POST',
      body: JSON.stringify(pigeonneauData),
    });
  }

  async updatePigeonneau(id: number, pigeonneauData: any): Promise<ApiResponse<any>> {
    return this.request(`/pigeonneaux/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pigeonneauData),
    });
  }

  async deletePigeonneau(id: number): Promise<ApiResponse<any>> {
    return this.request(`/pigeonneaux/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour la santé
  async getHealthRecords(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  async createHealthRecord(healthData: any): Promise<ApiResponse<any>> {
    return this.request('/health', {
      method: 'POST',
      body: JSON.stringify(healthData),
    });
  }

  async updateHealthRecord(id: number, healthData: any): Promise<ApiResponse<any>> {
    return this.request(`/health/${id}`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
  }

  async deleteHealthRecord(id: number): Promise<ApiResponse<any>> {
    return this.request(`/health/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour les statistiques
  async getStatistics(): Promise<ApiResponse<any>> {
    return this.request('/statistics');
  }

  async getStatisticsByPeriod(period: string): Promise<ApiResponse<any>> {
    return this.request(`/statistics?period=${period}`);
  }

  // Méthodes pour le tableau de bord
  async getDashboardData(): Promise<ApiResponse<any>> {
    return this.request('/dashboard');
  }

  // Méthodes pour les utilisateurs
  async getUsers(): Promise<ApiResponse<any>> {
    return this.request('/users');
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes d'authentification
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Méthodes pour la réinitialisation de mot de passe
  async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Méthodes pour la sauvegarde/restauration (admin seulement)
  async createBackup(): Promise<ApiResponse<any>> {
    return this.request('/backup', {
      method: 'POST',
    });
  }

  async restoreBackup(backupData: any): Promise<ApiResponse<any>> {
    return this.request('/backup/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  }

  async getBackups(): Promise<ApiResponse<any>> {
    return this.request('/backup');
  }
}

// Instance exportée de l'API client
export const api = new ApiClient(API_BASE_URL);

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