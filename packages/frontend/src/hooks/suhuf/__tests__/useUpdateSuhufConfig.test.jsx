import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateSuhufConfig } from '../useUpdateSuhufConfig.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/components/toast/useXToast.jsx';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  updateSuhufConfig: vi.fn(),
}));

vi.mock('@/components/toast/useXToast.jsx', () => ({
  useXToast: vi.fn(),
}));

describe('useUpdateSuhufConfig', () => {
  let mockToast;
  let testQueryClient;

  beforeEach(() => {
    mockToast = {
      error: vi.fn(),
    };
    useXToast.mockReturnValue(mockToast);
    vi.clearAllMocks();

    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const createWrapper = () => {
    return ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  describe('basic functionality', () => {
    it('should return mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateSuhufConfig('suhuf-1'), {
        wrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should call useXToast hook', () => {
      const wrapper = createWrapper();
      renderHook(() => useUpdateSuhufConfig('suhuf-1'), { wrapper });

      expect(useXToast).toHaveBeenCalled();
    });
  });

  describe('mutation execution', () => {
    it('should call updateSuhufConfig service with suhufId and configUpdate', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-123';
      const configUpdate = { theme: 'dark', fontSize: 16 };
      const mockResponse = { id: suhufId, config: configUpdate };
      services.updateSuhufConfig.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(
          suhufId,
          configUpdate
        );
      });
    });

    it('should return data from updateSuhufConfig', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-456';
      const mockResponse = {
        id: suhufId,
        config: { layout: 'grid', columns: 3 },
      };
      services.updateSuhufConfig.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ layout: 'grid', columns: 3 });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('optimistic updates (onMutate)', () => {
    it('should cancel pending queries for the suhuf', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      const configUpdate = { theme: 'light' };
      services.updateSuhufConfig.mockResolvedValue({});

      const cancelQueriesSpy = vi.spyOn(testQueryClient, 'cancelQueries');

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(cancelQueriesSpy).toHaveBeenCalledWith(['suhuf', suhufId]);
      });
    });

    it('should optimistically update cache with new config', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      const existingData = {
        id: suhufId,
        name: 'My Suhuf',
        config: { theme: 'dark', fontSize: 14 },
      };
      const configUpdate = { fontSize: 18 };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);

      services.updateSuhufConfig.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ id: suhufId, config: configUpdate }),
              100
            )
          )
      );

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
        expect(cachedData.config.fontSize).toBe(18);
        expect(cachedData.config.theme).toBe('dark'); // Should preserve existing
      });
    });

    it('should merge config update with existing config', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';
      const existingData = {
        id: suhufId,
        config: { theme: 'dark', fontSize: 14, lineHeight: 1.5 },
      };
      const configUpdate = { fontSize: 16 };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);

      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
        expect(cachedData.config).toEqual({
          theme: 'dark',
          fontSize: 16, // Updated
          lineHeight: 1.5, // Preserved
        });
      });
    });

    it('should preserve non-config fields during update', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-3';
      const existingData = {
        id: suhufId,
        name: 'My Suhuf',
        createdAt: '2024-01-01',
        config: { theme: 'dark' },
      };
      const configUpdate = { theme: 'light' };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);

      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
        expect(cachedData.name).toBe('My Suhuf');
        expect(cachedData.createdAt).toBe('2024-01-01');
        expect(cachedData.config.theme).toBe('light');
      });
    });

    it('should return previous suhuf data from onMutate', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-4';
      const existingData = {
        id: suhufId,
        config: { theme: 'dark' },
      };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);

      let mutateContext;
      services.updateSuhufConfig.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({}), 50);
          })
      );

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const mutatePromise = result.current.mutateAsync({ theme: 'light' });

      // The context should contain previousSuhuf
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await mutatePromise;

      // We can't directly access context, but we verify it through error rollback tests
    });

    it('should handle undefined cache data during optimistic update', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-5';
      const configUpdate = { theme: 'light' };

      // No data in cache
      services.updateSuhufConfig.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 50))
      );

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Should not crash with undefined cache
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
      expect(cachedData?.config).toEqual(configUpdate);
    });
  });

  describe('error handling (onError)', () => {
    it('should call error toast on failure', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      const error = { message: 'Update failed' };
      services.updateSuhufConfig.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should rollback cache to previous data on error', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';
      const previousData = {
        id: suhufId,
        config: { theme: 'dark', fontSize: 14 },
      };

      testQueryClient.setQueryData(['suhuf', suhufId], previousData);

      services.updateSuhufConfig.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'light', fontSize: 18 });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Cache should be rolled back
      const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
      expect(cachedData).toEqual(previousData);
    });

    it('should handle error when no previous data exists', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-3';

      services.updateSuhufConfig.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'light' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalled();
    });

    it('should set isError to true on failure', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-4';
      services.updateSuhufConfig.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ fontSize: 20 });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle validation errors', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-5';
      const validationError = {
        message: 'Invalid config',
        errors: [{ field: 'fontSize', message: 'Must be positive' }],
      };
      services.updateSuhufConfig.mockRejectedValue(validationError);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ fontSize: -5 });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    it('should handle network errors', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-6';
      const networkError = new Error('Network request failed');
      services.updateSuhufConfig.mockRejectedValue(networkError);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('mutation states', () => {
    it('should have isPending true during mutation', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      services.updateSuhufConfig.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: suhufId, config: {} }), 100)
          )
      );

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isSuccess true after successful mutation', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';
      services.updateSuhufConfig.mockResolvedValue({
        id: suhufId,
        config: { theme: 'light' },
      });

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'light' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isIdle true initially', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateSuhufConfig('suhuf-1'), {
        wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('mutateAsync', () => {
    it('should support mutateAsync for promise-based usage', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-7';
      const mockResponse = { id: suhufId, config: { theme: 'dark' } };
      services.updateSuhufConfig.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = { theme: 'dark' };
      const data = await result.current.mutateAsync(configUpdate);

      expect(data).toEqual(mockResponse);
      expect(services.updateSuhufConfig).toHaveBeenCalledWith(
        suhufId,
        configUpdate
      );
    });

    it('should reject on error with mutateAsync', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-8';
      const error = { message: 'Update failed' };
      services.updateSuhufConfig.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ theme: 'light' })
      ).rejects.toEqual(error);
    });
  });

  describe('config update types', () => {
    it('should handle theme config update', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = { theme: 'dark' };
      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(
          suhufId,
          configUpdate
        );
      });
    });

    it('should handle multiple config properties', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = {
        theme: 'light',
        fontSize: 16,
        lineHeight: 1.6,
        fontFamily: 'Arial',
      };
      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(
          suhufId,
          configUpdate
        );
      });
    });

    it('should handle nested config objects', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-3';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = {
        display: { mode: 'grid', columns: 3 },
        colors: { primary: '#000', secondary: '#fff' },
      };
      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(
          suhufId,
          configUpdate
        );
      });
    });

    it('should handle boolean config values', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-4';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = {
        showLineNumbers: true,
        enableSpellCheck: false,
      };
      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle array config values', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-5';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      const configUpdate = {
        tags: ['important', 'work'],
        categories: ['personal', 'archived'],
      };
      result.current.mutate(configUpdate);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle empty config update', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-6';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({});

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(suhufId, {});
      });
    });
  });

  describe('multiple mutations', () => {
    it('should handle multiple sequential updates', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      services.updateSuhufConfig
        .mockResolvedValueOnce({ id: suhufId, config: { theme: 'dark' } })
        .mockResolvedValueOnce({ id: suhufId, config: { fontSize: 18 } });

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      result.current.mutate({ fontSize: 18 });

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset mutation state between calls', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      result.current.reset();

      await waitFor(() => {
        expect(result.current.isIdle).toBe(true);
      });
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('different suhufId values', () => {
    it('should handle different suhufId for each hook instance', async () => {
      const wrapper = createWrapper();
      services.updateSuhufConfig.mockResolvedValue({});

      const { result: result1 } = renderHook(
        () => useUpdateSuhufConfig('suhuf-1'),
        { wrapper }
      );
      const { result: result2 } = renderHook(
        () => useUpdateSuhufConfig('suhuf-2'),
        { wrapper }
      );

      result1.current.mutate({ theme: 'dark' });
      result2.current.mutate({ theme: 'light' });

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith('suhuf-1', {
          theme: 'dark',
        });
        expect(services.updateSuhufConfig).toHaveBeenCalledWith('suhuf-2', {
          theme: 'light',
        });
      });
    });

    it('should handle numeric suhufId', async () => {
      const wrapper = createWrapper();
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(123), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(123, {
          theme: 'dark',
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should complete full update workflow', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-100';
      const existingData = {
        id: suhufId,
        name: 'My Suhuf',
        config: { theme: 'dark', fontSize: 14 },
      };
      const configUpdate = { fontSize: 18 };
      const mockResponse = { id: suhufId, config: configUpdate };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);
      services.updateSuhufConfig.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate(configUpdate);

      // Check optimistic update
      await waitFor(() => {
        const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
        expect(cachedData.config.fontSize).toBe(18);
      });

      // Check final success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(services.updateSuhufConfig).toHaveBeenCalledWith(
        suhufId,
        configUpdate
      );
    });

    it('should complete full error workflow with rollback', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-101';
      const existingData = {
        id: suhufId,
        config: { theme: 'dark' },
      };
      const error = { message: 'Server unavailable' };

      testQueryClient.setQueryData(['suhuf', suhufId], existingData);
      services.updateSuhufConfig.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'light' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith(error);

      // Verify rollback
      const cachedData = testQueryClient.getQueryData(['suhuf', suhufId]);
      expect(cachedData).toEqual(existingData);
    });
  });

  describe('edge cases', () => {
    it('should handle null config values', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-1';
      services.updateSuhufConfig.mockResolvedValue({});

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ customSetting: null });

      await waitFor(() => {
        expect(services.updateSuhufConfig).toHaveBeenCalledWith(suhufId, {
          customSetting: null,
        });
      });
    });

    it('should handle undefined suhufId', () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => useUpdateSuhufConfig(undefined), {
        wrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    });

    it('should preserve cache when context has no previousSuhuf', async () => {
      const wrapper = createWrapper();
      const suhufId = 'suhuf-2';

      // No initial cache data
      services.updateSuhufConfig.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
        wrapper,
      });

      result.current.mutate({ theme: 'dark' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should not crash when trying to rollback with no previous data
      expect(mockToast.error).toHaveBeenCalled();
    });
  });
});
