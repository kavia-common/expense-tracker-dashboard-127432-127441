// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MAGIC_LINK_SECRET = 'test-magic-link-secret-for-testing';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests

// Increase timeout for database operations
jest.setTimeout(15000);

// Setup database before all tests
beforeAll(async () => {
  const database = require('../src/services/database');
  // Wait for database tables to be created
  await database.initializeTables();
});

// Clean up after all tests
afterAll(async () => {
  const database = require('../src/services/database');
  // Add small delay to ensure cleanup happens properly
  await new Promise(resolve => setTimeout(resolve, 100));
  database.close();
});
