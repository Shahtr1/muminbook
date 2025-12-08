# Testing Guide

This document provides comprehensive guidance on testing practices across the Muminbook monorepo.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

## Overview

Muminbook uses [Vitest](https://vitest.dev/) as the primary testing framework for both backend and frontend packages. Vitest provides:

- ⚡ Fast execution with native ESM support
- 🔧 Compatible with Jest API
- 📊 Built-in coverage reporting
- 🎯 TypeScript support out of the box
- 🔍 Watch mode for development

### Testing Stack

**Backend:**

- **Framework:** Vitest
- **Coverage:** @vitest/coverage-v8
- **Environment:** Node.js
- **Language:** TypeScript

**Frontend:**

- **Framework:** Vitest
- **Testing Library:** @testing-library/react
- **Coverage:** @vitest/coverage-v8
- **Environment:** jsdom (browser simulation)
- **Language:** JavaScript/JSX

## Running Tests

### Run All Tests

From the project root:

```bash
# Run tests in all workspaces
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage reports
npm run test:coverage
```

### Backend Tests Only

```bash
# Run backend tests once
npm run test:backend

# Watch mode for backend
npm run test:watch --workspace=@muminbook/backend

# Backend coverage
npm run test:coverage --workspace=@muminbook/backend
```

### Frontend Tests Only

```bash
# Run frontend tests once
npm run test:frontend

# Watch mode for frontend
npm run test:watch --workspace=@muminbook/frontend

# Frontend coverage
npm run test:coverage --workspace=@muminbook/frontend

# Visual UI for frontend tests
npm run test:ui
```

## Backend Testing

### Configuration

Backend tests are configured in `packages/backend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test-utils/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Structure

Tests are located alongside source files in `__tests__` directories:

```
packages/backend/src/
├── utils/
│   ├── __tests__/
│   │   ├── bcrypt.test.ts
│   │   ├── jwt.test.ts
│   │   ├── AppError.test.ts
│   │   └── date.test.ts
│   ├── bcrypt.ts
│   ├── jwt.ts
│   └── ...
```

### Example Backend Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { hashValue, compareValue } from '../bcrypt';

describe('Bcrypt Password Hashing', () => {
  const testPassword = 'SecurePassword123!';
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await hashValue(testPassword);
  });

  it('should hash a password successfully', async () => {
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(testPassword);
    expect(hashedPassword.length).toBeGreaterThan(0);
  });

  it('should verify correct password', async () => {
    const isMatch = await compareValue(testPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
```

### What to Test in Backend

1. **Utilities:** Pure functions, data transformations
2. **Services:** Business logic, API interactions
3. **Controllers:** Request/response handling (mock Express objects)
4. **Models:** Mongoose schema validation
5. **Middleware:** Authentication, authorization, error handling

## Frontend Testing

### Configuration

Frontend tests are configured in `packages/frontend/vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.config.*', '**/test-utils/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Structure

Tests are in `packages/frontend/src/__tests__/`:

```
packages/frontend/src/
├── __tests__/
│   ├── setup.test.jsx
│   ├── ComponentExample.test.jsx
│   └── utils.test.js
├── components/
├── pages/
└── utils/
```

### Example Frontend Component Test

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@chakra-ui/react';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### What to Test in Frontend

1. **Components:** Rendering, props, user interactions
2. **Hooks:** Custom React hooks behavior
3. **Utils:** Pure functions, formatters, validators
4. **Context:** State management, providers
5. **Services:** API client functions (with mocks)

## Writing Tests

### Test Data Constants

**IMPORTANT:** Always define test data as constants at the top of the test file. This makes tests maintainable and allows changing test values in one place.

```typescript
// ✅ Good - Define constants at the top
import { describe, it, expect } from 'vitest';

// Test data constants
const TEST_USER_ID = '507f1f77bcf86cd799439011';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'SecurePassword123!';
const ERROR_MESSAGE = 'Invalid credentials';

describe('Auth Tests', () => {
  it('should authenticate user', () => {
    const user = { id: TEST_USER_ID, email: TEST_EMAIL };
    expect(user.email).toBe(TEST_EMAIL);
  });
});
```

```typescript
// ❌ Bad - Hardcoded values scattered throughout
describe('Auth Tests', () => {
  it('should authenticate user', () => {
    const user = { id: '507f1f77bcf86cd799439011', email: 'test@example.com' };
    expect(user.email).toBe('test@example.com'); // Hard to maintain
  });

  it('should hash password', () => {
    const password = 'SecurePassword123!'; // Duplicated value
    // ...
  });
});
```

**Benefits:**

- Single source of truth for test data
- Easy to update values across all tests
- Improves test readability
- Reduces duplication and typos
- Makes test intent clearer with descriptive constant names

### Test Organization

Use `describe` blocks to group related tests:

```javascript
describe('User Authentication', () => {
  describe('Login', () => {
    it('should authenticate valid credentials', () => {});
    it('should reject invalid credentials', () => {});
  });

  describe('Registration', () => {
    it('should create new user', () => {});
    it('should validate email format', () => {});
  });
});
```

### Test Naming

Use clear, descriptive test names:

```javascript
// ✅ Good
it('should return 400 when email is missing', () => {});
it('should hash password before saving to database', () => {});

// ❌ Bad
it('works', () => {});
it('test email', () => {});
```

### Assertions

Use appropriate matchers:

```javascript
// Equality
expect(value).toBe(5);
expect(object).toEqual({ name: 'John' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(0.3);

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// DOM (frontend)
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Hello');
expect(input).toHaveValue('test');
```

### Mocking

**Vitest Mocks:**

```javascript
import { vi } from 'vitest';

// Mock functions
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });

// Mock modules
vi.mock('./module', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}));
```

**Frontend API Mocks:**

```javascript
import { vi } from 'vitest';
import apiClient from '@/config/apiClient';

