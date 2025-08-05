const Joi = require('joi');

// PUBLIC_INTERFACE
/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // Auth schemas
  magicLinkRequest: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  }),

  // User profile schema
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    })
  }),

  // Expense schemas
  createExpense: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Title is required',
      'string.max': 'Title must not exceed 255 characters',
      'any.required': 'Title is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Amount must be positive',
      'any.required': 'Amount is required'
    }),
    category: Joi.string().max(100).optional().default('Other'),
    description: Joi.string().max(1000).optional().allow(''),
    date: Joi.date().iso().required().messages({
      'date.format': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Date is required'
    })
  }),

  updateExpense: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    amount: Joi.number().positive().precision(2).required(),
    category: Joi.string().max(100).optional(),
    description: Joi.string().max(1000).optional().allow(''),
    date: Joi.date().iso().required()
  })
};

module.exports = {
  validate,
  schemas
};
