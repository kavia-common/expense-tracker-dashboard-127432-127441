# Expense Tracker Backend API

A comprehensive Node.js/Express backend API for expense tracking with magic link authentication, built with SQLite database and comprehensive RESTful endpoints.

## Features

- **Magic Link Authentication**: Passwordless authentication via email
- **Expense Management**: Full CRUD operations for expenses
- **User Profile Management**: User profile and statistics
- **Advanced Filtering**: Filter expenses by category, date range, and search
- **Statistics & Analytics**: Expense statistics and trends
- **Security**: JWT tokens, rate limiting, input validation, and security headers
- **API Documentation**: Swagger/OpenAPI documentation

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Email service configuration (optional for development)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The server will start on http://localhost:3000 with API documentation at http://localhost:3000/docs

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Magic Link Configuration
MAGIC_LINK_SECRET=your-magic-link-secret-here-change-in-production
MAGIC_LINK_EXPIRES_IN=15m

# Email Configuration (optional for development)
EMAIL_FROM=noreply@yourapp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
DATABASE_PATH=./data/expense_tracker.db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# Site URL (for magic link redirects)
SITE_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Request magic link
- `GET /api/auth/verify?token=...` - Verify magic link
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Expense Management
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses (with filtering/pagination)
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/categories` - Get user's categories
- `GET /api/expenses/stats` - Get expense statistics

### Health Check
- `GET /` - Health check endpoint

## Authentication Flow

1. **Request Magic Link**: Send email to `POST /api/auth/magic-link`
2. **Receive Email**: Check email or console logs (development mode)
3. **Verify Token**: Click link or call `GET /api/auth/verify?token=...`
4. **Get JWT Token**: Use returned JWT for authenticated requests
5. **Use JWT**: Include `Authorization: Bearer <jwt-token>` header

## API Usage Examples

### Request Magic Link
```bash
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Create Expense (with JWT)
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 45.50,
    "category": "Food",
    "description": "Weekly groceries",
    "date": "2024-01-15"
  }'
```

### Get Expenses with Filtering
```bash
curl "http://localhost:3000/api/expenses?category=Food&startDate=2024-01-01&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `name` - User display name
- `created_at`, `updated_at` - Timestamps

### Expenses Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Expense title
- `amount` - Expense amount (decimal)
- `category` - Expense category
- `description` - Optional description
- `date` - Expense date
- `created_at`, `updated_at` - Timestamps

### Magic Links Table
- `id` - Primary key
- `email` - User email
- `token` - Unique token
- `expires_at` - Expiration timestamp
- `used` - Boolean flag
- `created_at` - Creation timestamp

## Development

### Available Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with auto-reload
npm test         # Run tests
npm run lint     # Run ESLint
npm run generate-openapi  # Generate OpenAPI specification
```

### Development Features

- **Auto-reload**: Server restarts on file changes
- **Console Magic Links**: Magic links logged to console when email not configured
- **Detailed Errors**: Full error stack traces in development
- **CORS**: Permissive CORS for development

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation using Joi
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configurable cross-origin requests

## Production Deployment

### Environment Setup
1. Set strong `JWT_SECRET` and `MAGIC_LINK_SECRET`
2. Configure email service credentials
3. Set `NODE_ENV=production`
4. Configure proper `FRONTEND_URL` and `SITE_URL`
5. Use HTTPS in production

### Recommended Production Setup
- Use PM2 or similar process manager
- Set up proper logging
- Configure database backups
- Use reverse proxy (nginx)
- Enable SSL/TLS certificates

## API Documentation

Interactive API documentation is available at `/docs` when the server is running:
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/openapi.json

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "details": [/* validation errors if applicable */]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
