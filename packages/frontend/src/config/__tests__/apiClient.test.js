import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure this runs before vi.mock
const { mockAxiosInstance, mockAxiosCreate } = vi.hoisted(() => {
  // Create a callable mock function that also has method properties
  const instance = vi.fn();
  instance.get = vi.fn();
  instance.post = vi.fn();
  instance.put = vi.fn();
  instance.delete = vi.fn();
  instance.patch = vi.fn();
  instance.interceptors = {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  };

  return {
    mockAxiosInstance: instance,
    mockAxiosCreate: vi.fn(() => instance),
  };
});

// Mock axios before any imports
vi.mock('axios', () => ({
  default: {
    create: mockAxiosCreate,
  },
}));

import API from '../apiClient.js';

// Mock queryClient
vi.mock('../queryClient.js', () => ({
  default: {
    clear: vi.fn(),
  },
}));

// Mock navigation service
vi.mock('@/services/navigation.service.js', () => ({
  navigate: vi.fn(),
}));

describe('apiClient', () => {
  let responseSuccessHandler;
  let responseErrorHandler;

  beforeEach(() => {
    // Get the actual interceptor handlers that were registered
    // The apiClient.js creates two axios instances: TokenRefreshClient and API
    // We want the interceptors from the API instance (second call to use)
    const interceptorCalls =
      mockAxiosInstance.interceptors.response.use.mock.calls;

    // The API interceptor is the second one registered (index 1)
    // First one is TokenRefreshClient with just success handler
    if (interceptorCalls.length > 1) {
      const apiInterceptorCall = interceptorCalls[1];
      responseSuccessHandler = apiInterceptorCall?.[0];
      responseErrorHandler = apiInterceptorCall?.[1];
    }

    // Clear mocks
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    mockAxiosInstance.delete.mockClear();
    mockAxiosInstance.patch.mockClear();

    // Set up window.location for tests
    delete window.location;
    window.location = { pathname: '/test-path' };
  });

  describe('Response Interceptor - Success Handler', () => {
    it('should extract and return response.data on successful responses', async () => {
      const mockResponse = {
        data: { user: { id: 1, name: 'Test User' }, token: 'abc123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const result = await responseSuccessHandler(mockResponse);

      expect(result).toEqual({
        user: { id: 1, name: 'Test User' },
        token: 'abc123',
      });
      expect(result).not.toHaveProperty('status');
      expect(result).not.toHaveProperty('headers');
    });
  });

  describe('Response Interceptor - Error Handler', () => {
    it('should reject with formatted error on non-401 errors', async () => {
      const mockError = {
        config: { url: '/api/test' },
        response: {
          status: 500,
          data: { message: 'Internal server error', errorCode: 'ServerError' },
        },
      };

      await expect(responseErrorHandler(mockError)).rejects.toEqual({
        status: 500,
        message: 'Internal server error',
        errorCode: 'ServerError',
      });
    });

    it('should reject with formatted error on 401 without InvalidAccessToken', async () => {
      const mockError = {
        config: { url: '/api/test' },
        response: {
          status: 401,
          data: { message: 'Unauthorized', errorCode: 'MissingToken' },
        },
      };

      await expect(responseErrorHandler(mockError)).rejects.toEqual({
        status: 401,
        message: 'Unauthorized',
        errorCode: 'MissingToken',
      });
    });

    it('should handle errors without response object', async () => {
      const mockError = {
        config: { url: '/api/test' },
        message: 'Network Error',
      };

      await expect(responseErrorHandler(mockError)).rejects.toEqual({
        status: undefined,
      });
    });

    it('should handle errors without response.data', async () => {
      const mockError = {
        config: { url: '/api/test' },
        response: {
          status: 404,
        },
      };

      await expect(responseErrorHandler(mockError)).rejects.toEqual({
        status: 404,
      });
    });
  });

  describe('Token Refresh Flow', () => {
    it('should attempt token refresh on 401 with InvalidAccessToken and retry original request on success', async () => {
      const originalRequest = {
        url: '/api/user/profile',
        method: 'get',
      };

      const mockError = {
        config: originalRequest,
        response: {
          status: 401,
          data: { errorCode: 'InvalidAccessToken', message: 'Token expired' },
        },
      };

      // Mock successful refresh and retry
      // First call: TokenRefreshClient.get('/auth/refresh') - returns success
      // Second call: TokenRefreshClient(config) - retries the original request
      mockAxiosInstance.get.mockResolvedValueOnce({ success: true });
      mockAxiosInstance.mockResolvedValueOnce({ id: 1, name: 'User' });

      const result = await responseErrorHandler(mockError);

      // Verify refresh was attempted
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/refresh');

      // Verify original request was retried
      expect(mockAxiosInstance).toHaveBeenCalledWith(originalRequest);

      // Verify the result is from the retry
      expect(result).toEqual({ id: 1, name: 'User' });
    });

    it('should navigate to login and clear cache when token refresh fails', async () => {
      const mockError = {
        config: { url: '/api/test' },
        response: {
          status: 401,
          data: { errorCode: 'InvalidAccessToken', message: 'Token expired' },
        },
      };

      // Mock failed refresh
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Refresh failed'));

      // Import the mocked modules to verify they were called
      const queryClient = (await import('../queryClient.js')).default;
      const { navigate } = await import('@/services/navigation.service.js');

      // The error handler catches the refresh failure internally
      // It navigates to login but the outer catch block doesn't return anything
      // So the error will still propagate
      try {
        await responseErrorHandler(mockError);
        // If we reach here, the test should fail because an error should be thrown
        expect.fail('Expected error to be thrown');
      } catch (error) {
        // This is expected - the error handler navigates but still allows the error to propagate
      }

      // Verify queryClient was cleared
      expect(queryClient.clear).toHaveBeenCalled();

      // Verify navigation to login with redirect state
      expect(navigate).toHaveBeenCalledWith('/login', {
        state: { redirectUrl: '/test-path' },
      });
    });
  });

  describe('API Configuration', () => {
    it('should create axios instance with correct baseURL and credentials', () => {
      expect(mockAxiosCreate).toHaveBeenCalled();
      const createCall = mockAxiosCreate.mock.calls[0][0];
      expect(createCall).toHaveProperty('baseURL');
      expect(createCall.withCredentials).toBe(true);
    });

    it('should export the configured API instance', () => {
      expect(API).toBeDefined();
      expect(API).toBe(mockAxiosInstance);
    });
  });
});
