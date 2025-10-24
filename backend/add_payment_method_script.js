const db = require('./config/database');

async function addPaymentMethod() {
  try {
    await db.executeQuery('ALTER TABLE sales ADD COLUMN payment_method VARCHAR(50) DEFAULT "espece"');
    console.log('✅ Champ payment_method ajouté à la table sales');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️ Champ payment_method existe déjà');
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
  process.exit(0);
}

addPaymentMethod();

