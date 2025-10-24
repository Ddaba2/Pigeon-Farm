/**
 * Service de notifications push pour PigeonFarm
 */

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class PushNotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
    this.requestPermission();
  }

  /**
   * Vérifie si les notifications sont supportées
   */
  private checkSupport(): void {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    if (!this.isSupported) {
      console.warn('Notifications push non supportées par ce navigateur');
    }
  }

  /**
   * Demande la permission pour les notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('Permission notifications:', this.permission);
      return this.permission;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return 'denied';
    }
  }

  /**
   * Vérifie si les notifications sont autorisées
   */
  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Affiche une notification
   */
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.isSupported || !this.isPermissionGranted()) {
      console.warn('Notifications non autorisées ou non supportées');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png',
        badge: data.badge || '/9abe145e-9bbd-4752-bc24-37264081befe-removebg-preview.png',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
      });

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Gérer les clics sur la notification
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Rediriger vers la page appropriée si nécessaire
        if (data.data?.url) {
          window.location.href = data.data.url;
        }
      };

    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
    }
  }

  /**
   * Notifications spécifiques pour PigeonFarm
   */
  
  // Alerte d'éclosion imminente
  async notifyHatchingSoon(coupleName: string, daysLeft: number): Promise<void> {
    await this.showNotification({
      title: '🐣 Éclosion imminente !',
      body: `Les œufs du couple ${coupleName} devraient éclore dans ${daysLeft} jour(s)`,
      tag: 'hatching-soon',
      data: { url: '/#eggs' },
      requireInteraction: true
    });
  }

  // Alerte d'éclosion
  async notifyHatching(coupleName: string, eggNumber: number): Promise<void> {
    await this.showNotification({
      title: '🎉 Éclosion réussie !',
      body: `L'œuf ${eggNumber} du couple ${coupleName} a éclos !`,
      tag: 'hatching',
      data: { url: '/#pigeonneaux' },
      requireInteraction: true
    });
  }

  // Alerte de vaccination
  async notifyVaccination(pigeonName: string, vaccineType: string): Promise<void> {
    await this.showNotification({
      title: '💉 Vaccination requise',
      body: `${pigeonName} doit recevoir le vaccin ${vaccineType}`,
      tag: 'vaccination',
      data: { url: '/#health' },
      requireInteraction: true
    });
  }

  // Alerte de vente
  async notifySale(pigeonName: string, price: number): Promise<void> {
    await this.showNotification({
      title: '💰 Vente enregistrée',
      body: `${pigeonName} vendu pour ${price.toLocaleString('fr-FR')} XOF`,
      tag: 'sale',
      data: { url: '/#statistics' }
    });
  }

  // Alerte de santé
  async notifyHealthAlert(pigeonName: string, issue: string): Promise<void> {
    await this.showNotification({
      title: '⚠️ Alerte santé',
      body: `${pigeonName}: ${issue}`,
      tag: 'health-alert',
      data: { url: '/#health' },
      requireInteraction: true
    });
  }

  // Alerte de reproduction
  async notifyBreeding(coupleName: string): Promise<void> {
    await this.showNotification({
      title: '💕 Nouvelle ponte',
      body: `Le couple ${coupleName} a pondu de nouveaux œufs !`,
      tag: 'breeding',
      data: { url: '/#eggs' },
      requireInteraction: true
    });
  }

  // Alerte de rappel général
  async notifyReminder(title: string, message: string, url?: string): Promise<void> {
    await this.showNotification({
      title: `🔔 ${title}`,
      body: message,
      tag: 'reminder',
      data: { url: url || '/' }
    });
  }

  /**
   * Test de notification
   */
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🧪 Test de notification',
      body: 'Les notifications push fonctionnent correctement !',
      tag: 'test',
      requireInteraction: true
    });
  }
}

// Instance singleton
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
