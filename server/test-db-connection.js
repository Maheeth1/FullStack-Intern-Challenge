const db = require('./src/config/database.js');

async function testConnection() {
  try {
    await db.authenticate();
    console.log('Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
