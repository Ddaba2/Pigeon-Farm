const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, 'pigeon_manager.db');

// Vérifier si le fichier existe
if (!fs.existsSync(dbPath)) {
  console.error('❌ Fichier de base de données non trouvé:', dbPath);
  process.exit(1);
}

// Ouvrir la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur lors de l\'ouverture de la base de données:', err.message);
    process.exit(1);
  }
  console.log('✅ Connexion à la base de données SQLite réussie');
});

// Fonction pour exécuter une requête
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Fonction pour récupérer des données
function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function migrateSalesTable() {
  try {
    console.log('🔍 Vérification de la structure de la table sales...');
    
    // Vérifier si la colonne user_id existe déjà
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(sales)", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    const userIdColumn = columns.find(col => col.name === 'user_id');
    if (userIdColumn) {
      console.log('✅ La colonne user_id existe déjà dans la table sales');
      return;
    }
    
    console.log('🔄 Ajout de la colonne user_id à la table sales...');
    
    // Ajouter la colonne user_id (temporairement nullable)
    await runQuery(`
      ALTER TABLE sales 
      ADD COLUMN user_id INTEGER
    `);
    
    console.log('✅ Colonne user_id ajoutée');
    
    // Associer toutes les ventes existantes au premier utilisateur trouvé
    const users = await allQuery('SELECT id FROM users ORDER BY id LIMIT 1');
    if (users.length > 0) {
      const firstUserId = users[0].id;
      console.log(`🔄 Association de toutes les ventes existantes à l'utilisateur ID ${firstUserId}...`);
      
      await runQuery(`
        UPDATE sales 
        SET user_id = ? 
        WHERE user_id IS NULL
      `, [firstUserId]);
      
      console.log('✅ Toutes les ventes ont été associées à un utilisateur');
    }
    
    // Créer un index sur user_id
    console.log('🔄 Création de l\'index sur user_id...');
    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id)
    `);
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
migrateSalesTable().then(() => {
  console.log('🎉 Script de migration terminé');
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur lors de la fermeture de la base de données:', err.message);
    } else {
      console.log('✅ Base de données fermée');
    }
    process.exit(0);
  });
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  db.close(() => {
    process.exit(1);
  });
});