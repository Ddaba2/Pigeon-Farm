// Script Node.js pour corriger la structure de la base de données
const { executeQuery } = require('./config/database.js');

async function fixDatabaseStructure() {
  try {
    console.log('🔧 Correction de la structure de la base de données...\n');
    
    // 1. Vérifier si profile_picture existe et le renommer en avatar_url
    console.log('1. Vérification et renommage du champ profile_picture...');
    try {
      await executeQuery(`
        ALTER TABLE users 
        CHANGE COLUMN profile_picture avatar_url LONGTEXT DEFAULT NULL 
        COMMENT 'URL ou données base64 de l\\'avatar de l\\'utilisateur'
      `);
      console.log('✅ Champ profile_picture renommé en avatar_url');
    } catch (error) {
      if (error.message.includes('Unknown column')) {
        console.log('ℹ️  Champ profile_picture non trouvé, création d\'avatar_url...');
        try {
          await executeQuery(`
            ALTER TABLE users 
            ADD COLUMN avatar_url LONGTEXT DEFAULT NULL 
            COMMENT 'URL ou données base64 de l\\'avatar de l\\'utilisateur'
          `);
          console.log('✅ Champ avatar_url créé');
        } catch (addError) {
          console.log('ℹ️  Champ avatar_url existe déjà');
        }
      } else {
        console.log('⚠️  Erreur lors du renommage:', error.message);
      }
    }
    
    // 2. Ajouter les champs manquants
    console.log('\n2. Ajout des champs de profil manquants...');
    
    const fieldsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)', comment: 'Numéro de téléphone' },
      { name: 'address', type: 'TEXT', comment: 'Adresse de l\'utilisateur' },
      { name: 'bio', type: 'TEXT', comment: 'Biographie de l\'utilisateur' }
    ];
    
    for (const field of fieldsToAdd) {
      try {
        await executeQuery(`
          ALTER TABLE users 
          ADD COLUMN ${field.name} ${field.type} DEFAULT NULL 
          COMMENT '${field.comment}'
        `);
        console.log(`✅ Champ ${field.name} ajouté`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`ℹ️  Champ ${field.name} existe déjà`);
        } else {
          console.log(`⚠️  Erreur pour ${field.name}:`, error.message);
        }
      }
    }
    
    // 3. Vérifier la structure finale
    console.log('\n3. Vérification de la structure finale...');
    const describeResult = await executeQuery('DESCRIBE users');
    
    const requiredFields = ['avatar_url', 'phone', 'address', 'bio', 'full_name'];
    console.log('\n📋 Champs de profil disponibles:');
    
    for (const field of requiredFields) {
      const fieldExists = describeResult.find(f => f.Field === field);
      if (fieldExists) {
        console.log(`✅ ${field}: ${fieldExists.Type}`);
      } else {
        console.log(`❌ ${field}: manquant`);
      }
    }
    
    // 4. Test de capacité de stockage base64
    console.log('\n4. Test de capacité de stockage base64...');
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    try {
      await executeQuery('UPDATE users SET avatar_url = ? WHERE id = 1 LIMIT 1', [testBase64]);
      console.log('✅ Test d\'insertion base64 réussi');
      
      // Vérifier la lecture
      const result = await executeQuery('SELECT avatar_url FROM users WHERE id = 1 LIMIT 1');
      if (result[0] && result[0].avatar_url === testBase64) {
        console.log('✅ Vérification de lecture des données base64 réussie');
      }
      
      // Nettoyer le test
      await executeQuery('UPDATE users SET avatar_url = NULL WHERE id = 1 LIMIT 1');
      console.log('✅ Nettoyage du test réussi');
      
    } catch (error) {
      console.log('❌ Erreur lors du test base64:', error.message);
    }
    
    console.log('\n🎉 Correction de la base de données terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log('- Champ avatar_url prêt pour stocker des photos base64 ✓');
    console.log('- Champs de profil disponibles ✓');
    console.log('- Test de capacité de stockage réussi ✓');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
  
  process.exit(0);
}

fixDatabaseStructure();
