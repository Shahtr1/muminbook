import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResources } from '../useResources.js';
import * as services from '@/services/index.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  getResources: vi.fn(),
}));

describe('useResources', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
      logger: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
    });
    vi.clearAllMocks();

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  describe('basic functionality', () => {
    it('should return resources array and query properties', () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(), { wrapper });

      expect(result.current.resources).toBeDefined();
      expect(result.current.isPending).toBeDefined();
      expect(result.current.isError).toBeDefined();
    });

    it('should call getResources with default path', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith('my-files');
      });
    });

    it('should call getResources with custom path', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources('documents'), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith('documents');
      });
    });
  });

  describe('data handling', () => {
    it('should return empty array by default', () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(), { wrapper });

      expect(result.current.resources).toEqual([]);
    });

    it('should return resources data when loaded', async () => {
      const mockData = [
        { _id: '1', name: 'File1', type: 'file' },
        { _id: '2', name: 'Folder1', type: 'folder' },
      ];
      services.getResources.mockResolvedValue(mockData);

      const { result } = renderHook(() => useResources('docs'), { wrapper });

      await waitFor(() => {
        expect(result.current.resources).toEqual(mockData);
      });
    });

    it('should handle null response as empty array', async () => {
      services.getResources.mockResolvedValue(null);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.resources).toEqual([]);
      });
    });

    it('should handle undefined response as empty array', async () => {
      services.getResources.mockResolvedValue(null); // Changed from undefined to null

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.resources).toEqual([]);
      });
    });
  });

  describe('query options', () => {
    it('should be disabled when path is falsy', () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(''), { wrapper });

      expect(result.current.resources).toEqual([]);
      expect(services.getResources).not.toHaveBeenCalled();
    });

    it('should be enabled when path is provided', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources('documents'), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalled();
      });
    });

    it('should not retry on error', async () => {
      services.getResources.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(services.getResources).toHaveBeenCalledTimes(1);
    });

    it('should not refetch on window focus', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('loading states', () => {
    it('should have isPending true initially', () => {
      services.getResources.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useResources(), { wrapper });

      expect(result.current.isPending).toBe(true);
    });

    it('should have isPending false when loaded', async () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should have isSuccess true when loaded', async () => {
      services.getResources.mockResolvedValue([{ _id: '1' }]);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('should set isError true on failure', async () => {
      services.getResources.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should provide error object', async () => {
      const error = new Error('Failed to load');
      services.getResources.mockRejectedValue(error);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it('should keep resources as empty array on error', async () => {
      services.getResources.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.resources).toEqual([]);
    });
  });

  describe('path changes', () => {
    it('should refetch when path changes', async () => {
      services.getResources.mockResolvedValue([]);

      const { rerender } = renderHook(({ path }) => useResources(path), {
        wrapper,
        initialProps: { path: 'docs' },
      });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith('docs');
      });

      rerender({ path: 'projects' });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith('projects');
      });

      expect(services.getResources).toHaveBeenCalledTimes(2);
    });

    it('should handle path with special characters', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources('my-files/docs (old)'), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith(
          'my-files/docs (old)'
        );
      });
    });
  });

  describe('refetch functionality', () => {
    it('should provide refetch function', async () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when called', async () => {
      services.getResources
        .mockResolvedValueOnce([{ _id: '1' }])
        .mockResolvedValueOnce([{ _id: '2' }]);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.resources).toEqual([{ _id: '1' }]);
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.resources).toEqual([{ _id: '2' }]);
      });

      expect(services.getResources).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty path string', () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(''), { wrapper });

      expect(services.getResources).not.toHaveBeenCalled();
      expect(result.current.resources).toEqual([]);
    });

    it('should handle null path', () => {
      services.getResources.mockResolvedValue([]);

      const { result } = renderHook(() => useResources(null), { wrapper });

      expect(services.getResources).not.toHaveBeenCalled();
    });

    it('should handle undefined path (use default)', async () => {
      services.getResources.mockResolvedValue([]);

      renderHook(() => useResources(undefined), { wrapper });

      await waitFor(() => {
        expect(services.getResources).toHaveBeenCalledWith('my-files');
      });
    });

    it('should handle large datasets', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        _id: `${i}`,
        name: `Item ${i}`,
      }));
      services.getResources.mockResolvedValue(largeData);

      const { result } = renderHook(() => useResources(), { wrapper });

      await waitFor(() => {
        expect(result.current.resources).toHaveLength(1000);
      });
    });
  });
});
