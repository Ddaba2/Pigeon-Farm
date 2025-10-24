// Service Worker pour les notifications push PigeonFarm

const CACHE_NAME = 'pigeonfarm-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si disponible
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notification push reçue');
  
  let notificationData = {
    title: 'PigeonFarm',
    body: 'Nouvelle alerte disponible',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'pigeonfarm-alert',
    data: {}
  };

  // Si des données sont fournies avec la notification
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.message || notificationData.body,
        tag: pushData.id || notificationData.tag,
        data: pushData.data || {}
      };
    } catch (error) {
      console.error('Erreur lors du parsing des données push:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );

  // Notifier l'application principale
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        notification: notificationData
      });
    });
  });
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clic sur notification');
  
  event.notification.close();

  if (event.action === 'dismiss') {
    // Marquer la notification comme ignorée
    return;
  }

  // Ouvrir l'application
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si l'application est déjà ouverte, la mettre au premier plan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );

  // Marquer la notification comme lue
  if (event.notification.data && event.notification.data.id) {
    fetch('/api/alerts/push/' + event.notification.data.id + '/read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    }).catch((error) => {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    });
  }
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification fermée');
  
  // Optionnel: tracker les notifications fermées sans interaction
  if (event.notification.data && event.notification.data.id) {
    // Logique pour tracker les notifications fermées
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('Service Worker: Erreur', event.error);
});

// Gestion des messages depuis l'application principale
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Logique de synchronisation
      console.log('Service Worker: Synchronisation en arrière-plan')
    );
  }
});
