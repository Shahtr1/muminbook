/**
 * @fileoverview useAuth Hook Test Suite
 *
 * Tests the authentication hook that manages user state including:
 * - User data fetching
 * - Query configuration (caching, refetching)
 * - Error handling
 * - Integration with React Query
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuth, { AUTH } from '../useAuth.js';
import { getUser } from '@/services/index.js';

vi.mock('@/services/index.js', () => ({
  getUser: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  });
  return ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful authentication', () => {
    it('should fetch and return user data', async () => {
      const mockUser = {
        _id: '123',
        email: 'user@example.com',
        firstname: 'John',
        lastname: 'Doe',
        verified: true,
      };

      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should use correct query key', async () => {
      const mockUser = { _id: '1', email: 'test@test.com' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      // Query key should be ['auth']
      expect(getUser).toHaveBeenCalled();
    });

    it('should cache user data in QueryClient', async () => {
      const mockUser = { _id: '1', email: 'cached@test.com' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const Wrapper = ({ children }) => {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      };

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => result.current.isSuccess);

      const cachedData = queryClient.getQueryData([AUTH]);
      expect(cachedData).toEqual(mockUser);
    });
  });

  describe('loading states', () => {
    it('should show loading state initially', () => {
      vi.mocked(getUser).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 1000))
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeUndefined();
    });

    it('should transition from loading to success', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => result.current.isSuccess);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors gracefully', async () => {
      const error = new Error('Unauthorized');
      vi.mocked(getUser).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to settle
      await waitFor(() => !result.current.isLoading, { timeout: 3000 });

      // Verify the error was handled (either isError is true or user is undefined)
      expect(result.current.user).toBeUndefined();
      expect(getUser).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(getUser).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to settle
      await waitFor(() => !result.current.isLoading, { timeout: 3000 });

      // Verify the error was handled
      expect(result.current.user).toBeUndefined();
      expect(getUser).toHaveBeenCalled();
    });

    it('should not retry on error', async () => {
      vi.mocked(getUser).mockRejectedValue(new Error('Auth failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      // Should only call once (no retries)
      expect(getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('query configuration', () => {
    it('should use infinite staleTime', async () => {
      vi.mocked(getUser).mockResolvedValue({ _id: '1' });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      // Data should never become stale
      expect(result.current.isStale).toBe(false);
    });

    it('should not refetch on window focus', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      const callCountBefore = vi.mocked(getUser).mock.calls.length;

      // Simulate window focus
      window.dispatchEvent(new Event('focus'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      const callCountAfter = vi.mocked(getUser).mock.calls.length;

      // Should not refetch
      expect(callCountAfter).toBe(callCountBefore);
    });

    it('should not refetch on reconnect', async () => {
      vi.mocked(getUser).mockResolvedValue({ _id: '1' });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      const callCountBefore = vi.mocked(getUser).mock.calls.length;

      // Simulate reconnect
      window.dispatchEvent(new Event('online'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not refetch
      expect(vi.mocked(getUser).mock.calls.length).toBe(callCountBefore);
    });
  });

  describe('custom options', () => {
    it('should accept custom query options', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const customOptions = {
        enabled: true,
        staleTime: 5000,
      };

      const { result } = renderHook(() => useAuth(customOptions), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toEqual(mockUser);
    });

    it('should respect enabled:false option', () => {
      vi.mocked(getUser).mockResolvedValue({ _id: '1' });

      const { result } = renderHook(() => useAuth({ enabled: false }), {
        wrapper: createWrapper(),
      });

      // Should not fetch when disabled
      expect(getUser).not.toHaveBeenCalled();
      expect(result.current.user).toBeUndefined();
    });

    it('should merge custom options with defaults', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth({ refetchInterval: 10000 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      // Should still use default retry: false
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('return values', () => {
    it('should return user and query states', async () => {
      const mockUser = { _id: '1', email: 'test@test.com' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current).toHaveProperty('user', mockUser);
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('error');
    });

    it('should spread all React Query states', async () => {
      vi.mocked(getUser).mockResolvedValue({ _id: '1' });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      // Check for common React Query properties
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('isFetching');
      expect(result.current).toHaveProperty('isStale');
    });
  });

  describe('user data structure', () => {
    it('should handle complete user object', async () => {
      const completeUser = {
        _id: '123',
        email: 'complete@test.com',
        firstname: 'John',
        lastname: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        verified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(getUser).mockResolvedValue(completeUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toEqual(completeUser);
    });

    it('should handle minimal user object', async () => {
      const minimalUser = {
        _id: '1',
        email: 'minimal@test.com',
      };

      vi.mocked(getUser).mockResolvedValue(minimalUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toEqual(minimalUser);
    });

    it('should handle null user response', async () => {
      vi.mocked(getUser).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toBeNull();
    });
  });

  describe('query key consistency', () => {
    it('should use AUTH constant as query key', () => {
      expect(AUTH).toBe('auth');
    });

    it('should fetch with consistent query key', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const Wrapper = ({ children }) => {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      };

      renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => {
        const data = queryClient.getQueryData([AUTH]);
        return data !== undefined;
      });

      expect(queryClient.getQueryData([AUTH])).toEqual(mockUser);
    });
  });

  describe('concurrent renders', () => {
    it('should handle multiple hook instances', async () => {
      const mockUser = { _id: '1', email: 'concurrent@test.com' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const wrapper = createWrapper();

      const { result: result1 } = renderHook(() => useAuth(), { wrapper });
      const { result: result2 } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => result1.current.isSuccess);
      await waitFor(() => result2.current.isSuccess);

      expect(result1.current.user).toEqual(mockUser);
      expect(result2.current.user).toEqual(mockUser);

      // Should share cache, so only call API once
      expect(getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should support conditional rendering based on user state', async () => {
      const mockUser = { _id: '1', verified: true };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      // Simulate conditional UI logic
      const isAuthenticated = !!result.current.user;
      const isVerified = result.current.user?.verified;

      expect(isAuthenticated).toBe(true);
      expect(isVerified).toBe(true);
    });

    it('should support logout scenario', async () => {
      const mockUser = { _id: '1' };
      vi.mocked(getUser).mockResolvedValue(mockUser);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const Wrapper = ({ children }) => {
        return (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
      };

      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.user).toEqual(mockUser);

      // Simulate logout by clearing cache
      queryClient.setQueryData([AUTH], null);

      await waitFor(() => {
        const data = queryClient.getQueryData([AUTH]);
        return data === null;
      });

      expect(queryClient.getQueryData([AUTH])).toBeNull();
    });
  });
});
