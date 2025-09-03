// Script de diagnostic pour la base de données
import { executeQuery } from './config/database.js';

async function diagnosticDatabase() {
    console.log('🔍 Diagnostic de la base de données...\n');

    try {
        // Test 1: Connexion à la base de données
        console.log('1️⃣ Test de connexion...');
        const connectionTest = await executeQuery('SELECT 1 as test');
        console.log('✅ Connexion réussie:', connectionTest[0]);

        // Test 2: Vérifier si la table password_reset_codes existe
        console.log('\n2️⃣ Vérification de la table password_reset_codes...');
        const tableExists = await executeQuery(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'pigeon_manager' 
            AND table_name = 'password_reset_codes'
        `);
        
        if (tableExists[0].count > 0) {
            console.log('✅ Table password_reset_codes existe');
        } else {
            console.log('❌ Table password_reset_codes n\'existe pas');
            console.log('💡 Exécutez le script db_schema.sql pour créer la table');
            return;
        }

        // Test 3: Vérifier la structure de la table
        console.log('\n3️⃣ Structure de la table password_reset_codes...');
        const structure = await executeQuery('DESCRIBE password_reset_codes');
        console.log('📋 Structure:');
        structure.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        // Test 4: Vérifier s'il y a des utilisateurs
        console.log('\n4️⃣ Vérification des utilisateurs...');
        const users = await executeQuery('SELECT id, username, email FROM users LIMIT 5');
        console.log(`📊 ${users.length} utilisateur(s) trouvé(s):`);
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email})`);
        });

        // Test 5: Test d'insertion dans password_reset_codes
        console.log('\n5️⃣ Test d\'insertion dans password_reset_codes...');
        const testEmail = 'test@example.com';
        const testCode = '1234';
        const testExpires = new Date(Date.now() + 15 * 60 * 1000);
        
        await executeQuery(
            'INSERT INTO password_reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [testEmail, testCode, testExpires]
        );
        console.log('✅ Insertion réussie');

        // Test 6: Vérifier l'insertion
        const inserted = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ?',
            [testEmail]
        );
        console.log('📋 Données insérées:', inserted[0]);

        // Test 7: Nettoyer le test
        await executeQuery('DELETE FROM password_reset_codes WHERE email = ?', [testEmail]);
        console.log('🧹 Test nettoyé');

        console.log('\n✅ Diagnostic terminé - Base de données opérationnelle');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
        console.log('\n🔧 Solutions possibles:');
        console.log('1. Vérifiez que MySQL est démarré');
        console.log('2. Vérifiez les paramètres de connexion dans config.env');
        console.log('3. Exécutez le script db_schema.sql');
        console.log('4. Vérifiez que la base de données pigeon_manager existe');
    }
}

diagnosticDatabase();
