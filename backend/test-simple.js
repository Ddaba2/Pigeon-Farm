import { executeQuery } from './config/database.js';

async function testSimple() {
  console.log('🧪 Test simple de création de couple...\n');

  try {
    // Test direct avec la base de données
    const coupleData = {
      name: 'Couple Test Simple',
      male: 'Mâle Test',
      female: 'Femelle Test',
      status: 'actif',
      breed: 'Race Test',
      date_formation: '2024-01-01',
      notes: 'Test simple',
      userId: 4  // ID de l'admin
    };

    console.log('📝 Données à insérer:', coupleData);

    const sql = `
      INSERT INTO couples (name, male, female, status, breed, date_formation, notes, user_id, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(sql, [
      coupleData.name, 
      coupleData.male, 
      coupleData.female, 
      coupleData.status, 
      coupleData.breed, 
      coupleData.date_formation, 
      coupleData.notes, 
      coupleData.userId
    ]);

    console.log('✅ Insertion réussie:', result);

    // Vérifier que le couple a été créé
    const checkResult = await executeQuery('SELECT * FROM couples WHERE name = ?', [coupleData.name]);
    console.log('🔍 Couple trouvé:', checkResult);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testSimple(); 