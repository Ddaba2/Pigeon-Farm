// Vérifier les utilisateurs existants et créer un compte de test
import { executeQuery } from './config/database.js';
import bcrypt from 'bcryptjs';

async function checkAndCreateUser() {
    const testEmail = 'dabadiallo694@gmail.com';
    
    console.log('🔍 Vérification des utilisateurs existants...\n');
    
    try {
        // 1. Lister tous les utilisateurs
        const allUsers = await executeQuery('SELECT id, username, email, full_name FROM users');
        
        console.log('📋 Utilisateurs existants:');
        if (allUsers.length > 0) {
            allUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email})`);
            });
        } else {
            console.log('   Aucun utilisateur trouvé');
        }
        
        // 2. Vérifier si l'utilisateur de test existe
        console.log(`\n🔍 Vérification de l'utilisateur: ${testEmail}`);
        const testUser = await executeQuery(
            'SELECT id, username, email, full_name FROM users WHERE email = ?',
            [testEmail]
        );
        
        if (testUser.length > 0) {
            console.log('✅ Utilisateur trouvé:', testUser[0]);
        } else {
            console.log('❌ Utilisateur non trouvé, création en cours...');
            
            // 3. Créer l'utilisateur de test
            const hashedPassword = await bcrypt.hash('motdepasse123', 12);
            const result = await executeQuery(
                'INSERT INTO users (username, email, password, full_name, email_verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                ['dabad', testEmail, hashedPassword, 'Daba Diallo', true]
            );
            
            console.log('✅ Utilisateur créé avec succès!');
            console.log('   Username: dabad');
            console.log('   Email:', testEmail);
            console.log('   Mot de passe: motdepasse123');
        }
        
        // 4. Nettoyer les anciens codes de réinitialisation
        console.log('\n🧹 Nettoyage des anciens codes de réinitialisation...');
        await executeQuery('DELETE FROM password_reset_codes WHERE email = ?', [testEmail]);
        console.log('✅ Codes nettoyés');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

checkAndCreateUser();
