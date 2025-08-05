# Expense Tracker Backend - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Set strong `MAGIC_LINK_SECRET` (minimum 32 characters)
- [ ] Configure email service credentials (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` and `SITE_URL` with production URLs
- [ ] Set appropriate `DATABASE_PATH` for production

### 2. Security Configuration
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -hex 32)
MAGIC_LINK_SECRET=$(openssl rand -hex 32)
```

### 3. Database Setup
```bash
# Initialize database tables
npm run init-db

# Verify database creation
ls -la data/
```

### 4. Testing
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Test coverage
npm run test:coverage
```

### 5. Production Dependencies
```bash
# Install only production dependencies
npm ci --only=production
```

## Deployment Options

### Option 1: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/server.js --name "expense-tracker-api"

# Setup auto-restart
pm2 startup
pm2 save
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Systemd Service
```ini
# /etc/systemd/system/expense-tracker.service
[Unit]
Description=Expense Tracker API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/expense-tracker-backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Reverse Proxy Configuration (Nginx)
```nginx
server {
    listen 80;
    server_name api.yourexpensetracker.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/TLS Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourexpensetracker.com

# Auto-renewal
sudo crontab -e
# Add: 0 2 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Application Logging
```javascript
// Consider adding winston for structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Health Monitoring
```bash
# Setup health check endpoint monitoring
curl -f http://localhost:3000/ || exit 1
```

## Database Backup Strategy
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp data/expense_tracker.db backups/expense_tracker_$DATE.db

# Keep only last 30 days
find backups/ -name "expense_tracker_*.db" -mtime +30 -delete
```

## Performance Optimization

### 1. Database Optimization
- Regular VACUUM operations for SQLite
- Consider PostgreSQL for high-load scenarios
- Implement connection pooling if needed

### 2. Caching
- Implement Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

### 3. Rate Limiting
- Configure appropriate rate limits for production
- Consider IP whitelisting for admin endpoints
- Monitor and adjust limits based on usage

## Security Hardening

### 1. Environment Security
- Never commit `.env` files
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

### 2. Network Security
- Use HTTPS only in production
- Configure proper CORS settings
- Implement request size limits
- Use security headers (already configured with Helmet.js)

### 3. Database Security
- Regular database backups
- Encrypt sensitive data at rest
- Use parameterized queries (already implemented)

## Troubleshooting

### Common Issues
1. **Port already in use**: Check if another instance is running
2. **Database locked**: Ensure proper connection closing
3. **Email not sending**: Verify email service configuration
4. **High memory usage**: Monitor for memory leaks, restart periodically

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check logs
tail -f logs/combined.log
```

### Health Checks
```bash
# Application health
curl http://localhost:3000/

# Database connectivity
curl http://localhost:3000/api/user/stats -H "Authorization: Bearer <token>"
```

## Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security
JWT_SECRET=your-production-jwt-secret-here
MAGIC_LINK_SECRET=your-production-magic-link-secret-here

# Database
DATABASE_PATH=/var/lib/expense-tracker/expense_tracker.db

# Email Service
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourexpensetracker.com

# URLs
FRONTEND_URL=https://yourexpensetracker.com
SITE_URL=https://yourexpensetracker.com
```

## Monitoring Checklist

- [ ] Application uptime monitoring
- [ ] Database performance monitoring
- [ ] Error rate monitoring
- [ ] Response time monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] Log aggregation setup
- [ ] Alert notifications setup

## Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Monitor system resources

### Weekly
- [ ] Review performance metrics
- [ ] Check database size and performance
- [ ] Update dependencies (security patches)

### Monthly
- [ ] Full system backup
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Performance optimization review

## Support and Documentation

- API Documentation: `https://your-domain.com/docs`
- Health Check: `https://your-domain.com/`
- OpenAPI Spec: `https://your-domain.com/openapi.json`

For issues, refer to logs in `/var/log/expense-tracker/` or application logs directory.
