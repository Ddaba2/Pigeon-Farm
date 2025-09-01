const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function testDatabaseConnection() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pigeonfarm',
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('🔍 Testing database connection...');
  console.log('Config:', { ...dbConfig, password: '***' });

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test if users table exists
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Check if users table exists
    const usersTableExists = tables.some(table => 
      Object.values(table)[0] === 'users'
    );

    if (usersTableExists) {
      console.log('✅ Users table exists');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Number of users: ${users[0].count}`);
    } else {
      console.log('❌ Users table does not exist');
    }

    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database credentials in config.env');
    console.log('3. Create the database if it doesn\'t exist');
    console.log('4. Run the database setup script');
    return false;
  }
}

testDatabaseConnection();
