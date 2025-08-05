const expenseService = require('../services/expense');

class ExpenseController {
  // PUBLIC_INTERFACE
  /**
   * Create a new expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createExpense(req, res) {
    try {
      const userId = req.user.userId;
      const expenseData = req.body;
      
      const expense = await expenseService.createExpense(userId, expenseData);
      
      res.status(201).json({
        status: 'success',
        data: expense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create expense'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expenses with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpenses(req, res) {
    try {
      const userId = req.user.userId;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'date',
        sortOrder: req.query.sortOrder || 'desc',
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search
      };
      
      const result = await expenseService.getExpenses(userId, options);
      
      res.status(200).json({
        status: 'success',
        data: result.expenses,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get expenses'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExpenseById(req, res) {
    try {
      const userId = req.user.userId;
      const expenseId = parseInt(req.params.id);
      
      const expense = await expenseService.getExpenseById(expenseId, userId);
      
      res.status(200).json({
        status: 'success',
        data: expense
      });
    } catch (error) {
      console.error('Error getting expense:', error);
      res.status(404).json({
        status: 'error',
        message: error.message || 'Expense not found'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateExpense(req, res) {
    try {
      const userId = req.user.userId;
      const expenseId = parseInt(req.params.id);
      const expenseData = req.body;
      
      const expense = await expenseService.updateExpense(expenseId, userId, expenseData);
      
      res.status(200).json({
        status: 'success',
        data: expense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update expense'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteExpense(req, res) {
    try {
      const userId = req.user.userId;
      const expenseId = parseInt(req.params.id);
      
      await expenseService.deleteExpense(expenseId, userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete expense'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense categories for the user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCategories(req, res) {
    try {
      const userId = req.user.userId;
      const categories = await expenseService.getCategories(userId);
      
      res.status(200).json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get categories'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get expense statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await expenseService.getExpenseStats(userId);
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      console.error('Error getting expense stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get expense statistics'
      });
    }
  }
}

module.exports = new ExpenseController();
