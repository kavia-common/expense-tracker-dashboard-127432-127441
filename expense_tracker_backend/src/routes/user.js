const express = require('express');
const userController = require('../controllers/user');
const { validation, auth } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Get user profile
 *     description: Retrieve the current user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T00:00:00Z
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/profile', auth.authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     tags: [User]
 *     summary: Update user profile
 *     description: Update the current user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minimum: 2
 *                 maximum: 100
 *                 description: User's display name
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/profile', 
  auth.authenticateToken,
  validation.validate(validation.schemas.updateProfile),
  userController.updateProfile
);

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     tags: [User]
 *     summary: Get user statistics
 *     description: Get statistics about the user's expenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_expenses:
 *                       type: integer
 *                       example: 25
 *                     total_amount:
 *                       type: number
 *                       example: 1250.50
 *                     average_amount:
 *                       type: number
 *                       example: 50.02
 *                     categories_used:
 *                       type: integer
 *                       example: 5
 *                     monthly_total:
 *                       type: number
 *                       example: 320.75
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', auth.authenticateToken, userController.getStats);

module.exports = router;
