# Muminbook Frontend

The frontend application for Muminbook, built with React and Vite.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library and styling
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Monaco Editor** - Code/text editor component
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# From the project root
npm run install:frontend

# Or from this directory
npm install
```

### Development

```bash
# From the project root
npm run dev:frontend

# Or from this directory
npm run frontend
```

The application will be available at http://localhost:5173

### Building

```bash
# From the project root
npm run build:frontend

# Or from this directory
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components (routes)
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── theme/          # Chakra UI theme customization
│   ├── styles/         # Global CSS styles
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Application entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
└── package.json
```

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the client.

## Available Scripts

- `npm run frontend` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest

## Key Features

- **Fast Refresh** - Instant feedback during development
- **TypeScript Support** - Type checking for JavaScript files
- **ESLint** - Code quality and style checking
- **Hot Module Replacement** - No full page reloads
- **Optimized Build** - Tree-shaking and code splitting
- **Testing Setup** - Unit and component testing ready

## Development Guidelines

### Component Structure

```jsx
// components/Button.jsx
export const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};
```

### Using React Query

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../services/api';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Routing

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Troubleshooting

### Port Already in Use

If port 5173 is in use:

```bash
# Change the port in vite.config.js
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Hot Reload Not Working

On Linux, you may need to increase file watcher limits:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.

## License

MIT License - see [LICENSE](../LICENSE) for details.

