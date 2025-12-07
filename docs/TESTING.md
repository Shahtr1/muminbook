# Testing Guide

This guide covers testing strategies and best practices for Muminbook.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Best Practices](#testing-best-practices)

## Testing Philosophy

We follow these principles:
- **Test behavior, not implementation** - Focus on what users experience
- **Aim for meaningful coverage** - Not 100%, but critical paths covered
- **Write tests alongside features** - Tests are part of the feature, not an afterthought
- **Keep tests simple and readable** - Tests are documentation

## Frontend Testing

### Tech Stack

- **Vitest** - Test runner (Vite-native, fast)
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - DOM matchers

### What to Test

**✅ DO Test:**
- User interactions (clicks, typing, navigation)
- Conditional rendering based on props/state
- Integration with React Query
- Error states and loading states
- Accessibility features

**❌ DON'T Test:**
- Implementation details (state variable names, internal methods)
- Third-party libraries (they have their own tests)
- Styling (unless critical to functionality)

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.jsx

# Run with coverage
npm test -- --coverage
```

### Example Frontend Test

```jsx
// components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Testing with React Query

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

// Wrapper component
function Wrapper({ children }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Test
it('fetches and displays data', async () => {
  render(<MyComponent />, { wrapper: Wrapper });
  
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });
});
```

### Mocking API Calls

```jsx
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  fetchUsers: vi.fn(),
}));

// In test
api.fetchUsers.mockResolvedValue([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
]);
```

## Backend Testing

### Planned Testing Infrastructure

Backend testing should be implemented with:
- **Jest** or **Vitest** - Test runner
- **Supertest** - HTTP assertion library
- **mongodb-memory-server** - In-memory MongoDB for tests

### What to Test

**✅ DO Test:**
- API endpoints (status codes, response format)
- Authentication and authorization
- Input validation
- Error handling
- Database operations (with test database)
- Business logic in services

**❌ DON'T Test:**
- External APIs (mock them instead)
- Database implementation details

### Example Backend Test Structure

```typescript
// controllers/users.test.ts
import request from 'supertest';
import { app } from '../app';
import { connectTestDB, closeTestDB } from '../utils/testDb';

describe('User Endpoints', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });
    });

    it('returns 400 for invalid email', async () => {
      await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });
});
```

### Service Layer Testing

```typescript
// services/userService.test.ts
import { createUser, getUserById } from './userService';
import { User } from '../models/User';

describe('UserService', () => {
  describe('createUser', () => {
    it('creates user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const user = await createUser(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash length
    });
  });
});
```

## Running Tests

### Frontend

```bash
# From root
npm run test

# From frontend directory
cd frontend
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- Button.test.jsx
```

### Backend (when implemented)

```bash
cd backend
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Writing Tests

### Test Structure

Follow the AAA pattern:
1. **Arrange** - Set up test data and conditions
2. **Act** - Execute the code being tested
3. **Assert** - Verify the results

```javascript
describe('Component/Feature', () => {
  it('does something specific', () => {
    // Arrange
    const initialValue = 5;
    
    // Act
    const result = double(initialValue);
    
    // Assert
    expect(result).toBe(10);
  });
});
```

### Naming Conventions

**Good test names:**
- ✅ "renders button with provided text"
- ✅ "calls onSubmit when form is valid"
- ✅ "shows error message when API fails"

**Poor test names:**
- ❌ "test button"
- ❌ "works correctly"
- ❌ "test1"

### Test Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx
│   │   └── index.js
```

Or use a `__tests__` directory:

```
src/
├── components/
│   ├── Button/
│   │   ├── __tests__/
│   │   │   └── Button.test.jsx
│   │   ├── Button.jsx
│   │   └── index.js
```

## Testing Best Practices

### 1. Test User Behavior

❌ Don't test implementation:
```jsx
it('updates count state', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);
});
```

✅ Test what user sees:
```jsx
it('displays count starting at 0', () => {
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
```

### 2. Avoid Testing Implementation Details

❌ Don't:
```jsx
expect(wrapper.find('.button-class')).toHaveLength(1);
```

✅ Do:
```jsx
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
```

### 3. Use Accessible Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - If no label
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

### 4. Test Async Behavior Properly

Use `waitFor` for async operations:

```jsx
it('shows data after loading', async () => {
  render(<DataDisplay />);
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  
  // Check data is displayed
  expect(screen.getByText(/data content/i)).toBeInTheDocument();
});
```

### 5. Keep Tests Independent

Each test should be able to run in isolation:

```jsx
describe('TodoList', () => {
  beforeEach(() => {
    // Reset state before each test
    cleanup();
  });

  it('adds todo', () => {
    // Test adds todo
  });

  it('removes todo', () => {
    // Test removes todo
  });
});
```

### 6. Mock External Dependencies

```jsx
// Mock API calls
vi.mock('../services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' }),
}));
```

### 7. Test Error States

```jsx
it('shows error message when API fails', async () => {
  // Mock API to reject
  api.fetchData.mockRejectedValue(new Error('API Error'));
  
  render(<DataDisplay />);
  
  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });
});
```

### 8. Use Test IDs Sparingly

Only use `data-testid` when other queries don't work:

```jsx
// Last resort
<div data-testid="custom-component">...</div>

// In test
screen.getByTestId('custom-component');
```

## Code Coverage

### Viewing Coverage

```bash
npm test -- --coverage
```

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 80%+

**Remember**: High coverage doesn't guarantee quality. Focus on meaningful tests.

## Debugging Tests

### Use debug()

```jsx
import { render, screen } from '@testing-library/react';

it('test name', () => {
  render(<Component />);
  
  // Print current DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### Run Single Test

```bash
# Only run tests matching pattern
npm test -- -t "test name"

# Or use it.only
it.only('this test runs alone', () => {
  // ...
});
```

### Verbose Output

```bash
npm test -- --verbose
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Push to main/develop branches
- Via GitHub Actions (see `.github/workflows/ci.yml`)

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

*This guide will be updated as testing infrastructure evolves.*
