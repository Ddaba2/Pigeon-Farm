const { executeQuery } = require('./config/database');

console.log('🔧 Ajout des champs de profil à la table users...');

async function addProfileFields() {
  try {
    // Vérifier quels champs existent déjà
    const columns = await executeQuery('SHOW COLUMNS FROM users');
    const existingColumns = columns.map(col => col.Field);
    
    console.log('📋 Colonnes existantes:', existingColumns);
    
    // Ajouter les champs manquants
    const fieldsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)', nullable: true },
      { name: 'address', type: 'TEXT', nullable: true },
      { name: 'bio', type: 'TEXT', nullable: true }
    ];
    
    for (const field of fieldsToAdd) {
      if (!existingColumns.includes(field.name)) {
        console.log(`📝 Ajout de la colonne ${field.name}...`);
        await executeQuery(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type} ${field.nullable ? 'NULL' : 'NOT NULL'}`);
        console.log(`✅ Colonne ${field.name} ajoutée`);
      } else {
        console.log(`✅ Colonne ${field.name} existe déjà`);
      }
    }
    
    // Vérifier la nouvelle structure
    const newStructure = await executeQuery('DESCRIBE users');
    console.log('\n📋 Nouvelle structure de la table users:');
    newStructure.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n🎉 Champs de profil ajoutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs:', error.message);
  }
}

addProfileFields();
