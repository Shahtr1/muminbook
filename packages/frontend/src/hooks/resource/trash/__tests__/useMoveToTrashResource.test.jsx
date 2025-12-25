import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoveToTrashResource } from '../useMoveToTrashResource.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/hooks/useXToast.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  moveToTrash: vi.fn(),
}));

vi.mock('@/hooks/useXToast.js', () => ({
  useXToast: vi.fn(),
}));

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/reading/my-files',
  },
  writable: true,
});

describe('useMoveToTrashResource', () => {
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

    window.location.pathname = '/reading/my-files';
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('basic functionality', () => {
    it('should return mutation object', () => {
      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe('mutation execution', () => {
    it('should call moveToTrash service with id', async () => {
      services.moveToTrash.mockResolvedValue({ id: '123', trashed: true });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('123');

      await waitFor(() => {
        expect(services.moveToTrash).toHaveBeenCalledWith('123');
      });
    });

    it('should start loading toast', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Moving to trash...'
        );
      });
    });

    it('should return data from moveToTrash', async () => {
      const mockResponse = { id: '456', trashed: true };
      services.moveToTrash.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('456');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('success handling', () => {
    it('should show success toast', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Moved to trash');
      });
    });

    it('should remove item from resources cache', async () => {
      services.moveToTrash.mockResolvedValue({ id: '2' });

      const oldData = [
        { _id: '1', name: 'File1' },
        { _id: '2', name: 'File2' },
        { _id: '3', name: 'File3' },
      ];

      testQueryClient.setQueryData(['resources', 'my-files'], oldData);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('2');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const newData = testQueryClient.getQueryData(['resources', 'my-files']);
      expect(newData).toHaveLength(2);
      expect(newData.find((item) => item._id === '2')).toBeUndefined();
    });

    it('should invalidate trash queries', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['trash'],
        });
      });
    });

    it('should invalidate isTrashEmpty queries', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['isTrashEmpty'],
        });
      });
    });

    it('should invalidate overview queries', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['overview'],
        });
      });
    });

    it('should handle non-array cache data', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      testQueryClient.setQueryData(['resources', 'my-files'], null);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cacheData = testQueryClient.getQueryData(['resources', 'my-files']);
      expect(cacheData).toBeNull();
    });

    it('should not update cache if id is falsy', async () => {
      services.moveToTrash.mockResolvedValue({ success: true });

      const oldData = [{ _id: '1', name: 'File1' }];
      testQueryClient.setQueryData(['resources', 'my-files'], oldData);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate(null);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const newData = testQueryClient.getQueryData(['resources', 'my-files']);
      expect(newData).toEqual(oldData);
    });

    it('should stop loading toast', async () => {
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error toast on failure', async () => {
      const error = { message: 'Failed to move to trash' };
      services.moveToTrash.mockRejectedValue(error);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should stop loading toast on error', async () => {
      services.moveToTrash.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });

    it('should set isError to true', async () => {
      services.moveToTrash.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('path extraction', () => {
    it('should extract path from /reading/ route', async () => {
      window.location.pathname = '/reading/documents/work';
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const oldData = [{ _id: '1', name: 'File' }];
      testQueryClient.setQueryData(['resources', 'documents/work'], oldData);

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const newData = testQueryClient.getQueryData([
        'resources',
        'documents/work',
      ]);
      expect(newData).toHaveLength(0);
    });

    it('should handle root reading path', async () => {
      window.location.pathname = '/reading/';
      services.moveToTrash.mockResolvedValue({ id: '1' });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('mutation states', () => {
    it('should have isPending true during mutation', async () => {
      services.moveToTrash.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ id: '1' }), 100))
      );

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isIdle true initially', () => {
      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('integration workflow', () => {
    it('should complete full move to trash workflow', async () => {
      services.moveToTrash.mockResolvedValue({ id: '100', trashed: true });

      const oldData = [
        { _id: '100', name: 'File.pdf' },
        { _id: '101', name: 'Other.pdf' },
      ];
      testQueryClient.setQueryData(['resources', 'my-files'], oldData);

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('100');

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Moving to trash...'
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockToast.success).toHaveBeenCalledWith('Moved to trash');

      const newData = testQueryClient.getQueryData(['resources', 'my-files']);
      expect(newData).toHaveLength(1);
      expect(newData[0]._id).toBe('101');

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['trash'] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['isTrashEmpty'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['overview'] });
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle numeric id', async () => {
      services.moveToTrash.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate(123);

      await waitFor(() => {
        expect(services.moveToTrash).toHaveBeenCalledWith(123);
      });
    });

    it('should handle empty string id', async () => {
      services.moveToTrash.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate('');

      await waitFor(() => {
        expect(services.moveToTrash).toHaveBeenCalledWith('');
      });
    });

    it('should handle UUID format id', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      services.moveToTrash.mockResolvedValue({ id: uuid });

      const { result } = renderHook(() => useMoveToTrashResource(), {
        wrapper,
      });

      result.current.mutate(uuid);

      await waitFor(() => {
        expect(services.moveToTrash).toHaveBeenCalledWith(uuid);
      });
    });
  });
});
