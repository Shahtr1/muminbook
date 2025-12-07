# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation
  - CONTRIBUTING.md with development guidelines and workflow
  - docs/ARCHITECTURE.md explaining system design and architecture
  - docs/DEVELOPMENT.md with detailed local setup instructions
  - docs/DEPLOYMENT.md with production deployment guide
- Root-level package.json for monorepo management
- Docker support with docker-compose.yml for local development
- Dockerfiles for backend and frontend
- GitHub Actions CI/CD workflows
- Pull request and issue templates
- Enhanced README.md with badges and better structure

### Changed
- Improved .gitignore with comprehensive patterns
- Enhanced project structure and organization

### Fixed
- Fixed JSX syntax error in FileView.jsx component

## [1.0.0] - 2025-01-21

### Added
- Initial release of Muminbook platform
- MERN stack foundation (MongoDB, Express.js, React, Node.js)
- Backend API with TypeScript
- React frontend with Vite
- User authentication with JWT
- Chakra UI component library
- MongoDB integration with Mongoose
- Quran reading features
- Daily Islamic content (Verse, Hadith, Dua of the day)
- Islamic calendar integration
- Study rooms feature
- Resource management

### Frontend Features
- React 18 with modern hooks
- Chakra UI for styling
- React Query for server state management
- React Router for navigation
- Monaco Editor integration
- Responsive design
- ESLint configuration

### Backend Features
- Express.js REST API
- TypeScript configuration
- Mongoose models
- JWT authentication
- Password hashing with bcrypt
- Zod validation
- CORS configuration
- Email integration with Resend
- Scheduled jobs with node-cron

---

## Release Types

- **Major**: Incompatible API changes
- **Minor**: Backwards-compatible functionality additions
- **Patch**: Backwards-compatible bug fixes

## Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes
