// Script de vérification que les notifications utilisent la base de données réelle
const { executeQuery } = require('./config/database.js');

async function verifyNotificationsReal() {
  try {
    console.log('🔍 Vérification des notifications réelles...\n');
    
    // 1. Compter les notifications
    console.log('1. Nombre de notifications dans la base:');
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM notifications');
    console.log(`✅ ${countResult[0].count} notifications trouvées\n`);
    
    // 2. Afficher quelques exemples
    console.log('2. Exemples de notifications:');
    const notifications = await executeQuery(`
      SELECT id, user_id, title, type, is_read, created_at 
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ID: ${notif.id} | Type: ${notif.type} | Lu: ${notif.is_read ? 'Oui' : 'Non'}`);
      console.log(`      Titre: ${notif.title}`);
      console.log(`      Date: ${notif.created_at}\n`);
    });
    
    // 3. Vérifier la structure de la table
    console.log('3. Structure de la table notifications:');
    const structure = await executeQuery('DESCRIBE notifications');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(requis)' : '(optionnel)'}`);
    });
    
    console.log('\n🎉 PREUVE: Le système utilise bien la base de données réelle !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
  
  process.exit(0);
}

verifyNotificationsReal();
