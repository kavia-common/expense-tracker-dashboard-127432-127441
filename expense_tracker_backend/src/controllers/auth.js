const authService = require('../services/auth');

class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Request magic link for authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestMagicLink(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.generateMagicLink(email);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      console.error('Error requesting magic link:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send magic link'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Verify magic link token and authenticate user
   * @param {Object} req - Express request object  
   * @param {Object} res - Express response object
   */
  async verifyMagicLink(req, res) {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Token is required'
        });
      }

      const result = await authService.verifyMagicLink(token);
      
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      console.error('Error verifying magic link:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Invalid or expired magic link'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Logout user (client-side token removal)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    // Since we're using JWT tokens, logout is handled client-side
    // This endpoint can be used for logging or cleanup if needed
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Get current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      // User info is available from the auth middleware
      res.status(200).json({
        status: 'success',
        user: {
          id: req.user.userId,
          email: req.user.email
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user information'
      });
    }
  }
}

module.exports = new AuthController();
