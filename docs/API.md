# API Documentation

This document provides an overview of the Muminbook API endpoints.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in requests:

```
Authorization: Bearer <your_jwt_token>
```

Or the token may be sent as an httpOnly cookie (depending on implementation).

## Response Format

All API responses follow this general format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Management

#### Get Current User
```http
GET /api/users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-21T00:00:00.000Z"
  }
}
```

#### Update User Profile
```http
PUT /api/users/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Name",
  "bio": "User bio"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "New Name",
    "bio": "User bio"
  }
}
```

### Content Endpoints

#### Get Daily Verse
```http
GET /api/content/daily-verse
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verse": {
      "text": "Verse text in Arabic",
      "translation": "English translation",
      "reference": "Surah:Ayah",
      "tafsir": "Brief explanation"
    }
  }
}
```

#### Get Daily Hadith
```http
GET /api/content/daily-hadith
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hadith": {
      "text": "Hadith text in Arabic",
      "translation": "English translation",
      "reference": "Collection and reference",
      "explanation": "Brief explanation"
    }
  }
}
```

### Resources

#### Get Resources
```http
GET /api/resources
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "data": {
    "resources": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### Create Resource
```http
POST /api/resources
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Resource Title",
  "description": "Resource description",
  "category": "quran",
  "url": "https://example.com/resource"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resource_id",
    "title": "Resource Title",
    "description": "Resource description",
    "category": "quran",
    "url": "https://example.com/resource",
    "createdAt": "2025-01-21T00:00:00.000Z"
  }
}
```

#### Get Single Resource
```http
GET /api/resources/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resource_id",
    "title": "Resource Title",
    "description": "Resource description",
    "category": "quran",
    "url": "https://example.com/resource",
    "createdAt": "2025-01-21T00:00:00.000Z"
  }
}
```

#### Update Resource
```http
PUT /api/resources/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resource_id",
    "title": "Updated Title",
    "description": "Updated description",
    "updatedAt": "2025-01-21T00:00:00.000Z"
  }
}
```

#### Delete Resource
```http
DELETE /api/resources/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authenticated requests**: 100 requests per 15 minutes
- **Unauthenticated requests**: 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642857600
```

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination info is included in the response:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password |
| `USER_EXISTS` | User already exists |
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Not authorized to perform action |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Validation

All endpoints validate input data using Zod schemas. Validation errors return a 422 status code with details:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Testing the API

### Using cURL

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (with token)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the Postman collection (coming soon)
2. Set the `baseUrl` variable to `http://localhost:5000/api`
3. After login, set the `token` variable with your JWT token
4. Use the token for authenticated requests

## Webhook Events

Coming soon: Webhook support for real-time notifications.

## API Versioning

Currently on version 1. Future versions will be accessible via:
- `/api/v1/...`
- `/api/v2/...`

## Support

For API support:
- Open an issue on [GitHub](https://github.com/Shahtr1/muminbook/issues)
- Check the [documentation](../README.md)
- Join our community discussions

---

**Note**: This API documentation is a work in progress. Actual endpoints may vary based on implementation. Please refer to the backend source code for the most up-to-date endpoint information.
