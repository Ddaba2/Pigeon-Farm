const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function createTestUser() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pigeon_manager',
    port: parseInt(process.env.DB_PORT) || 3306
  };

  try {
    console.log('🔍 Creating test user...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if test user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['testuser', 'test@example.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('⚠️ Test user already exists');
      await connection.end();
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, full_name, role, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ['testuser', 'test@example.com', hashedPassword, 'Test User', 'user']
    );
    
    console.log('✅ Test user created successfully!');
    console.log('📋 Test credentials:');
    console.log('   Username: testuser');
    console.log('   Email: test@example.com');
    console.log('   Password: testpass123');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser();
