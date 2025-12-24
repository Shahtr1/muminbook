import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCopyResource } from '../useCopyResource.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/hooks/useXToast.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  copyResource: vi.fn(),
}));

vi.mock('@/hooks/useXToast.js', () => ({
  useXToast: vi.fn(),
}));

vi.mock('@/config/queryClient.js', () => ({
  default: {
    invalidateQueries: vi.fn(),
  },
}));

import queryClient from '@/config/queryClient.js';

describe('useCopyResource', () => {
  let mockToast;
  let testQueryClient;

  beforeEach(() => {
    mockToast = {
      startLoading: vi.fn(),
      stopLoading: vi.fn(),
      success: vi.fn(),
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

  const wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('basic functionality', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useCopyResource(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should call useXToast hook', () => {
      renderHook(() => useCopyResource(), { wrapper });

      expect(useXToast).toHaveBeenCalled();
    });
  });

  describe('mutation execution', () => {
    it('should call copyResource service with variables', async () => {
      const mockResponse = { id: '123-copy', name: 'document (copy).pdf' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = {
        id: '123',
        destinationPath: 'documents/backup',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.copyResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should start loading toast before mutation', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Copying resource...'
        );
      });
    });

    it('should return data from copyResource', async () => {
      const mockResponse = { id: '456-copy', name: 'Copy of File' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '456', destinationPath: 'copies' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('success handling', () => {
    it('should show success toast', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'backup' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Resource copied');
      });
    });

    it('should invalidate queries on success', async () => {
      const mockResponse = { id: '3', name: 'copy' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = {
        id: '3',
        destinationPath: 'documents/work',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'documents/work'],
        });
      });
    });

    it('should invalidate queries with correct destination path', async () => {
      const mockResponse = { id: '4', name: 'copy' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = {
        id: '4',
        destinationPath: 'my-files/projects',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'my-files/projects'],
        });
      });
    });

    it('should stop loading toast on success', async () => {
      services.copyResource.mockResolvedValue({ id: '5', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '5', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error toast on failure', async () => {
      const error = { message: 'Copy failed' };
      services.copyResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should stop loading toast on error', async () => {
      services.copyResource.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });

    it('should set isError to true on failure', async () => {
      services.copyResource.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle insufficient permissions error', async () => {
      const permError = {
        message: 'Permission denied',
        status: 403,
      };
      services.copyResource.mockRejectedValue(permError);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'protected' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle disk space errors', async () => {
      const spaceError = { message: 'Insufficient disk space' };
      services.copyResource.mockRejectedValue(spaceError);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: 'large-file', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    it('should handle not found errors', async () => {
      const notFoundError = { message: 'Resource not found', status: 404 };
      services.copyResource.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: 'nonexistent', destinationPath: 'dest' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('mutation states', () => {
    it('should have isPending true during mutation', async () => {
      services.copyResource.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: '1', name: 'copy' }), 100)
          )
      );

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isSuccess true after successful mutation', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isIdle true initially', () => {
      const { result } = renderHook(() => useCopyResource(), { wrapper });

      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('mutateAsync', () => {
    it('should support mutateAsync for promise-based usage', async () => {
      const mockResponse = { id: '7-copy', name: 'async-copy.txt' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = { id: '7', destinationPath: 'async' };
      const data = await result.current.mutateAsync(variables);

      expect(data).toEqual(mockResponse);
      expect(services.copyResource).toHaveBeenCalledWith(variables);
    });

    it('should reject on error with mutateAsync', async () => {
      const error = { message: 'Copy failed' };
      services.copyResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      await expect(
        result.current.mutateAsync({ id: '1', destinationPath: 'dest' })
      ).rejects.toEqual(error);
    });
  });

  describe('variable types', () => {
    it('should handle copy with new name', async () => {
      const mockResponse = { id: '8-copy', name: 'Custom Name.txt' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = {
        id: '8',
        destinationPath: 'documents',
        newName: 'Custom Name.txt',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.copyResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should handle copy to same directory', async () => {
      services.copyResource.mockResolvedValue({
        id: '9-copy',
        name: 'file (copy).txt',
      });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: '9',
        destinationPath: 'documents',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle copy to nested path', async () => {
      services.copyResource.mockResolvedValue({ id: '10', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: '10',
        destinationPath: 'a/b/c/d/e',
      });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'a/b/c/d/e'],
        });
      });
    });

    it('should handle copy to root path', async () => {
      services.copyResource.mockResolvedValue({ id: '11', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '11', destinationPath: '/' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', '/'],
        });
      });
    });

    it('should handle copy with metadata', async () => {
      const mockResponse = { id: '12', name: 'copy' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const variables = {
        id: '12',
        destinationPath: 'dest',
        metadata: { tags: ['backup'], color: 'blue' },
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.copyResource).toHaveBeenCalledWith(variables);
      });
    });
  });

  describe('multiple mutations', () => {
    it('should handle multiple sequential copies', async () => {
      services.copyResource
        .mockResolvedValueOnce({ id: '1-copy', name: 'Copy1' })
        .mockResolvedValueOnce({ id: '2-copy', name: 'Copy2' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      result.current.mutate({ id: '2', destinationPath: 'dest2' });

      await waitFor(() => {
        expect(services.copyResource).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset mutation state between calls', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

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

  describe('integration scenarios', () => {
    it('should complete full copy workflow', async () => {
      const mockResponse = { id: '100-copy', name: 'report (copy).pdf' };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: '100',
        destinationPath: 'documents/backup',
      });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Copying resource...'
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockToast.success).toHaveBeenCalledWith('Resource copied');
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });

    it('should complete full error workflow', async () => {
      const error = { message: 'Destination folder not found' };
      services.copyResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'nonexistent' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });

    it('should handle batch copy operations', async () => {
      services.copyResource.mockResolvedValue({ id: 'copy', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const copies = [
        { id: '1', destinationPath: 'backup' },
        { id: '2', destinationPath: 'backup' },
        { id: '3', destinationPath: 'backup' },
      ];

      for (const copy of copies) {
        result.current.mutate(copy);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      }

      expect(services.copyResource).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle empty destination path', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: '' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', ''],
        });
      });
    });

    it('should handle special characters in file names', async () => {
      services.copyResource.mockResolvedValue({
        id: '1',
        name: 'file (copy) [2024].txt',
      });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: '1',
        destinationPath: 'dest',
        newName: 'file (copy) [2024].txt',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle unicode characters in paths', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: '文件.txt' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: '1',
        destinationPath: '文档/备份',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle very long paths', async () => {
      services.copyResource.mockResolvedValue({ id: '1', name: 'copy' });

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      const longPath = 'a/'.repeat(50) + 'destination';
      result.current.mutate({ id: '1', destinationPath: longPath });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', longPath],
        });
      });
    });

    it('should handle copying folders recursively', async () => {
      const mockResponse = {
        id: 'folder-copy',
        type: 'folder',
        name: 'Project (copy)',
      };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: 'folder-id',
        destinationPath: 'backup',
        recursive: true,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle copying large files', async () => {
      const mockResponse = {
        id: 'large-copy',
        name: 'video.mp4',
        size: 5000000000, // 5GB
      };
      services.copyResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCopyResource(), { wrapper });

      result.current.mutate({
        id: 'large-file',
        destinationPath: 'videos',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple hooks copying different files', async () => {
      services.copyResource.mockResolvedValue({ id: 'copy', name: 'copy' });

      const { result: result1 } = renderHook(() => useCopyResource(), {
        wrapper,
      });
      const { result: result2 } = renderHook(() => useCopyResource(), {
        wrapper,
      });

      result1.current.mutate({ id: '1', destinationPath: 'dest1' });
      result2.current.mutate({ id: '2', destinationPath: 'dest2' });

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
        expect(result2.current.isSuccess).toBe(true);
      });

      expect(services.copyResource).toHaveBeenCalledTimes(2);
    });
  });
});
