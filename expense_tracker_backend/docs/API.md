# Expense Tracker API Documentation

## Overview

The Expense Tracker API provides a complete backend solution for managing personal expenses with magic link authentication. This RESTful API supports user authentication, expense CRUD operations, user profile management, and comprehensive analytics.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication after initial magic link verification.

### Magic Link Flow

1. **Request Magic Link**: `POST /api/auth/magic-link`
2. **Verify Magic Link**: `GET /api/auth/verify?token=...`
3. **Use JWT Token**: Include in `Authorization: Bearer <token>` header

## API Endpoints

### Authentication

#### Request Magic Link
```http
POST /api/auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Magic link sent to your email",
  "magicLink": "http://localhost:3001/auth/verify?token=abc123..." // Development only
}
```

#### Verify Magic Link
```http
GET /api/auth/verify?token=abc123def456
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### User Management

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Doe"
}
```

#### Get User Statistics
```http
GET /api/user/stats
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_expenses": 25,
    "total_amount": 1250.50,
    "average_amount": 50.02,
    "categories_used": 5,
    "monthly_total": 320.75
  }
}
```

### Expense Management

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 45.50,
  "category": "Food",
  "description": "Weekly groceries at supermarket",
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Grocery Shopping",
    "amount": 45.50,
    "category": "Food",
    "description": "Weekly groceries at supermarket",
    "date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Expense created successfully"
}
```

#### Get Expenses (with filtering)
```http
GET /api/expenses?page=1&limit=10&category=Food&startDate=2024-01-01&sortBy=date&sortOrder=desc
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field: date, amount, title, category, created_at
- `sortOrder` - Sort order: asc, desc
- `category` - Filter by category
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `search` - Search in title and description

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Grocery Shopping",
      "amount": 45.50,
      "category": "Food",
      "description": "Weekly groceries",
      "date": "2024-01-15",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get Expense by ID
```http
GET /api/expenses/1
Authorization: Bearer <jwt-token>
```

#### Update Expense
```http
PUT /api/expenses/1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Grocery Shopping",
  "amount": 55.75,
  "category": "Food",
  "description": "Updated description",
  "date": "2024-01-15"
}
```

#### Delete Expense
```http
DELETE /api/expenses/1
Authorization: Bearer <jwt-token>
```

#### Get Categories
```http
GET /api/expenses/categories
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "data": ["Food", "Transportation", "Entertainment", "Utilities", "Healthcare"]
}
```

#### Get Expense Statistics
```http
GET /api/expenses/stats
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "monthlyByCategory": [
      {
        "category": "Food",
        "total": 450.75,
        "count": 8
      }
    ],
    "recentTrend": [
      {
        "date": "2024-01-15",
        "daily_total": 125.50
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP

## Data Validation

### Expense Object
```json
{
  "title": "string (1-255 chars, required)",
  "amount": "number (positive, required)",
  "category": "string (max 100 chars, optional)",
  "description": "string (max 1000 chars, optional)",
  "date": "string (YYYY-MM-DD format, required)"
}
```

### User Profile
```json
{
  "name": "string (2-100 chars, required)"
}
```

## Development Features

When running in development mode (`NODE_ENV=development`):

- Magic links are logged to console
- Detailed error messages with stack traces
- CORS enabled for all origins
- Development magic link included in response

## Security Features

- JWT token authentication
- Magic link tokens (15-minute expiry)
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection protection via parameterized queries
- Security headers via Helmet.js
- CORS configuration

## Example Usage with curl

### Complete Authentication Flow
```bash
# 1. Request magic link
curl -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# 2. Verify magic link (use token from email/console)
curl "http://localhost:3000/api/auth/verify?token=YOUR_TOKEN_HERE"

# 3. Use JWT token for authenticated requests
export JWT_TOKEN="your-jwt-token-here"

# 4. Create an expense
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "title": "Coffee",
    "amount": 5.50,
    "category": "Food",
    "date": "2024-01-15"
  }'

# 5. Get expenses
curl "http://localhost:3000/api/expenses" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Interactive Documentation

Visit `/docs` endpoint when server is running for interactive Swagger UI documentation:
- **Local**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/openapi.json
