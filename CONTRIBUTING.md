# Contributing to Muminbook

First off, thank you for considering contributing to Muminbook! 🎉 It's people like you that make Muminbook a great platform for the Muslim community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case** for the feature
- **Benefits** to users
- **Potential implementation** approach (if you have ideas)

### Your First Code Contribution

Unsure where to start? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Need community assistance
- `documentation` - Documentation improvements

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 18.0.0 (use `.nvmrc` file)
- npm >= 9.0.0
- MongoDB (local or Atlas)

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/muminbook.git
cd muminbook

# 2. Use the correct Node version
nvm use

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp packages/backend/sample.env packages/backend/.env
cp packages/frontend/sample.env packages/frontend/.env
# Edit .env files with your configuration

# 5. Start development servers
npm run dev
```

### Project Structure

```
muminbook/
├── packages/
│   ├── backend/         # Express API server
│   └── frontend/        # React application
├── docs/                # Documentation
└── package.json         # Root workspace config
```

## 🔄 Pull Request Process

### Before Submitting

1. **Create a branch** from `master`

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Follow coding standards** (see below)

3. **Test your changes**

   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Update documentation** if needed

5. **Write clear commit messages** (see guidelines below)

### Submitting the PR

1. Push your branch to your fork
2. Open a Pull Request to `master`
3. Fill out the PR template completely
4. Link related issues (e.g., "Closes #123")
5. Request review from maintainers

### PR Review Process

- At least one maintainer approval required
- All CI checks must pass
- Address review comments promptly
- Keep PR focused on a single feature/fix
- Squash commits if requested

## 💻 Coding Standards

### General Guidelines

- **Write clean, readable code**
- **Add comments** for complex logic
- **Follow existing patterns** in the codebase
- **Keep functions small** and focused
- **Use meaningful variable names**

### Backend (Node.js/TypeScript)

```typescript
// ✅ Good
async function getUserById(userId: string): Promise<User> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

// ❌ Avoid
async function getUser(id: any) {
  return await UserModel.findById(id);
}
```

**Standards:**

- Use TypeScript types
- Handle errors properly
- Use async/await over promises
- Follow MVC pattern
- Validate input with Zod

### Frontend (React/JavaScript)

```jsx
// ✅ Good
export const UserCard = ({ user, onEdit }) => {
  const handleEdit = () => {
    onEdit(user.id);
  };

  return (
    <Box p={4}>
      <Text>{user.name}</Text>
      <Button onClick={handleEdit}>Edit</Button>
    </Box>
  );
};

// ❌ Avoid
function UserCard(props) {
  return (
    <div>
      {props.user.name}
      <button onClick={() => props.onEdit(props.user.id)}>Edit</button>
    </div>
  );
}
```

**Standards:**

- Use functional components
- Destructure props
- Use React hooks properly
- Follow Chakra UI patterns
- Keep components small

### File Naming

- **Components:** `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- **Utils/Hooks:** `camelCase.js` (e.g., `useAuth.js`)
- **Models:** `kebab-case.model.ts` (e.g., `user.model.ts`)
- **Routes:** `kebab-case.route.ts` (e.g., `auth.route.ts`)

### Code Formatting

- **Indentation:** 2 spaces (enforced by `.editorconfig`)
- **Line length:** Max 100 characters (soft limit)
- **Semicolons:** Use them in TypeScript/JavaScript
- **Quotes:** Double quotes for strings
- **Trailing commas:** Yes

## 📝 Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(auth): add password reset functionality

# Bug fix
fix(frontend): resolve login redirect issue

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(backend): simplify user service logic
```

## 🧪 Testing Guidelines

### Write Tests For

- New features
- Bug fixes
- Critical paths (auth, payment, etc.)

### Running Tests

```bash
# All tests
npm run test

# Specific workspace
npm run test:backend
npm run test:frontend

# Watch mode
cd packages/backend && npm run test -- --watch
```

## 🙋 Questions?

- **General questions:** Use [GitHub Discussions](https://github.com/Shahtr1/muminbook/discussions)
- **Bug reports:** Open an [issue](https://github.com/Shahtr1/muminbook/issues)
- **Security concerns:** Email the maintainer directly

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [Architecture Docs](docs/) - Technical documentation
- [API Docs](docs/API.md) - API reference

---

**Thank you for contributing to Muminbook! May Allah reward your efforts. 🤲**
