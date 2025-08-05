const express = require('express');
const healthController = require('../controllers/health');

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const expenseRoutes = require('./expense');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/user', userRoutes);
router.use('/api/expenses', expenseRoutes);

// Handle 404 for API routes
router.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found'
  });
});

module.exports = router;
