import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Settings, AlertTriangle } from 'lucide-react';

interface PushNotificationManagerProps {
  onNotificationReceived?: (notification: any) => void;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ 
  onNotificationReceived 
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Vérifier le support des notifications push
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Demander la permission pour les notifications
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPushNotifications();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }, [isSupported]);

  // S'abonner aux notifications push
  const subscribeToPushNotifications = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return;

    try {
      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Obtenir l'abonnement push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      setSubscription(pushSubscription);
      setIsEnabled(true);

      // Envoyer l'abonnement au serveur
      await sendSubscriptionToServer(pushSubscription);
      
      console.log('✅ Abonnement aux notifications push réussi');
    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement aux notifications push:', error);
    }
  }, [isSupported, permission]);

  // Se désabonner des notifications push
  const unsubscribeFromPushNotifications = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsEnabled(false);
      
      // Notifier le serveur du désabonnement
      await removeSubscriptionFromServer();
      
      console.log('✅ Désabonnement des notifications push réussi');
    } catch (error) {
      console.error('❌ Erreur lors du désabonnement:', error);
    }
  }, [subscription]);

  // Envoyer l'abonnement au serveur
  const sendSubscriptionToServer = async (pushSubscription: PushSubscription) => {
    try {
      const response = await fetch('/api/alerts/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'abonnement au serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'abonnement:', error);
    }
  };

  // Supprimer l'abonnement du serveur
  const removeSubscriptionFromServer = async () => {
    try {
      await fetch('/api/alerts/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'abonnement:', error);
    }
  };

  // Convertir ArrayBuffer en base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Afficher une notification locale
  const showLocalNotification = useCallback((title: string, options: NotificationOptions) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Fermer automatiquement après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }, [permission]);

  // Gérer les notifications reçues
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
          const notification = event.data.notification;
          
          // Afficher la notification locale
          showLocalNotification(notification.title, {
            body: notification.message,
            tag: notification.id,
            data: notification.data
          });

          // Notifier le composant parent
          if (onNotificationReceived) {
            onNotificationReceived(notification);
          }
        }
      });
    }
  }, [showLocalNotification, onNotificationReceived]);

  // Tester les notifications
  const testNotification = () => {
    showLocalNotification('Test PigeonFarm', {
      body: 'Ceci est une notification de test pour vérifier que les notifications push fonctionnent correctement.',
      tag: 'test-notification'
    });
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <BellOff className="h-4 w-4" />
        <span className="text-sm">Notifications push non supportées</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {permission === 'granted' ? (
        <>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Notifications activées</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={testNotification}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Tester
            </button>
            
            <button
              onClick={unsubscribeFromPushNotifications}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Désactiver
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-2">
          <BellOff className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Notifications désactivées</span>
          
          <button
            onClick={requestPermission}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Activer
          </button>
        </div>
      )}
      
      {permission === 'denied' && (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">
            Permissions refusées. Activez-les dans les paramètres du navigateur.
          </span>
        </div>
      )}
    </div>
  );
};

export default PushNotificationManager;
