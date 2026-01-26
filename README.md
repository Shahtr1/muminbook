![Muminbook logo](./packages/frontend/public/images/logos/logo-with-image.png 'Muminbook')

**A Modern Islamic Community Platform**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

_Empowering Muslims worldwide to share knowledge, study Quran & Hadith collaboratively, and connect through live study rooms_

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing) • [Support](#support)

---

## About Muminbook

Muminbook is a full-stack MERN monorepo (npm workspaces) that provides a community platform for Islamic learning and collaboration. The project contains two primary packages:

- `packages/backend` — Node.js + Express + TypeScript API server
- `packages/frontend` — React + Vite single-page application

This README has been updated to reflect the current repository state (scripts, environment variables, and documentation links). For deeper technical documentation see the `docs/` folder (linked below).

## Features

- Collaborative study rooms and live sessions
- User authentication with JWT access and refresh tokens
- Role-based access control for admins and contributors
- REST API backend with TypeScript, Mongoose schemas and validation (Zod)
- Rich editor and flow-based UI in the frontend (Monaco + React Flow)
- Email sending via Resend and background jobs (cron)
- Tests with Vitest for both frontend and backend

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- Git

(These are enforced via `package.json` engines and the backend expects a MongoDB connection for normal operation.)

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/Shahtr1/muminbook.git
cd muminbook
```

2. Install dependencies (root workspace installs both packages)

```bash
npm install
```

3. Create environment files

- Backend: copy the sample file

```bash
cp packages/backend/sample.env packages/backend/.env
```

- Frontend: copy the sample file

```bash
cp packages/frontend/sample.env packages/frontend/.env
```

Edit the `.env` files with appropriate values (see notes below).

4. Run both backend and frontend concurrently (development)

```bash
npm run dev
```

Or run them individually:

```bash
npm run backend    # runs backend in workspace @muminbook/backend
npm run frontend   # runs frontend dev server in workspace @muminbook/frontend
```

Access the apps in your browser:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/

## 📁 Workspace scripts (summary)

The root `package.json` exposes helpful workspace scripts. Key scripts (run from repo root):

- `npm run dev` — runs backend and frontend concurrently
- `npm run backend` — run backend scripts in its workspace
- `npm run frontend` — run frontend dev server in its workspace
- `npm run build` — build all workspaces (if present)
- `npm run build:backend` — build backend (TypeScript)
- `npm run build:frontend` — build frontend (Vite)
- `npm run start:backend` — start production backend (runs backend `start` script)
- `npm run preview:frontend` — preview production frontend build
- `npm run lint` — run lint across workspaces (if configured)
- `npm run format` / `npm run format:check` — run Prettier formatting
- `npm run clean` — remove node_modules folders (note: uses `rm -rf`, run in bash-compatible shells)
- `npm run test` — run tests across workspaces (if present)

For package-specific scripts see `packages/backend/package.json` and `packages/frontend/package.json`.

## 🔧 Environment variables (important)

Backend environment variables live in `packages/backend/.env` (copy from `packages/backend/sample.env`). Important keys you should set:

- NODE_ENV (development | production | test)
- PORT (default: 5000)
- APP_ORIGIN (frontend origin, e.g. http://localhost:5173)
- MONGO_URI (mongodb://localhost:27017/muminbook or Atlas URI)
- JWT_SECRET — access token secret (note: this repository previously referenced `JWT_ACCESS_SECRET`; current code uses `JWT_SECRET`)
- JWT_REFRESH_SECRET — refresh token secret
- JWT_ACCESS_EXPIRES_IN (optional, default in code)
- JWT_REFRESH_EXPIRES_IN (optional)
- RESEND_API_KEY — API key for Resend email service
- EMAIL_SENDER — verified sender address

Note: If you have an older `.env` referencing `JWT_ACCESS_SECRET`, rename it to `JWT_SECRET` or update the code accordingly.

Frontend environment variables live in `packages/frontend/.env` (copy from `packages/frontend/sample.env`). Typical value:

- VITE_API_URL — backend API base URL (e.g. http://localhost:5000)

## Testing

- Frontend tests: `cd packages/frontend && npm run test` (or `npm run test:frontend` from repo root)
- Backend tests: `cd packages/backend && npm run test` (or `npm run test:backend` from repo root)

Note: The project uses Vitest for testing in both packages.

## Documentation

This repository includes additional documentation in the `docs/` folder. Please refer to these for deep dives, architecture, deployment and CI/CD details:

- docs/API.md — API endpoints and schemas
- docs/ARCHITECTURE.md — architecture overview
- docs/CI-CD.md — CI/CD pipeline notes
- docs/DEPLOYMENT.md — deployment instructions
- docs/DEV-TOOLS.md — local development utilities and tips
- docs/DEVELOPMENT.md — developer onboarding and guidelines
- docs/DOCKER.md — Docker & docker-compose notes
- docs/SETUP.md — environment & project setup guide
- docs/TESTING.md — testing guide and commands

(Keep these documents up-to-date as you change behavior or environment variables.)

## Technology stack (high level)

Backend: Node.js + Express + TypeScript + Mongoose + Zod + JWT + Resend (email)
Frontend: React + Vite + Chakra UI + React Router + React Query + Monaco Editor + React Flow

See individual `package.json` files for current dependency versions.

## Quality & Developer tooling

- ESLint & Prettier for code style
- Husky + Commitlint + Commitizen for commit conventions
- Vitest for unit tests
- Concurrently to run backend & frontend in development

## Building for production

Build both packages:

```bash
npm run build
```

Build individually:

```bash
npm run build:backend
npm run build:frontend
```

Start production backend:

```bash
npm run start:backend
```

Preview frontend production bundle:

```bash
npm run preview:frontend
```

## Cleaning up

To remove installed node modules (works in bash-compatible shells):

```bash
npm run clean
```

To clean and reinstall:

```bash
npm run clean:install
```

## Contributing

We welcome contributions. See `CONTRIBUTING.md` for contribution guidelines and `CODE_OF_CONDUCT.md` for behavior expectations.

Typical workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome`
3. Commit and push your changes
4. Open a Pull Request

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.

## Support

If you need help or want to report an issue please:

- Open an issue on the repository
- For quick questions, check `docs/SETUP.md` and `docs/DEVELOPMENT.md`

If you'd like to contribute, see `CONTRIBUTING.md` for the workflow and `CODE_OF_CONDUCT.md` for expectations.

---

**Made with ❤️ for the Muslim Ummah**

"Read! In the Name of your Lord, Who has created" - Quran 96:1

[⬆ Back to Top](#muminbook)
