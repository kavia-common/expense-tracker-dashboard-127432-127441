require('dotenv').config();
const database = require('../src/services/database');

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // The database service automatically creates tables when initialized
    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - magic_links');
    console.log('   - expenses');
    console.log('🎯 Indexes created for performance optimization');
    
    // Close the database connection
    database.close();
    console.log('🔒 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
