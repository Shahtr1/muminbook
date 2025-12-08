# 📡 API Documentation

Complete API reference for the Muminbook backend.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [User](#user-endpoints)
  - [Admin](#admin-endpoints)
  - [Family Tree](#family-tree-endpoints)
  - [Resources](#resources-endpoints)
  - [Suhuf](#suhuf-endpoints)
  - [Windows](#windows-endpoints)
  - [Readings](#readings-endpoints)
  - [Surah](#surah-endpoints)
  - [Juz](#juz-endpoints)

## 🌐 Base URL

```
Development: http://localhost:5000
Production: https://api.yourdomain.com
```

## 🔐 Authentication

Muminbook uses **JWT (JSON Web Tokens)** for authentication with access and refresh tokens.

### Token Types

| Token Type        | Duration   | Purpose            | Storage          |
| ----------------- | ---------- | ------------------ | ---------------- |
| **Access Token**  | 15 minutes | API requests       | HTTP-only cookie |
| **Refresh Token** | 7 days     | Renew access token | HTTP-only cookie |

### Authentication Header

For authenticated requests, tokens are automatically included via HTTP-only cookies. No manual header needed.

```http
Cookie: accessToken=<jwt_token>
```

### Protected Routes

Routes requiring authentication are marked with 🔒. Routes requiring admin role are marked with 👑.

## ❌ Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "statusCode": 400,
  "path": "/api/endpoint",
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

### Common Status Codes

| Code  | Meaning               |
| ----- | --------------------- |
| `200` | Success               |
| `201` | Created               |
| `400` | Bad Request           |
| `401` | Unauthorized          |
| `403` | Forbidden             |
| `404` | Not Found             |
| `409` | Conflict              |
| `422` | Validation Error      |
| `500` | Internal Server Error |

## ⏱️ Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Headers:**
  - `X-RateLimit-Limit`: Max requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time until reset

---

## 📍 Endpoints

### Health Check

#### GET /

Check API health status.

**Response:**

```json
{
  "status": "healthy"
}
```

---

## 🔑 Authentication Endpoints

Base path: `/auth`

### Register User

#### POST /auth/register

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

**Validation:**

- `email`: Valid email format, unique
- `password`: Min 8 characters, 1 uppercase, 1 lowercase, 1 number
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `dateOfBirth`: Valid date, user must be 13+
- `gender`: "male", "female", or "other"

**Response (201):**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "verified": false,
    "createdAt": "2025-12-08T10:30:00.000Z"
  }
}
```

**Cookies Set:**

- `accessToken` (HTTP-only)
- `refreshToken` (HTTP-only)

---

### Login

#### POST /auth/login

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "verified": true
  },
  "message": "Login successful"
}
```

---

### Refresh Token

#### GET /auth/refresh

Refresh access token using refresh token.

**Cookies Required:**

- `refreshToken`

**Response (200):**

```json
{
  "message": "Access token refreshed"
}
```

**Cookies Updated:**

- `accessToken` (new token)

---

### Logout

#### GET /auth/logout

Logout user and clear tokens.

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

**Cookies Cleared:**

- `accessToken`
- `refreshToken`

---

### Verify Email

#### GET /auth/email/verify/:code

Verify user email with verification code.

**Parameters:**

- `code` (URL param): Verification code from email

**Response (200):**

```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "verified": true
  }
}
```

---

### Resend Verification Email

#### POST /auth/email/reverify

Resend email verification code.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "Verification email sent"
}
```

---

### Forgot Password

#### POST /auth/password/forgot

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset email sent"
}
```

---

### Reset Password

#### POST /auth/password/reset

Reset password with reset code.

**Request Body:**

```json
{
  "code": "verification_code_from_email",
  "password": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "message": "Password reset successful"
}
```

---

## 👤 User Endpoints

Base path: `/user` 🔒

### Get Current User

#### GET /user

Get authenticated user's profile.

**Response (200):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "verified": true,
  "roles": ["user"],
  "createdAt": "2025-12-08T10:30:00.000Z",
  "updatedAt": "2025-12-08T10:30:00.000Z"
}
```

---

## 👑 Admin Endpoints

Base path: `/admin` 🔒👑

_Admin endpoints require admin role. Documentation to be added._

---

## 🌳 Family Tree Endpoints

Base path: `/family-tree` 🔒

_Family tree visualization and management. Documentation to be added._

---

## 📁 Resources Endpoints

Base path: `/resources` 🔒

_File and resource management. Documentation to be added._

---

## 📜 Suhuf Endpoints

Base path: `/suhuf` 🔒

_Suhuf (pages) management. Documentation to be added._

---

## 🪟 Windows Endpoints

Base path: `/windows` 🔒

_Study windows management. Documentation to be added._

---

## 📖 Readings Endpoints

Base path: `/readings` 🔒

_Reading progress tracking. Documentation to be added._

---

## 📗 Surah Endpoints

Base path: `/surahs` 🔒

_Quran Surah access. Documentation to be added._

---

## 📕 Juz Endpoints

Base path: `/juz` 🔒

_Quran Juz access. Documentation to be added._

---

## 🧪 Testing with cURL

### Register a User

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1995-05-15",
    "gender": "male"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Get User Profile

```bash
curl -X GET http://localhost:5000/user \
  -b cookies.txt
```

## 📚 Additional Resources

- **Postman Collection:** [Coming soon]
- **OpenAPI/Swagger:** [Coming soon]
- **Rate Limiting:** See [Rate Limiting](#rate-limiting)
- **Authentication:** See [Authentication](#authentication)

---

**Note:** This documentation is actively being developed. More endpoints will be documented as they are reviewed.

_Last updated: December 8, 2025_
