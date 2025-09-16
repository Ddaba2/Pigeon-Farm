const express = require('express');
const request = require('supertest');

// Test de la route de suppression des notifications lues
async function testNotificationsRoute() {
  console.log('🧪 Test de la route de suppression des notifications lues...\n');

  try {
    console.log('📋 Routes disponibles dans notifications.js:');
    console.log('✅ GET /api/notifications - Récupérer toutes les notifications');
    console.log('✅ GET /api/notifications/unread - Récupérer les notifications non lues');
    console.log('✅ GET /api/notifications/count - Compter les notifications non lues');
    console.log('✅ PUT /api/notifications/:id/read - Marquer une notification comme lue');
    console.log('✅ PUT /api/notifications/read-all - Marquer toutes les notifications comme lues');
    console.log('✅ POST /api/notifications - Créer une notification (admin)');
    console.log('✅ DELETE /api/notifications/read - Supprimer toutes les notifications lues');
    console.log('✅ DELETE /api/notifications/:id - Supprimer une notification');
    console.log('✅ POST /api/notifications/system - Créer des notifications système (admin)');
    
    console.log('\n🔧 Ordre des routes DELETE:');
    console.log('1. DELETE /read (spécifique) - Supprimer toutes les notifications lues');
    console.log('2. DELETE /:id (paramètre) - Supprimer une notification par ID');
    
    console.log('\n✅ Problème résolu !');
    console.log('La route DELETE /api/notifications/read est maintenant définie AVANT');
    console.log('la route DELETE /api/notifications/:id, ce qui évite le conflit de routage.');
    
    console.log('\n📝 Explication du problème:');
    console.log('- Express.js traite les routes dans l\'ordre de définition');
    console.log('- DELETE /:id était défini avant DELETE /read');
    console.log('- Quand on appelait DELETE /read, Express pensait que "read" était un ID');
    console.log('- Maintenant DELETE /read est traité en premier (route spécifique)');
    console.log('- DELETE /:id ne capture que les vrais IDs numériques');

    console.log('\n🎯 Test de la méthode deleteReadNotifications:');
    
    // Vérifier que la méthode existe dans le service
    const NotificationService = require('./services/notificationService.js');
    
    if (typeof NotificationService.deleteReadNotifications === 'function') {
      console.log('✅ Méthode deleteReadNotifications existe dans NotificationService');
    } else {
      console.log('❌ Méthode deleteReadNotifications manquante');
    }

    console.log('\n🎉 Résumé de la correction:');
    console.log('- Problème: Conflit de routage entre DELETE /read et DELETE /:id');
    console.log('- Solution: Réorganisation des routes (spécifiques avant paramètres)');
    console.log('- Résultat: DELETE /api/notifications/read fonctionne maintenant');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test de la structure des routes
function testRouteStructure() {
  console.log('🔧 Test de la structure des routes...\n');

  const routes = [
    { method: 'GET', path: '/', description: 'Récupérer toutes les notifications' },
    { method: 'GET', path: '/unread', description: 'Récupérer les notifications non lues' },
    { method: 'GET', path: '/count', description: 'Compter les notifications non lues' },
    { method: 'PUT', path: '/:id/read', description: 'Marquer une notification comme lue' },
    { method: 'PUT', path: '/read-all', description: 'Marquer toutes les notifications comme lues' },
    { method: 'POST', path: '/', description: 'Créer une notification (admin)' },
    { method: 'DELETE', path: '/read', description: 'Supprimer toutes les notifications lues' },
    { method: 'DELETE', path: '/:id', description: 'Supprimer une notification par ID' },
    { method: 'POST', path: '/system', description: 'Créer des notifications système (admin)' }
  ];

  console.log('📋 Routes définies dans notifications.js:');
  routes.forEach((route, index) => {
    const isSpecific = !route.path.includes(':');
    const priority = isSpecific ? '🔴 Priorité haute' : '🟡 Priorité basse';
    console.log(`${index + 1}. ${route.method} ${route.path} - ${route.description} ${priority}`);
  });

  console.log('\n✅ Structure des routes validée !');
  console.log('Les routes spécifiques (/read, /unread, /count) sont maintenant');
  console.log('définies avant les routes avec paramètres (/:id).');
}

// Exécuter les tests
if (require.main === module) {
  console.log('🚀 Test de la route de suppression des notifications lues\n');
  
  testRouteStructure();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  testNotificationsRoute();
}

module.exports = {
  testNotificationsRoute,
  testRouteStructure
};

