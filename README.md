<div align="center">

# 📖 Muminbook

**A Modern Islamic Community Platform**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI Pipeline](https://github.com/Shahtr1/muminbook/actions/workflows/ci.yml/badge.svg)](https://github.com/Shahtr1/muminbook/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-188%20passing-success)](https://github.com/Shahtr1/muminbook/actions)

_Empowering Muslims worldwide to share knowledge, study Quran & Hadith collaboratively, and connect through live study rooms_

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [Support](#-support)

---

</div>

## 🌟 About Muminbook

Muminbook is a full-stack MERN application designed to serve as a comprehensive community platform for Muslims. Whether you're a student seeking knowledge, a teacher sharing wisdom, or a community member looking to connect, Muminbook provides the tools and environment to foster Islamic learning and collaboration.

### 🎯 Key Features

- **📚 Collaborative Quran Study** - Read, study, and discuss Quranic verses with the community
- **📜 Hadith Collections** - Access and share authentic Hadith literature
- **🏫 Live Study Rooms** - Connect with teachers and students in real-time
- **👥 Community Features** - Share knowledge, ask questions, and engage with fellow Muslims
- **🌳 Family Tree Visualization** - Explore Islamic historical connections
- **📂 Resource Library** - Store and organize Islamic learning materials
- **🔐 Secure Authentication** - Protected user accounts with email verification

## 🔗 Project Links

| Resource             | Link                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **📋 Task Board**    | [Notion Board](https://www.notion.so/1f87449dbc4780c088e9d60174e52db2?v=1f87449dbc4780a78a05000c04e67009&pvs=4) |
| **🎨 Design System** | [Figma Designs](https://www.figma.com/design/SYiIw3zJ5Qr3mrUcMGBysb/muminbook?node-id=0-1&t=8g78x9ge92aUWwK0-1) |
| **🐛 Issues**        | [GitHub Issues](https://github.com/Shahtr1/muminbook/issues)                                                    |
| **💬 Discussions**   | [GitHub Discussions](https://github.com/Shahtr1/muminbook/discussions)                                          |

## 🛠️ Technology Stack

### Backend

| Technology     | Purpose              | Version   |
| -------------- | -------------------- | --------- |
| **Node.js**    | Runtime environment  | >= 18.0.0 |
| **Express.js** | REST API framework   | ^4.21.2   |
| **TypeScript** | Type-safe JavaScript | ^5.7.3    |
| **MongoDB**    | NoSQL database       | ^6.12.0   |
| **Mongoose**   | MongoDB ODM          | ^8.9.5    |
| **Zod**        | Schema validation    | ^3.24.1   |
| **JWT**        | Authentication       | ^9.0.2    |
| **Bcrypt**     | Password hashing     | ^5.1.1    |
| **Resend**     | Email service        | ^4.1.1    |

### Frontend

| Technology        | Purpose                 | Version  |
| ----------------- | ----------------------- | -------- |
| **React**         | UI library              | ^18.3.1  |
| **Vite**          | Build tool              | ^6.0.5   |
| **TypeScript**    | Type safety             | Latest   |
| **Chakra UI**     | Component library       | ^2.10.6  |
| **React Query**   | Server state management | ^5.65.1  |
| **React Router**  | Navigation              | ^7.1.3   |
| **Monaco Editor** | Code editing            | ^4.7.0   |
| **React Flow**    | Diagram visualization   | ^11.11.4 |
| **Axios**         | HTTP client             | ^1.7.9   |

### DevOps & Tools

- **NPM Workspaces** - Monorepo management
- **ESLint** - Code linting
- **Concurrently** - Run multiple scripts
- **Node Cron** - Scheduled jobs

### 🏗️ Architecture Patterns

- **MVC Pattern** - Backend follows Model-View-Controller architecture
- **Component-Based** - Frontend uses modular React components
- **Service Layer** - Business logic separated from controllers
- **Middleware Chain** - Authentication, error handling, validation
- **Type Safety** - TypeScript across the entire stack

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MongoDB** ([Local](https://www.mongodb.com/docs/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Shahtr1/muminbook.git
cd muminbook

# 2. Install all dependencies (both backend & frontend)
npm install

# 3. Set up environment variables (see Environment Setup below)
```

### Environment Configuration

#### Backend Environment (`packages/backend/.env`)

```bash
# Copy the sample file
cp packages/backend/sample.env packages/backend/.env
```

Then configure the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/muminbook

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_SENDER=noreply@yourdomain.com

# Frontend URL
APP_ORIGIN=http://localhost:5173
```

#### Frontend Environment (`packages/frontend/.env`)

```bash
# Copy the sample file
cp packages/frontend/sample.env packages/frontend/.env
```

```env
# API Configuration
VITE_API_URL=http://localhost:5000
```

### Running the Application

```bash
# 🚀 Run both backend and frontend concurrently (RECOMMENDED)
npm run dev

# 🔧 Or run them separately:
npm run backend     # Start backend only (http://localhost:5000)
npm run frontend    # Start frontend only (http://localhost:5173)
```

**Access the application:**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/

### 🏗️ Building for Production

```bash
# Build both packages
npm run build

# Or build individually
npm run build:backend    # Compiles TypeScript
npm run build:frontend   # Creates optimized bundle

# Run production builds
npm run start:backend    # Start production API server
npm run preview:frontend # Preview production frontend
```

## 📦 Workspace Packages

### @muminbook/backend

**Node.js/Express REST API Server**

- **Port:** 5000 (configurable)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT-based with refresh tokens
- **Email:** Resend integration for transactional emails
- **Jobs:** Node-cron for scheduled tasks (trash cleanup, etc.)
- **Location:** `packages/backend/`

**Key Features:**

- User authentication & authorization
- Role-based access control (Admin/User)
- Quran & Hadith API endpoints
- Family tree management
- Resource file management
- Reading progress tracking
- Email verification system
- Session management

### @muminbook/frontend

**React/Vite Single Page Application**

- **Port:** 5173 (default Vite)
- **Language:** JavaScript (JSX)
- **UI Framework:** Chakra UI
- **State Management:** React Query + Context API
- **Routing:** React Router v7
- **Code Editor:** Monaco Editor
- **Diagrams:** React Flow
- **Location:** `packages/frontend/`

**Key Features:**

- Responsive design for all devices
- Dark/light mode support
- Interactive Quran reader
- Family tree visualization
- Resource library with file management
- Live study rooms interface
- User dashboard & admin panel
- Real-time data synchronization

## 🔧 Available Scripts

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Run both backend & frontend in development mode |
| `npm run backend`          | Start backend server only                       |
| `npm run frontend`         | Start frontend dev server only                  |
| `npm run build`            | Build both packages for production              |
| `npm run build:backend`    | Build backend TypeScript                        |
| `npm run build:frontend`   | Build optimized frontend bundle                 |
| `npm run start:backend`    | Run production backend server                   |
| `npm run preview:frontend` | Preview production frontend build               |
| `npm run lint`             | Run ESLint on all packages                      |
| `npm run clean`            | Remove all node_modules directories             |
| `npm install`              | Install/update all dependencies                 |

## 🧪 Testing

```bash
# Frontend tests (Vitest)
cd packages/frontend
npm run test

# Backend tests (coming soon)
cd packages/backend
npm run test
```

## 📚 Documentation

- **[API Documentation]** - REST API endpoints and schemas
- **[User Guide]** - How to use Muminbook features
- **[Developer Guide]** - Architecture and development guidelines
- **[Contributing Guide]** - How to contribute to the project
- **[Deployment Guide]** - Production deployment instructions

_Note: Documentation is currently being developed_

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or spreading the word, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code of Conduct

Please be respectful and considerate of others. We're building a welcoming community platform for Muslims worldwide.

## 🐛 Bug Reports & Feature Requests

- **Found a bug?** [Open an issue](https://github.com/Shahtr1/muminbook/issues/new?template=bug_report.md)
- **Have an idea?** [Request a feature](https://github.com/Shahtr1/muminbook/issues/new?template=feature_request.md)
- **Need help?** [Start a discussion](https://github.com/Shahtr1/muminbook/discussions)

## 🔒 Security

If you discover a security vulnerability, please email [security contact] instead of using the issue tracker. All security vulnerabilities will be promptly addressed.

## 📜 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quran Data** - Thanks to the open-source Quran projects
- **Islamic Resources** - Community contributors for authentic Islamic content
- **Open Source Libraries** - All the amazing packages that make this possible
- **Contributors** - Everyone who has contributed to making Muminbook better

## 📞 Support & Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/Shahtr1/muminbook/issues)
- **GitHub Discussions:** [Ask questions or share ideas](https://github.com/Shahtr1/muminbook/discussions)
- **Project Maintainer:** [@Shahtr1](https://github.com/Shahtr1)

## 🗺️ Roadmap

### Current Version (v1.0.0)

- ✅ User authentication & authorization
- ✅ Quran & Hadith reading features
- ✅ Family tree visualization
- ✅ Resource management system
- ✅ Basic admin panel

### Upcoming Features

- 🔄 Real-time study rooms with WebSocket
- 🔄 Mobile application (React Native)
- 🔄 Advanced search capabilities
- 🔄 Multi-language support (Arabic, Urdu, French, etc.)
- 🔄 Audio recitation integration
- 🔄 Community forums
- 🔄 Progress tracking & achievements
- 🔄 API rate limiting & caching
- 🔄 Comprehensive test coverage

### Long-term Goals

- 📅 Integration with Islamic calendar
- 📅 Prayer time notifications
- 📅 Tafsir (Quranic commentary) library
- 📅 Hadith authenticity checker
- 📅 Collaborative translation platform

---

<div align="center">

**Made with ❤️ for the Muslim Ummah**

_"Read! In the Name of your Lord, Who has created" - Quran 96:1_

[⬆ Back to Top](#-muminbook)

</div>
