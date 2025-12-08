# 🏗️ Architecture Overview

This document describes the technical architecture, design decisions, and patterns used in Muminbook.

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Design Decisions](#design-decisions)
- [Security](#security)
- [Performance](#performance)

---

## 🎯 System Architecture

Muminbook follows a **client-server architecture** with clear separation between frontend and backend.

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            React SPA (Vite + Chakra UI)                │  │
│  │   - Component-based UI                                  │  │
│  │   - React Query for state management                   │  │
│  │   - Client-side routing                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ▼ HTTP/REST
┌──────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Express.js REST API                       │  │
│  │   - CORS handling                                       │  │
│  │   - Authentication middleware                           │  │
│  │   - Error handling                                      │  │
│  │   - Rate limiting                                       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Controllers  │→ │  Services    │→ │   Models     │       │
│  │ (HTTP Logic) │  │ (Business)   │  │ (Mongoose)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   MongoDB Database                      │  │
│  │   - Users, Sessions, Resources, Quran Data             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │   Resend     │  │  Email       │                          │
│  │   (Email)    │  │  Templates   │                          │
│  └──────────────┘  └──────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend

| Technology     | Version  | Purpose                    |
| -------------- | -------- | -------------------------- |
| **Node.js**    | 18.20.5+ | Runtime environment        |
| **Express**    | 4.21.2   | Web framework              |
| **TypeScript** | 5.7.3    | Type safety                |
| **MongoDB**    | 6.12.0   | Database                   |
| **Mongoose**   | 8.9.5    | ODM (Object Data Modeling) |
| **Zod**        | 3.24.1   | Schema validation          |
| **JWT**        | 9.0.2    | Authentication tokens      |
| **Bcrypt**     | 5.1.1    | Password hashing           |
| **Resend**     | 4.1.1    | Email service              |
| **Node-cron**  | 3.0.3    | Scheduled jobs             |

### Frontend

| Technology        | Version | Purpose                    |
| ----------------- | ------- | -------------------------- |
| **React**         | 18.3.1  | UI library                 |
| **Vite**          | 6.0.5   | Build tool & dev server    |
| **Chakra UI**     | 2.10.6  | Component library          |
| **React Query**   | 5.65.1  | Server state management    |
| **React Router**  | 7.1.3   | Client-side routing        |
| **Axios**         | 1.7.9   | HTTP client                |
| **Monaco Editor** | 4.7.0   | Code editor component      |
| **React Flow**    | 11.11.4 | Diagram/flow visualization |
| **Framer Motion** | 12.0.6  | Animations                 |

---

## 🔧 Backend Architecture

### MVC Pattern

```
packages/backend/src/
├── controllers/          # HTTP request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── schemas/         # Zod validation schemas
│
├── services/            # Business logic layer
│   ├── auth.service.ts
│   └── ...
│
├── models/              # Mongoose schemas
│   ├── user.model.ts
│   ├── session.model.ts
│   └── ...
│
├── routes/              # API route definitions
│   ├── auth.route.ts
│   └── ...
│
├── middleware/          # Express middleware
│   ├── authenticate.ts
│   └── errorHandler.ts
│
├── utils/               # Helper functions
│   ├── jwt.ts
│   ├── cookies.ts
│   └── ...
│
├── config/              # Configuration
│   ├── db.ts
│   └── resend.ts
│
├── constants/           # Constants & types
│   ├── env.ts
│   └── http.ts
│
└── jobs/                # Scheduled tasks
    └── trashCleanupJob.ts
```

### Request Flow

```
1. Client Request
   ↓
2. CORS Middleware → Validate origin
   ↓
3. Cookie Parser → Extract cookies
   ↓
4. Route Handler → Match endpoint
   ↓
5. Authentication Middleware (if protected)
   ↓
6. Request Schema Validation (Zod)
   ↓
7. Controller → Handle HTTP logic
   ↓
8. Service Layer → Business logic
   ↓
9. Model Layer → Database operations
   ↓
10. Response → JSON or Error
```

### Error Handling

All errors are caught and processed through a centralized error handler:

```typescript
// middleware/errorHandler.ts
export default (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
};
```

---

## 🎨 Frontend Architecture

### Component Structure

```
packages/frontend/src/
├── components/          # Reusable components
│   ├── form/           # Form components
│   ├── layout/         # Layout components
│   └── svgs/           # SVG icons
│
├── pages/              # Route pages
│   ├── auth/          # Authentication pages
│   ├── reading/       # Reading features
│   └── ...
│
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   └── ...
│
├── services/           # API service layer
│   ├── api/
│   └── index.js
│
├── config/             # Configuration
│   ├── apiClient.js   # Axios instance
│   └── queryClient.js # React Query config
│
├── context/            # React Context
│   └── WindowNavbarContext.jsx
│
├── utils/              # Utility functions
│   └── ...
│
├── theme/              # Chakra UI theme
│   └── ...
│
└── styles/             # Global styles
    └── ...
```

### State Management Strategy

**Local State (useState):**

- UI state (modals, toggles)
- Form inputs
- Component-specific state

**Server State (React Query):**

- API data fetching
- Caching
- Background updates
- Optimistic updates

**Global State (Context API):**

- Theme preferences
- Window/navbar state
- App-wide settings

### Data Fetching Pattern

```jsx
// Using React Query
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/services/api";

export const UserProfile = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;

  return <div>{data.name}</div>;
};
```

---

## 🗄️ Database Design

### Collections Overview

```
MongoDB: muminbook
│
├── users                 # User accounts
├── sessions              # Active sessions
├── roles                 # User roles
├── user_roles            # User-role mappings
├── verification_codes    # Email/password verification
├── family_tree           # Family tree data
├── resources             # Uploaded resources
├── windows               # Study windows
├── suhuf                 # Suhuf pages
├── readings              # Reading progress
├── surahs                # Quran Surahs
└── juz                   # Quran Juz
```

### Key Models

**User Model:**

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
  gender: enum,
  verified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Session Model:**

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userAgent: string,
  expiredAt: Date,
  createdAt: Date
}
```

### Indexing Strategy

- `users.email` → Unique index for fast lookups
- `sessions.userId` → Index for session queries
- `sessions.expiredAt` → TTL index for auto-cleanup
- `verification_codes.expiredAt` → TTL index

---

## 🔐 Authentication Flow

### Registration & Login

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Client  │                 │  API    │                │ Database │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │ POST /auth/register       │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ Hash password            │
     │                           │ (bcrypt)                 │
     │                           │                          │
     │                           │ Save user                │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │ Create session           │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │ Generate JWT tokens      │
     │                           │                          │
     │ Set cookies: accessToken, refreshToken               │
     │<──────────────────────────┤                          │
     │                           │                          │
```

### Authenticated Requests

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Client  │                 │  API    │                │ Database │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │ GET /user                 │                          │
     │ Cookie: accessToken       │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ Verify JWT               │
     │                           │                          │
     │                           │ Query user by ID         │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │ Return user data         │
     │                           │<─────────────────────────┤
     │                           │                          │
     │ User data                 │                          │
     │<──────────────────────────┤                          │
     │                           │                          │
```

---

## 🎯 Design Decisions

### Why Monorepo?

**Advantages:**

- Shared TypeScript types
- Atomic commits across frontend/backend
- Simplified dependency management
- Single source of truth

**Alternative Considered:**

- Separate repos (rejected: too much overhead for solo dev)

### Why NPM Workspaces?

**Advantages:**

- Built-in (no extra tools)
- Simple configuration
- Good IDE support

**Alternatives Considered:**

- Turborepo (rejected: overkill for current scale)
- PNPM workspaces (rejected: additional tool)

### Why MongoDB?

**Advantages:**

- Flexible schema for evolving features
- Easy to start (Atlas free tier)
- Good Node.js ecosystem (Mongoose)
- Suitable for document-heavy content (Quran, Hadith)

**Alternatives Considered:**

- PostgreSQL (rejected: overhead for simple app)
- Firebase (rejected: vendor lock-in)

### Why JWT?

**Advantages:**

- Stateless authentication
- No server-side session storage needed
- Works well with REST APIs

**Security Measures:**

- HTTP-only cookies (XSS protection)
- Short-lived access tokens (15min)
- Refresh token rotation
- Secure cookie flags in production

### Why React Query?

**Advantages:**

- Automatic caching
- Background refetching
- Optimistic updates
- Reduced boilerplate

**Alternatives Considered:**

- Redux (rejected: too much boilerplate)
- SWR (rejected: less feature-rich)

---

## 🔒 Security

### Implemented Measures

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Min 8 characters, complexity requirements

2. **Authentication**
   - HTTP-only cookies (XSS protection)
   - Secure flag in production (HTTPS only)
   - SameSite=strict (CSRF protection)
   - Short token lifetimes

3. **Input Validation**
   - Zod schema validation on all inputs
   - SQL injection protection (Mongoose)
   - XSS protection (input sanitization)

4. **Rate Limiting**
   - 100 requests per 15min window
   - Per-IP limiting

5. **CORS**
   - Whitelist allowed origins
   - Credentials allowed only for trusted domains

### Future Enhancements

- [ ] 2FA (Two-factor authentication)
- [ ] Account lockout after failed attempts
- [ ] Security headers (Helmet.js)
- [ ] CSP (Content Security Policy)
- [ ] API key rotation
- [ ] Audit logging

---

## ⚡ Performance

### Backend Optimizations

- **Database Indexing:** Key fields indexed
- **Connection Pooling:** MongoDB connection pool
- **Caching Strategy:** (To be implemented)
- **Query Optimization:** Selective field projection

### Frontend Optimizations

- **Code Splitting:** React lazy loading
- **Tree Shaking:** Vite automatic optimization
- **Image Optimization:** (To be implemented)
- **Lazy Loading:** React Query infinite scroll
- **Memoization:** React.memo, useMemo

### Future Improvements

- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Service Worker for offline support
- [ ] Database query optimization
- [ ] Gzip compression
- [ ] Image compression pipeline

---

## 📚 References

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Best Practices](https://react.dev/learn)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

_Last updated: December 8, 2025_
