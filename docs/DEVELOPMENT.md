# 💻 Development Guide

Complete guide for developing Muminbook features and contributing code.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Common Errors](#common-errors)
- [Git Workflow](#git-workflow)
- [Performance Tips](#performance-tips)

---

## 🚀 Getting Started

### Prerequisites

Ensure you've completed the [Setup Guide](SETUP.md) first.

### Development Tools

**Recommended VS Code Extensions:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "chakra-ui.chakra-ui-snippets",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### Start Development

```bash
# Start both servers
npm run dev

# Or start individually
npm run backend   # http://localhost:5000
npm run frontend  # http://localhost:5173
```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow the [Code Standards](#code-standards) section.

### 3. Test Locally

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Build to check for errors
npm run build
```

### 4. Commit Changes

Follow [Commit Guidelines](../CONTRIBUTING.md#commit-message-guidelines):

```bash
git add .
git commit -m "feat(auth): add password strength indicator"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

---

## 📏 Code Standards

### Backend Standards

#### File Structure

```typescript
// packages/backend/src/controllers/example.controller.ts
import { Request, Response } from "express";
import { exampleService } from "../services/example.service";
import { OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";

export const exampleHandler = catchErrors(
  async (req: Request, res: Response) => {
    const result = await exampleService(req.body);
    return res.status(OK).json(result);
  },
);
```

#### Service Layer

```typescript
// packages/backend/src/services/example.service.ts
import { UserModel } from "../models/user.model";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";

export const exampleService = async (userId: string) => {
  const user = await UserModel.findById(userId);

  appAssert(user, NOT_FOUND, "User not found");

  return {
    user,
    message: "Success",
  };
};
```

#### Model Definition

```typescript
// packages/backend/src/models/example.model.ts
import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ExampleModel = mongoose.model("Example", exampleSchema);
```

#### Route Definition

```typescript
// packages/backend/src/routes/example.route.ts
import { Router } from "express";
import { exampleHandler } from "../controllers/example.controller";

const exampleRoutes = Router();

// prefix: /example
exampleRoutes.get("/", exampleHandler);

export default exampleRoutes;
```

### Frontend Standards

#### Component Structure

```jsx
// packages/frontend/src/components/ExampleComponent.jsx
import { Box, Text, Button } from "@chakra-ui/react";
import { useState } from "react";

export const ExampleComponent = ({ title, onAction }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    onAction?.(count);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="xl" mb={2}>
        {title}
      </Text>
      <Text>Count: {count}</Text>
      <Button onClick={handleClick} mt={2}>
        Increment
      </Button>
    </Box>
  );
};
```

#### Custom Hooks

```jsx
// packages/frontend/src/hooks/useExample.js
import { useQuery } from "@tanstack/react-query";
import { getExample } from "@/services/api";

export const useExample = (id) => {
  return useQuery({
    queryKey: ["example", id],
    queryFn: () => getExample(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### API Service

```jsx
// packages/frontend/src/services/api/exampleApi.js
import apiClient from "@/config/apiClient";

export const getExample = async (id) => {
  const { data } = await apiClient.get(`/example/${id}`);
  return data;
};

export const createExample = async (payload) => {
  const { data } = await apiClient.post("/example", payload);
  return data;
};
```

### Naming Conventions

| Type                 | Convention       | Example            |
| -------------------- | ---------------- | ------------------ |
| **Files**            | kebab-case       | `user-profile.jsx` |
| **Components**       | PascalCase       | `UserProfile`      |
| **Functions**        | camelCase        | `getUserById`      |
| **Constants**        | UPPER_SNAKE_CASE | `API_BASE_URL`     |
| **Interfaces/Types** | PascalCase       | `UserData`         |
| **Variables**        | camelCase        | `userEmail`        |

---

## 🧪 Testing

### Backend Testing

```bash
# Run tests
cd packages/backend
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

**Example Test:**

```typescript
// packages/backend/src/__tests__/auth.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../utils/bcrypt";

describe("Password Utilities", () => {
  it("should hash password correctly", async () => {
    const password = "Test123!";
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed).toHaveLength(60);
  });

  it("should verify password correctly", async () => {
    const password = "Test123!";
    const hashed = await hashPassword(password);

    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });
});
```

### Frontend Testing

```bash
# Run tests
cd packages/frontend
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

**Example Test:**

```jsx
// packages/frontend/src/__tests__/UserCard.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserCard } from "../components/UserCard";

describe("UserCard", () => {
  it("renders user information", () => {
    const user = { name: "John Doe", email: "john@example.com" };
    render(<UserCard user={user} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("calls onEdit when button clicked", () => {
    const onEdit = vi.fn();
    const user = { id: "123", name: "John Doe" };

    render(<UserCard user={user} onEdit={onEdit} />);
    fireEvent.click(screen.getByText("Edit"));

    expect(onEdit).toHaveBeenCalledWith("123");
  });
});
```

---

## 🐛 Debugging

### Backend Debugging

#### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "backend"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Console Logging

```typescript
// Add debug logging
console.log("[DEBUG] User data:", user);
console.error("[ERROR] Failed to save:", error);
```

### Frontend Debugging

#### React DevTools

Install [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension.

#### Network Debugging

```javascript
// Log all API requests
// packages/frontend/src/config/apiClient.js
apiClient.interceptors.request.use((config) => {
  console.log("[API Request]", config.method.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("[API Response]", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("[API Error]", error.response?.data);
    return Promise.reject(error);
  },
);
```

---

## ⚙️ Common Tasks

### Add a New API Endpoint

**1. Create Controller:**

```typescript
// packages/backend/src/controllers/feature.controller.ts
export const featureHandler = catchErrors(async (req, res) => {
  // Implementation
});
```

**2. Create Route:**

```typescript
// packages/backend/src/routes/feature.route.ts
import { Router } from "express";
import { featureHandler } from "../controllers/feature.controller";

const featureRoutes = Router();
featureRoutes.get("/", featureHandler);
export default featureRoutes;
```

**3. Register Route:**

```typescript
// packages/backend/src/app.ts
import featureRoutes from "./routes/feature.route";
app.use("/feature", authenticate(), featureRoutes);
```

### Add a New React Page

**1. Create Page Component:**

```jsx
// packages/frontend/src/pages/NewPage.jsx
export const NewPage = () => {
  return <div>New Page Content</div>;
};
```

**2. Add Route:**

```jsx
// packages/frontend/src/App.jsx
import { NewPage } from "./pages/NewPage";

<Route path="/new-page" element={<NewPage />} />;
```

### Add a Database Model

```typescript
// packages/backend/src/models/new-feature.model.ts
import mongoose from "mongoose";

const newFeatureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Add fields
  },
  { timestamps: true },
);

export const NewFeatureModel = mongoose.model("NewFeature", newFeatureSchema);
```

### Add Environment Variable

**1. Add to sample.env:**

```env
# packages/backend/sample.env
NEW_FEATURE_API_KEY=your_key_here
```

**2. Add to constants:**

```typescript
// packages/backend/src/constants/env.ts
export const NEW_FEATURE_API_KEY = process.env.NEW_FEATURE_API_KEY || "";
```

**3. Update SETUP.md documentation**

---

## ❌ Common Errors

### "Cannot find module"

**Solution:**

```bash
npm run clean:install
```

### "Port already in use"

**Solution:**

```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### "MongoDB connection failed"

**Solution:**

1. Check if MongoDB is running
2. Verify `MONGO_URI` in `.env`
3. Check network/firewall settings

### "CORS error in browser"

**Solution:**

1. Check `APP_ORIGIN` in backend `.env`
2. Ensure frontend URL matches exactly
3. Clear browser cache

### "JWT token invalid"

**Solution:**

1. Logout and login again
2. Check token expiration settings
3. Verify `JWT_SECRET` hasn't changed

---

## 🔀 Git Workflow

### Branch Naming

```
feature/feature-name   # New features
fix/bug-description    # Bug fixes
docs/update-readme     # Documentation
refactor/cleanup-auth  # Code refactoring
chore/update-deps      # Maintenance
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(auth): add OAuth2 support
fix(api): resolve CORS issue
docs(readme): update installation steps
refactor(backend): simplify error handling
chore(deps): update dependencies
```

### Before Pushing

```bash
# 1. Pull latest changes
git pull origin master

# 2. Run linting
npm run lint

# 3. Run tests
npm run test

# 4. Build check
npm run build
```

---

## ⚡ Performance Tips

### Backend

1. **Use Indexes:**

   ```typescript
   userSchema.index({ email: 1 }, { unique: true });
   ```

2. **Select Only Needed Fields:**

   ```typescript
   User.find().select("name email -_id");
   ```

3. **Avoid N+1 Queries:**
   ```typescript
   User.find().populate("role");
   ```

### Frontend

1. **Lazy Load Components:**

   ```jsx
   const LazyComponent = lazy(() => import("./Component"));
   ```

2. **Memoize Expensive Calculations:**

   ```jsx
   const value = useMemo(() => expensiveCalc(data), [data]);
   ```

3. **Debounce Input:**
   ```jsx
   const debouncedSearch = useDebounce(searchTerm, 300);
   ```

---

## 📚 Additional Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [API Documentation](API.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Setup Guide](SETUP.md)

---

_Last updated: December 8, 2025_
