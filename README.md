# Muminbook

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB Version](https://img.shields.io/badge/mongodb-%3E%3D6.0-green)](https://www.mongodb.com/)

**A Modern Islamic Community & Learning Platform**

Muminbook is a full-stack MERN web application designed to serve as a comprehensive community platform for Muslims worldwide. It enables users to share knowledge, engage in collaborative Quran and Hadith studies, and connect with teachers and students through interactive features and live study rooms.

**Created on _January 21, 2025_**

---

## ✨ Features

- 📖 **Quran Reading & Tafseer** - Interactive Quran with translations and commentary
- 📚 **Daily Islamic Content** - Verse, Hadith, and Dua of the day
- 🗓️ **Islamic Calendar** - Hijri calendar with important dates and events
- ✍️ **Islamic Articles** - Seerah, Sahaba stories, and educational content
- 👥 **Study Rooms** - Live collaborative learning sessions
- 💬 **Community Discussions** - Connect with learners and scholars
- 🎓 **Resource Management** - Organize and share Islamic resources

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (v6 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shahtr1/muminbook.git
   cd muminbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/sample.env backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/sample.env frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

For detailed setup instructions, see [DEVELOPMENT.md](docs/DEVELOPMENT.md).

## 📚 Documentation

- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project
- [Development Guide](docs/DEVELOPMENT.md) - Local development setup
- [Architecture Documentation](docs/ARCHITECTURE.md) - System design and architecture
- [API Documentation](docs/API.md) - API endpoints reference (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment (coming soon)

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web application framework |
| **TypeScript** | Type-safe JavaScript |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Zod** | Schema validation |
| **JWT** | Authentication |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **Vite** | Build tool and dev server |
| **Chakra UI** | Component library |
| **React Router** | Client-side routing |
| **React Query** | Server state management |
| **Monaco Editor** | Code/text editor |
| **Axios** | HTTP client |

## 📁 Project Structure

```
muminbook/
├── backend/           # Express.js backend application
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   └── utils/
│   └── package.json
│
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── theme/
│   └── package.json
│
├── docs/             # Documentation
└── package.json      # Root package.json
```

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run linting
npm run lint
```

## 🏗️ Building for Production

```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

## 🔗 Project Links

- **Task Board**: [Notion Project Board](https://www.notion.so/1f87449dbc4780c088e9d60174e52db2?v=1f87449dbc4780a78a05000c04e67009&pvs=4)
- **Design**: [Figma Design Files](https://www.figma.com/design/SYiIw3zJ5Qr3mrUcMGBysb/muminbook?node-id=0-1&t=8g78x9ge92aUWwK0-1)
- **Repository**: [GitHub](https://github.com/Shahtr1/muminbook)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Coding standards
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team & Support

- For bugs and feature requests, please [open an issue](https://github.com/Shahtr1/muminbook/issues)
- For discussions and questions, visit our [Discussions page](https://github.com/Shahtr1/muminbook/discussions)

## 🙏 Acknowledgments

- All contributors who have helped shape this project
- The open-source community for amazing tools and libraries
- Islamic scholars and educators who inspire this work

---

**Made with ❤️ for the Muslim community**
