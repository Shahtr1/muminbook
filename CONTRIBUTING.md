# Contributing to Muminbook

Thank you for your interest in contributing to Muminbook! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project aims to provide a respectful and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate in communications
- Focus on constructive feedback
- Accept responsibility and apologize for mistakes
- Prioritize what's best for the community

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6 or higher)
- Git

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/muminbook.git
   cd muminbook
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Shahtr1/muminbook.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up environment variables:
   ```bash
   cp backend/sample.env backend/.env
   cp frontend/sample.env frontend/.env
   # Edit the .env files with your configuration
   ```

6. Start the development servers:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation changes
- `refactor/description` - for code refactoring
- `test/description` - for adding or updating tests

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the [Coding Standards](#coding-standards)

3. Test your changes thoroughly:
   ```bash
   npm test
   npm run lint
   ```

4. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat: add user profile editing functionality"
   ```

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Example:**
```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request a password reset link via email.

Closes #123
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style in the project
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### JavaScript/TypeScript

- Use ES6+ features where appropriate
- Use `const` by default, `let` only when reassignment is needed
- Avoid `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Use destructuring when it improves readability

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use PropTypes or TypeScript for type checking
- Follow the single responsibility principle

### Backend

- Use async/await for asynchronous operations
- Handle errors appropriately with try-catch blocks
- Validate input data using Zod schemas
- Follow RESTful API conventions
- Document API endpoints with comments or OpenAPI

### Linting

The project uses ESLint for code quality. Run the linter before committing:

```bash
npm run lint
```

Fix linting issues automatically where possible:

```bash
npm run lint:frontend -- --fix
```

## Submitting Changes

### Pull Request Process

1. Update your branch with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to related issues (e.g., "Closes #123")
   - Screenshots for UI changes
   - List of breaking changes (if any)

4. Wait for review and address feedback

### Pull Request Checklist

Before submitting, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow the convention
- [ ] No unnecessary files are included
- [ ] Environment variables are documented (if added)

## Testing Guidelines

### Frontend Testing

The frontend uses Vitest and React Testing Library:

```bash
cd frontend
npm test
```

**Guidelines:**
- Write tests for new components and features
- Test user interactions, not implementation details
- Aim for meaningful test coverage, not 100% coverage
- Mock external dependencies appropriately

### Backend Testing

Backend testing infrastructure should be added. Consider:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database mocking for tests

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### Project Documentation

When adding new features, update:
- README.md (if it affects usage)
- API documentation (for new endpoints)
- Architecture documentation (for significant changes)

## Questions or Issues?

- Check existing issues on GitHub
- Join our community discussions
- Reach out to maintainers if needed

## License

By contributing to Muminbook, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Muminbook! 🌟
