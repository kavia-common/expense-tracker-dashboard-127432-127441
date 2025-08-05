const database = require('./database');

class UserService {
  // PUBLIC_INTERFACE
  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId) {
    try {
      const user = await database.get(
        'SELECT id, email, name, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} - Updated user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const { name } = profileData;

      await database.run(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, userId]
      );

      // Return updated profile
      return await this.getProfile(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get user statistics (total expenses, etc.)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStats(userId) {
    try {
      const stats = await database.get(`
        SELECT 
          COUNT(*) as total_expenses,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount,
          COUNT(DISTINCT category) as categories_used
        FROM expenses 
        WHERE user_id = ?
      `, [userId]);

      // Get monthly spending
      const monthlySpending = await database.get(`
        SELECT COALESCE(SUM(amount), 0) as monthly_total
        FROM expenses 
        WHERE user_id = ? 
        AND date >= date('now', 'start of month')
      `, [userId]);

      return {
        ...stats,
        monthly_total: monthlySpending.monthly_total
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
