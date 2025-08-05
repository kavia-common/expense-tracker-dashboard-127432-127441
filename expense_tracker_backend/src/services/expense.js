const database = require('./database');

class ExpenseService {
  // PUBLIC_INTERFACE
  /**
   * Create a new expense
   * @param {number} userId - User ID
   * @param {Object} expenseData - Expense data
   * @returns {Promise<Object>} - Created expense
   */
  async createExpense(userId, expenseData) {
    try {
      const { title, amount, category, description, date } = expenseData;

      const result = await database.run(
        'INSERT INTO expenses (user_id, title, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, amount, category || 'Other', description || '', date]
      );

      return await this.getExpenseById(result.id, userId);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expenses for a user with filtering and sorting
   * @param {number} userId - User ID
   * @param {Object} options - Query options (page, limit, sort, filter)
   * @returns {Promise<Object>} - Expenses list with pagination info
   */
  async getExpenses(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc',
        category,
        startDate,
        endDate,
        search
      } = options;

      let whereClause = 'WHERE user_id = ?';
      let params = [userId];

      // Add filters
      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (startDate) {
        whereClause += ' AND date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND date <= ?';
        params.push(endDate);
      }

      if (search) {
        whereClause += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Build sort clause
      const validSortFields = ['date', 'amount', 'title', 'category', 'created_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
      const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM expenses ${whereClause}`;
      const { total } = await database.get(countQuery, params);

      // Get expenses
      const offset = (page - 1) * limit;
      const expensesQuery = `
        SELECT * FROM expenses 
        ${whereClause} 
        ORDER BY ${sortField} ${sortDirection}
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      const expenses = await database.all(expensesQuery, params);

      return {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense by ID
   * @param {number} expenseId - Expense ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Expense data
   */
  async getExpenseById(expenseId, userId) {
    try {
      const expense = await database.get(
        'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
        [expenseId, userId]
      );

      if (!expense) {
        throw new Error('Expense not found');
      }

      return expense;
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update an expense
   * @param {number} expenseId - Expense ID
   * @param {number} userId - User ID (for authorization)
   * @param {Object} expenseData - Updated expense data
   * @returns {Promise<Object>} - Updated expense
   */
  async updateExpense(expenseId, userId, expenseData) {
    try {
      // Check if expense exists and belongs to user
      await this.getExpenseById(expenseId, userId);

      const { title, amount, category, description, date } = expenseData;

      await database.run(
        'UPDATE expenses SET title = ?, amount = ?, category = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [title, amount, category, description, date, expenseId, userId]
      );

      return await this.getExpenseById(expenseId, userId);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an expense
   * @param {number} expenseId - Expense ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteExpense(expenseId, userId) {
    try {
      // Check if expense exists and belongs to user
      await this.getExpenseById(expenseId, userId);

      const result = await database.run(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [expenseId, userId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense categories for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories(userId) {
    try {
      const categories = await database.all(
        'SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category',
        [userId]
      );

      return categories.map(row => row.category);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Expense statistics
   */
  async getExpenseStats(userId) {
    try {
      // Monthly spending by category
      const monthlyByCategory = await database.all(`
        SELECT 
          category,
          SUM(amount) as total,
          COUNT(*) as count
        FROM expenses 
        WHERE user_id = ? 
        AND date >= date('now', 'start of month')
        GROUP BY category
        ORDER BY total DESC
      `, [userId]);

      // Recent spending trend (last 7 days)
      const recentTrend = await database.all(`
        SELECT 
          date,
          SUM(amount) as daily_total
        FROM expenses 
        WHERE user_id = ? 
        AND date >= date('now', '-7 days')
        GROUP BY date
        ORDER BY date
      `, [userId]);

      return {
        monthlyByCategory,
        recentTrend
      };
    } catch (error) {
      console.error('Error getting expense stats:', error);
      throw error;
    }
  }
}

module.exports = new ExpenseService();
