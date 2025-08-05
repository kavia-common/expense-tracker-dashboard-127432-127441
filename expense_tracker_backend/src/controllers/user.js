const userService = require('../services/user');

class UserController {
  // PUBLIC_INTERFACE
  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getProfile(userId);
      
      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(404).json({
        status: 'error',
        message: error.message || 'Profile not found'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profileData = req.body;
      
      const updatedProfile = await userService.updateProfile(userId, profileData);
      
      res.status(200).json({
        status: 'success',
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update profile'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await userService.getUserStats(userId);
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user statistics'
      });
    }
  }
}

module.exports = new UserController();
