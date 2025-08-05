const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const database = require('./database');

class AuthService {
  constructor() {
    this.transporter = this.createEmailTransporter();
  }

  createEmailTransporter() {
    if (!process.env.EMAIL_HOST) {
      console.warn('Email configuration not found. Magic link emails will be logged to console.');
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // PUBLIC_INTERFACE
  /**
   * Generate and send magic link for authentication
   * @param {string} email - User email address
   * @returns {Promise<Object>} - Result of magic link generation
   */
  async generateMagicLink(email) {
    try {
      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

      // Save magic link to database
      await database.run(
        'INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt.toISOString()]
      );

      // Create magic link URL
      const magicLinkUrl = `${process.env.SITE_URL || 'http://localhost:3001'}/auth/verify?token=${token}`;

      // Send email or log to console
      await this.sendMagicLinkEmail(email, magicLinkUrl);

      const result = {
        success: true,
        message: 'Magic link sent to your email'
      };

      // In development or test, also return the link for testing
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        result.magicLink = magicLinkUrl;
      }

      return result;
    } catch (error) {
      console.error('Error generating magic link:', error);
      throw new Error('Failed to generate magic link');
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Verify magic link token and authenticate user
   * @param {string} token - Magic link token
   * @returns {Promise<Object>} - Authentication result with JWT token
   */
  async verifyMagicLink(token) {
    try {
      // Find and validate magic link
      const magicLink = await database.get(
        'SELECT * FROM magic_links WHERE token = ? AND used = FALSE AND expires_at > datetime("now")',
        [token]
      );

      if (!magicLink) {
        throw new Error('Invalid or expired magic link');
      }

      // Mark magic link as used
      await database.run(
        'UPDATE magic_links SET used = TRUE WHERE id = ?',
        [magicLink.id]
      );

      // Find or create user
      let user = await database.get(
        'SELECT * FROM users WHERE email = ?',
        [magicLink.email]
      );

      if (!user) {
        // Create new user
        const result = await database.run(
          'INSERT INTO users (email) VALUES (?)',
          [magicLink.email]
        );
        user = await database.get(
          'SELECT * FROM users WHERE id = ?',
          [result.id]
        );
      }

      // Generate JWT token
      const jwtToken = this.generateJWT(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: jwtToken
      };
    } catch (error) {
      console.error('Error verifying magic link:', error);
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Generate JWT token for authenticated user
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateJWT(user) {
    const payload = {
      userId: user.id,
      email: user.email
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Decoded token payload
   */
  async verifyJWT(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async sendMagicLinkEmail(email, magicLinkUrl) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@expense-tracker.com',
      to: email,
      subject: 'Your Magic Link - Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4361ee;">Welcome to Expense Tracker</h2>
          <p>Click the link below to sign in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In to Expense Tracker
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes. If you didn't request this link, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${magicLinkUrl}">${magicLinkUrl}</a>
          </p>
        </div>
      `
    };

    if (this.transporter) {
      try {
        await this.transporter.sendMail(mailOptions);
        console.log('Magic link email sent to:', email);
      } catch (error) {
        console.error('Error sending email:', error);
        // Fall back to console logging
        this.logMagicLinkToConsole(email, magicLinkUrl);
      }
    } else {
      this.logMagicLinkToConsole(email, magicLinkUrl);
    }
  }

  logMagicLinkToConsole(email, magicLinkUrl) {
    console.log('\n=== MAGIC LINK (Development Mode) ===');
    console.log(`Email: ${email}`);
    console.log(`Magic Link: ${magicLinkUrl}`);
    console.log('=====================================\n');
  }
}

module.exports = new AuthService();
