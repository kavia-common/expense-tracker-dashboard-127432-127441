const request = require('supertest');
const app = require('../src/app');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/magic-link', () => {
    it('should request magic link with valid email', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Magic link sent to your email');
      // In development mode, magic link should be included
      if (process.env.NODE_ENV !== 'production') {
        expect(response.body).toHaveProperty('magicLink');
      }
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body).toHaveProperty('details');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/magic-link')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation error');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Token is required');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify?token=invalid-token')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid or expired magic link');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject request without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should allow logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
});
