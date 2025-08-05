const { authenticateToken, optionalAuth } = require('./auth');
const { validate, schemas } = require('./validation');

module.exports = {
  auth: {
    authenticateToken,
    optionalAuth
  },
  validation: {
    validate,
    schemas
  }
};
