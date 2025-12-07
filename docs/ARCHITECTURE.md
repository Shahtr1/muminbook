# Architecture Documentation

## Overview

Muminbook is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js). The project follows a monorepo structure with separate backend and frontend applications that communicate via RESTful APIs.

## Table of Contents

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Security](#security)
- [Performance Considerations](#performance-considerations)

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│                    (React Frontend)                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js Server                       │
│                   (Node.js Backend)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Controllers  │  │  Middleware   │  │   Services   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MongoDB Database                       │
│              (Document Store / Collections)              │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime environment |
| Express.js | v4.21+ | Web application framework |
| TypeScript | v5.7+ | Type-safe JavaScript |
| MongoDB | v6+ | NoSQL database |
| Mongoose | v8.9+ | MongoDB ODM |
| Zod | v3.24+ | Schema validation |
| JWT | v9.0+ | Authentication tokens |
| bcrypt | v5.1+ | Password hashing |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | v18.3+ | UI library |
| Vite | v6.0+ | Build tool and dev server |
| Chakra UI | v2.10+ | Component library |
| React Router | v7.1+ | Client-side routing |
| React Query | v5.65+ | Server state management |
| Axios | v1.7+ | HTTP client |
| Monaco Editor | v4.7+ | Code editor component |
| Vitest | v3.1+ | Unit testing framework |

### Development Tools

- ESLint - Code linting
- TypeScript - Type checking
- ts-node-dev - Development server for backend
- Concurrently - Run multiple commands

## Project Structure

```
muminbook/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── jobs/           # Scheduled jobs
│   │   └── index.ts        # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── sample.env
│
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   ├── theme/         # Chakra UI theme
│   │   ├── styles/        # CSS styles
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── sample.env
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── nav.md             # Navigation/feature documentation
│
├── package.json           # Root package.json (monorepo)
├── CONTRIBUTING.md
├── README.md
└── LICENSE
```

## Backend Architecture

### Layered Architecture

The backend follows a layered architecture pattern:

```
Routes → Controllers → Services → Models → Database
```

#### 1. Routes Layer (`src/routes/`)

- Defines API endpoints
- Maps HTTP methods to controller functions
- Applies middleware (authentication, validation)

**Example:**
```typescript
router.post('/api/users', authenticateToken, createUser);
```

#### 2. Controllers Layer (`src/controllers/`)

- Handles HTTP request/response
- Extracts data from requests
- Calls service layer
- Returns formatted responses
- Handles errors

**Responsibilities:**
- Request validation (using Zod)
- Calling appropriate services
- Error handling and HTTP status codes

#### 3. Services Layer (`src/services/`)

- Contains business logic
- Independent of HTTP/Express
- Reusable across different controllers
- Interacts with database models

**Responsibilities:**
- Complex business rules
- Data transformation
- Orchestrating multiple model operations

#### 4. Models Layer (`src/models/`)

- Mongoose schemas and models
- Database structure definition
- Data validation rules
- Virtual properties and methods

#### 5. Middleware (`src/middleware/`)

- Authentication checks
- Request logging
- Error handling
- CORS configuration
- Rate limiting (future)

### Key Patterns

**Dependency Injection:** Services are injected into controllers
**Error Handling:** Centralized error handling middleware
**Validation:** Zod schemas for request validation
**Security:** JWT-based authentication, bcrypt for passwords

## Frontend Architecture

### Component Architecture

```
App
├── Layout Components
│   ├── Navigation
│   ├── Sidebar
│   └── Footer
│
├── Page Components
│   ├── Home
│   ├── Essentials
│   ├── Reading
│   └── Profile
│
└── Shared Components
    ├── UI Components
    ├── Form Components
    └── Data Display Components
```

### State Management Strategy

1. **Server State:** React Query (`@tanstack/react-query`)
   - API data fetching and caching
   - Automatic refetching
   - Optimistic updates

2. **Client State:** React Context + Hooks
   - User authentication state
   - UI state (modals, drawers)
   - Theme preferences

3. **URL State:** React Router
   - Current page
   - Query parameters
   - Navigation history

### Key Patterns

**Custom Hooks:** Encapsulate reusable logic
**Component Composition:** Build complex UIs from simple components
**Render Props / HOCs:** Share functionality between components
**Code Splitting:** Lazy loading for better performance

### Routing Structure

```
/                          # Home page
/essentials               # Islamic essentials section
/reading                  # Quran/Hadith reading
/sessions                 # Live study sessions
/profile                  # User profile
/settings                 # User settings
```

## Data Flow

### Authentication Flow

```
1. User submits login credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Token stored in httpOnly cookie
   ↓
6. Frontend receives user data
   ↓
7. React Query caches user data
   ↓
8. Subsequent requests include token
```

### Data Fetching Flow

```
1. Component mounts
   ↓
2. React Query hook initiates fetch
   ↓
3. Check cache (return if fresh)
   ↓
4. Axios sends HTTP request
   ↓
5. Backend processes request
   ↓
6. Database query executed
   ↓
7. Response sent to frontend
   ↓
8. React Query caches response
   ↓
9. Component re-renders with data
```

## Security

### Backend Security Measures

1. **Authentication:**
   - JWT tokens with expiration
   - Secure httpOnly cookies
   - Token refresh mechanism

2. **Authorization:**
   - Role-based access control
   - Resource-level permissions

3. **Data Validation:**
   - Zod schema validation
   - Input sanitization
   - SQL injection prevention (via Mongoose)

4. **Password Security:**
   - bcrypt hashing with salt
   - Minimum password requirements

5. **CORS:**
   - Configured allowed origins
   - Credentials support

### Frontend Security Measures

1. **XSS Prevention:**
   - React's built-in escaping
   - DOMPurify for user content (if needed)

2. **CSRF Protection:**
   - httpOnly cookies
   - SameSite cookie attribute

3. **Secure Communication:**
   - HTTPS in production
   - Environment variable management

## Performance Considerations

### Backend Optimization

1. **Database:**
   - Indexed frequently queried fields
   - Efficient query design
   - Connection pooling

2. **Caching:**
   - Consider Redis for session storage (future)
   - Response caching for static data

3. **API Design:**
   - Pagination for large datasets
   - Field selection (sparse fieldsets)
   - Rate limiting to prevent abuse

### Frontend Optimization

1. **Code Splitting:**
   - Lazy loading routes
   - Dynamic imports for large components

2. **Asset Optimization:**
   - Image optimization
   - Minification in production build

3. **Rendering:**
   - React.memo for expensive components
   - Virtual scrolling for long lists
   - Debouncing user inputs

4. **Caching:**
   - React Query cache configuration
   - Service Worker (future consideration)

## Future Considerations

### Scalability

- Microservices architecture (if needed)
- Load balancing
- Database sharding
- CDN for static assets

### Features

- Real-time features (WebSockets for live sessions)
- Mobile application (React Native)
- Offline support (Progressive Web App)
- Internationalization (i18n)

### DevOps

- CI/CD pipeline
- Automated testing
- Container orchestration (Kubernetes)
- Monitoring and logging

## Decision Records

### Why MERN Stack?

- **JavaScript everywhere:** Single language for full stack
- **Active ecosystem:** Large community and library support
- **Flexibility:** MongoDB's schema flexibility suits evolving requirements
- **Performance:** Non-blocking I/O with Node.js

### Why TypeScript for Backend?

- **Type safety:** Catch errors at compile time
- **Better IDE support:** Autocomplete and refactoring
- **Documentation:** Types serve as inline documentation
- **Maintainability:** Easier to refactor and understand code

### Why Chakra UI?

- **Accessibility:** WCAG compliant out of the box
- **Theming:** Easy customization
- **Developer experience:** Intuitive API
- **Component variety:** Rich set of pre-built components

### Why React Query?

- **Server state management:** Purpose-built for async data
- **Caching:** Automatic caching and invalidation
- **DevTools:** Excellent debugging experience
- **Optimistic updates:** Better UX with immediate feedback

---

*This document should be updated as the architecture evolves.*