// Mock API call
vi.mock('@/config/apiClient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { users: [] } })),
    post: vi.fn(),
  },
}));
```

### Async Tests

```javascript
// Using async/await
it('should fetch user data', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});

// Using promises
it('should handle errors', () => {
  return fetchUser(-1).catch((error) => {
    expect(error.message).toMatch('not found');
  });
});
```

## Coverage Reports

### Generating Coverage

```bash
# All packages
npm run test:coverage

# Specific package
npm run test:coverage --workspace=@muminbook/backend
```

### Viewing Coverage

After running coverage:

1. **Terminal:** View summary in console
2. **HTML Report:** Open `packages/*/coverage/index.html` in browser
3. **JSON:** Parse `packages/*/coverage/coverage-final.json`

### Coverage Goals

Aim for these minimum thresholds:

- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

**Priority Areas:**

- Critical business logic: 90%+
- Authentication/authorization: 95%+
- Utilities: 85%+
- UI components: 70%+

## Best Practices

### General

1. **Write tests first** when adding new features (TDD)
2. **Keep tests independent** - no shared state between tests
3. **Use descriptive names** - tests serve as documentation
4. **Test behavior, not implementation** - focus on what, not how
5. **Mock external dependencies** - database, APIs, file system
6. **Run tests frequently** - use watch mode during development

### Backend Specific

1. **Mock database calls** - use test database or mocks
2. **Test error handling** - verify proper error responses
3. **Validate input** - test schema validation thoroughly
4. **Test middleware** - authentication, authorization separately
5. **Use test fixtures** - consistent test data

### Frontend Specific

1. **Test user interactions** - clicks, typing, form submissions
2. **Query by role/label** - prefer accessibility queries
3. **Mock API calls** - don't make real HTTP requests
4. **Test loading states** - async UI behavior
5. **Avoid implementation details** - don't test internal state

### Don't Test

1. **Third-party libraries** - trust they're tested
2. **Framework internals** - React, Express, etc.
3. **Trivial code** - simple getters/setters
4. **Implementation details** - internal variable names
5. **Constants** - static configuration values

### Islamic Principles in Testing

Following the values from CONTRIBUTING.md:

- **Ihsan (Excellence):** Write clean, thorough tests
- **Ikhlas (Sincerity):** Test to improve quality, not just coverage metrics
- **Sabr (Patience):** Take time to write proper tests
- **Amanah (Trust):** Ensure code reliability through testing

## Troubleshooting

### Common Issues

**Tests not found:**

```bash
# Ensure test files match pattern: *.test.js, *.test.ts, *.test.jsx
# Check vitest.config include/exclude patterns
```

**Import errors:**

```bash
# Verify path aliases in vitest.config
# Check that '@' alias points to 'src' directory
```

**Module mock not working:**

```javascript
// Ensure vi.mock() is called before imports
vi.mock('./module');
import { something } from './module'; // ✅
```

**React Testing Library errors:**

```bash
# Ensure jsdom environment in config
# Verify vitest.setup.js imports @testing-library/jest-dom
```

### Getting Help

1. Check [Vitest documentation](https://vitest.dev/)
2. Review [Testing Library docs](https://testing-library.com/)
3. See example tests in codebase
4. Ask in team discussions

---

**Remember:** Good tests make better software and give confidence when refactoring or adding features. Test with care and excellence (Ihsan)! 🚀
