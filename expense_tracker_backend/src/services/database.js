const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = process.env.DATABASE_PATH || './data/expense_tracker.db';
    
    // Only create directory if not using in-memory database
    if (dbPath !== ':memory:') {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    this.db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        if (process.env.NODE_ENV !== 'test') {
          console.log('Connected to SQLite database');
        }
        try {
          await this.createTables();
        } catch (error) {
          console.error('Error creating database tables:', error);
        }
      }
    });
  }

  async createTables() {
    const tableQueries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Magic links table for authentication
      `CREATE TABLE IF NOT EXISTS magic_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category TEXT,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`
    ];

    const indexQueries = [
      // Create indexes for better performance
      'CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)',
      'CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)',
      'CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token)',
      'CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email)'
    ];

    try {
      // First create all tables
      for (const query of tableQueries) {
        await new Promise((resolve, reject) => {
          this.db.run(query, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Then create all indexes
      for (const query of indexQueries) {
        await new Promise((resolve, reject) => {
          this.db.run(query, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize database tables synchronously for tests
   * @returns {Promise} - Promise that resolves when tables are created
   */
  async initializeTables() {
    return this.createTables();
  }

  // PUBLIC_INTERFACE
  /**
   * Execute a query with parameters
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise} - Promise resolving to query result
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get a single row from database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise} - Promise resolving to single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get all rows matching query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise} - Promise resolving to array of rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          if (process.env.NODE_ENV !== 'test') {
            console.log('Database connection closed');
          }
        }
      });
    }
  }
}

module.exports = new DatabaseService();
