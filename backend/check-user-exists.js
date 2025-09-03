// Vérifier si l'utilisateur existe dans la base de données
import { executeQuery } from './config/database.js';

async function checkUserExists() {
    const email = 'dabadiallo694@gmail.com';
    
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...\n');
    
    try {
        // Vérifier si l'utilisateur existe
        const users = await executeQuery(
            'SELECT id, username, email, full_name FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length > 0) {
            console.log('✅ Utilisateur trouvé:');
            console.log('   ID:', users[0].id);
            console.log('   Username:', users[0].username);
            console.log('   Email:', users[0].email);
            console.log('   Nom complet:', users[0].full_name);
        } else {
            console.log('❌ Utilisateur non trouvé avec l\'email:', email);
            console.log('💡 Vous devez d\'abord créer un compte avec cet email');
        }
        
        // Vérifier les codes de réinitialisation
        console.log('\n🔍 Codes de réinitialisation existants:');
        const codes = await executeQuery(
            'SELECT * FROM password_reset_codes WHERE email = ? ORDER BY created_at DESC LIMIT 5',
            [email]
        );
        
        if (codes.length > 0) {
            codes.forEach((code, index) => {
                console.log(`   Code ${index + 1}:`, {
                    id: code.id,
                    code: code.code,
                    used: code.used,
                    expires_at: code.expires_at,
                    created_at: code.created_at
                });
            });
        } else {
            console.log('   Aucun code de réinitialisation trouvé');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

checkUserExists();
