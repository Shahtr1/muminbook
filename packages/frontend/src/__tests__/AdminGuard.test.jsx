import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminGuard from '../AdminGuard.jsx';
import { AUTH } from '@/hooks/common/useAuth.js';
import React from 'react';

describe('AdminGuard', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithRouter = (initialPath = '/admin', user = null) => {
    // Create a fresh QueryClient for each render to ensure isolation
    const freshQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    if (user !== null && user !== undefined) {
      freshQueryClient.setQueryData([AUTH], user);
    }

    return render(
      <QueryClientProvider client={freshQueryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/admin" element={<AdminGuard />}>
              <Route index element={<div>Admin Dashboard</div>} />
            </Route>
            <Route path="/forbidden" element={<div>Forbidden</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('access control', () => {
    it('should allow access for admin users', () => {
      const adminUser = {
        id: '1',
        email: 'admin@test.com',
        roles: ['admin'],
      };

      renderWithRouter('/admin', adminUser);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should redirect non-admin users to forbidden', () => {
      const regularUser = {
        id: '2',
        email: 'user@test.com',
        roles: ['user'],
      };

      renderWithRouter('/admin', regularUser);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should redirect users without roles to forbidden', () => {
      const userWithoutRoles = {
        id: '3',
        email: 'user@test.com',
      };

      renderWithRouter('/admin', userWithoutRoles);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should redirect null user to forbidden', () => {
      renderWithRouter('/admin', null);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should redirect undefined user to forbidden', () => {
      renderWithRouter('/admin', undefined);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  describe('role checking', () => {
    it('should check for admin role in roles array', () => {
      const user = {
        id: '1',
        roles: ['user', 'admin', 'moderator'],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should reject user with only non-admin roles', () => {
      const user = {
        id: '1',
        roles: ['user', 'moderator', 'editor'],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should handle empty roles array', () => {
      const user = {
        id: '1',
        roles: [],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should be case-sensitive for admin role', () => {
      const user = {
        id: '1',
        roles: ['Admin', 'ADMIN'],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  describe('navigation behavior', () => {
    it('should use replace navigation', () => {
      const user = {
        id: '1',
        roles: ['user'],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
      // Replace is used, so going back shouldn't show admin page
    });
  });

  describe('outlet rendering', () => {
    it('should render Outlet for admin users', () => {
      const adminUser = {
        id: '1',
        roles: ['admin'],
      };

      renderWithRouter('/admin', adminUser);

      // Outlet should render child routes
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('query client integration', () => {
    it('should read user from query cache', () => {
      const adminUser = {
        id: '1',
        email: 'admin@test.com',
        roles: ['admin'],
      };

      queryClient.setQueryData([AUTH], adminUser);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin" element={<AdminGuard />}>
                <Route index element={<div>Admin Content</div>} />
              </Route>
              <Route path="/forbidden" element={<div>Forbidden</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should handle missing auth data in cache', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin" element={<AdminGuard />}>
                <Route index element={<div>Admin Content</div>} />
              </Route>
              <Route path="/forbidden" element={<div>Forbidden</div>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle user object with null roles', () => {
      const user = {
        id: '1',
        roles: null,
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should handle user object with non-array roles', () => {
      const user = {
        id: '1',
        roles: 'admin', // Not an array - should be rejected
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should handle admin role with extra spaces', () => {
      const user = {
        id: '1',
        roles: [' admin ', 'user'], // Spaces around 'admin' - should not match
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });

    it('should allow access when admin is the only role', () => {
      const user = {
        id: '1',
        roles: ['admin'],
      };

      renderWithRouter('/admin', user);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('multiple guard instances', () => {
    it('should work consistently across multiple renders', () => {
      const adminUser = {
        id: '1',
        roles: ['admin'],
      };

      const { unmount } = renderWithRouter('/admin', adminUser);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

      unmount();

      renderWithRouter('/admin', adminUser);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});
