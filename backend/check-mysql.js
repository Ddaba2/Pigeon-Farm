const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

async function checkMySQL() {
  console.log('🔍 Checking MySQL connection...');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306
  };

  console.log('📊 Config:', { ...dbConfig, password: '***' });

  try {
    // First, try to connect without specifying a database
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL server is running and accessible!');
    
    // Check if the database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'pigeon_manager');
    
    if (dbExists) {
      console.log('✅ Database "pigeon_manager" exists');
      
      // Connect to the specific database
      await connection.execute('USE pigeon_manager');
      
      // Check tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Tables in pigeon_manager:');
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
        console.log('❌ Users table does not exist - need to run setup');
      }
    } else {
      console.log('❌ Database "pigeon_manager" does not exist');
      console.log('💡 Run: node setup-database.js');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check if MySQL service is started');
    console.log('3. Verify credentials in config.env');
    console.log('4. Try: net start mysql (Windows) or sudo systemctl start mysql (Linux)');
    return false;
  }
}

checkMySQL();
