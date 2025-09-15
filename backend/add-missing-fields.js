// Script pour ajouter les champs manquants address et bio
const { executeQuery } = require('./config/database.js');

async function addMissingFields() {
  try {
    console.log('🔧 Ajout des champs manquants...\n');
    
    // Ajouter le champ address
    try {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN address TEXT DEFAULT NULL
      `);
      console.log('✅ Champ address ajouté');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  Champ address existe déjà');
      } else {
        console.log('⚠️  Erreur pour address:', error.message);
      }
    }
    
    // Ajouter le champ bio
    try {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN bio TEXT DEFAULT NULL
      `);
      console.log('✅ Champ bio ajouté');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  Champ bio existe déjà');
      } else {
        console.log('⚠️  Erreur pour bio:', error.message);
      }
    }
    
    // Vérification finale
    console.log('\n📋 Vérification finale des champs...');
    const describeResult = await executeQuery('DESCRIBE users');
    
    const requiredFields = ['avatar_url', 'phone', 'address', 'bio', 'full_name'];
    for (const field of requiredFields) {
      const fieldExists = describeResult.find(f => f.Field === field);
      if (fieldExists) {
        console.log(`✅ ${field}: ${fieldExists.Type}`);
      } else {
        console.log(`❌ ${field}: manquant`);
      }
    }
    
    console.log('\n🎉 Ajout des champs terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit(0);
}

addMissingFields();
