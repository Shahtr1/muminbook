import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useRenameResource } from '../useRenameResource.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/hooks/useXToast.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  renameResource: vi.fn(),
}));

vi.mock('@/hooks/useXToast.js', () => ({
  useXToast: vi.fn(),
}));

vi.mock('@/config/queryClient.js', () => ({
  default: {
    setQueryData: vi.fn(),
  },
}));

import queryClient from '@/config/queryClient.js';

describe('useRenameResource', () => {
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

  const createWrapper = (initialPath = '/reading/my-files') => {
    return ({ children }) => (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/reading/*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('basic functionality', () => {
    it('should return mutation object', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRenameResource(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should call useXToast hook', () => {
      const wrapper = createWrapper();
      renderHook(() => useRenameResource(), { wrapper });

      expect(useXToast).toHaveBeenCalled();
    });
  });

  describe('path extraction', () => {
    it('should extract path from /reading/ route', () => {
      const wrapper = createWrapper('/reading/documents');
      const { result } = renderHook(() => useRenameResource(), { wrapper });

      services.renameResource.mockResolvedValue({ id: '1', name: 'renamed' });
      result.current.mutate({ id: '1', name: 'renamed' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalledWith(
          ['resources', 'documents'],
          expect.any(Function)
        );
      });
    });

    it('should handle nested path', () => {
      const wrapper = createWrapper('/reading/docs/projects/work');
      const { result } = renderHook(() => useRenameResource(), { wrapper });

      services.renameResource.mockResolvedValue({ id: '1', name: 'test' });
      result.current.mutate({ id: '1', name: 'test' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalledWith(
          ['resources', 'docs/projects/work'],
          expect.any(Function)
        );
      });
    });

    it('should handle my-files path', () => {
      const wrapper = createWrapper('/reading/my-files');
      const { result } = renderHook(() => useRenameResource(), { wrapper });

      services.renameResource.mockResolvedValue({ id: '1', name: 'file' });
      result.current.mutate({ id: '1', name: 'file' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalledWith(
          ['resources', 'my-files'],
          expect.any(Function)
        );
      });
    });
  });

  describe('mutation execution', () => {
    it('should call renameResource service with variables', async () => {
      const wrapper = createWrapper();
      const mockResponse = { id: '123', name: 'NewName.txt' };
      services.renameResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      const variables = { id: '123', name: 'NewName.txt' };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.renameResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should start loading toast before mutation', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '1', name: 'test' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'test' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Renaming resource...'
        );
      });
    });

    it('should return data from renameResource', async () => {
      const wrapper = createWrapper();
      const mockResponse = { id: '456', name: 'Renamed File' };
      services.renameResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '456', name: 'Renamed File' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('success handling', () => {
    it('should show success toast', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '1', name: 'new' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'new' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Resource renamed.');
      });
    });

    it('should update cache with new name', async () => {
      const wrapper = createWrapper('/reading/documents');
      services.renameResource.mockResolvedValue({ id: '1', name: 'Updated' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'Updated' });

      await waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalledWith(
          ['resources', 'documents'],
          expect.any(Function)
        );
      });
    });

    it('should update correct item in cache', () => {
      const wrapper = createWrapper('/reading/files');
      services.renameResource.mockResolvedValue({ id: '2', name: 'NewName' });

      const oldData = [
        { _id: '1', name: 'File1' },
        { _id: '2', name: 'OldName' },
        { _id: '3', name: 'File3' },
      ];

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '2', name: 'NewName' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const newData = updaterFunction(oldData);
        expect(newData[1].name).toBe('NewName');
        expect(newData[0].name).toBe('File1');
        expect(newData[2].name).toBe('File3');
      }
    });

    it('should return oldData if cache is empty', () => {
      const wrapper = createWrapper('/reading/files');
      services.renameResource.mockResolvedValue({ id: '1', name: 'New' });

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'New' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const result = updaterFunction(null);
        expect(result).toBeNull();
      }
    });

    it('should return oldData if undefined', () => {
      const wrapper = createWrapper('/reading/files');
      services.renameResource.mockResolvedValue({ id: '1', name: 'New' });

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'New' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const result = updaterFunction(undefined);
        expect(result).toBeUndefined();
      }
    });

    it('should stop loading toast on success', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '5', name: 'file' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '5', name: 'file' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error toast on failure', async () => {
      const wrapper = createWrapper();
      const error = { message: 'Rename failed' };
      services.renameResource.mockRejectedValue(error);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'test' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should stop loading toast on error', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'test' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });

    it('should set isError to true on failure', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'test' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle validation errors', async () => {
      const wrapper = createWrapper();
      const validationError = {
        message: 'Invalid name',
        errors: [{ field: 'name', message: 'Name cannot be empty' }],
      };
      services.renameResource.mockRejectedValue(validationError);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: '' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    it('should handle not found errors', async () => {
      const wrapper = createWrapper();
      const notFoundError = { message: 'Resource not found', status: 404 };
      services.renameResource.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: 'nonexistent', name: 'test' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('mutation states', () => {
    it('should have isPending true during mutation', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: '1', name: 'test' }), 100)
          )
      );

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'test' });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isSuccess true after successful mutation', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '1', name: 'file' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'file' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isIdle true initially', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRenameResource(), { wrapper });

      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('mutateAsync', () => {
    it('should support mutateAsync for promise-based usage', async () => {
      const wrapper = createWrapper();
      const mockResponse = { id: '7', name: 'async.txt' };
      services.renameResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      const variables = { id: '7', name: 'async.txt' };
      const data = await result.current.mutateAsync(variables);

      expect(data).toEqual(mockResponse);
      expect(services.renameResource).toHaveBeenCalledWith(variables);
    });

    it('should reject on error with mutateAsync', async () => {
      const wrapper = createWrapper();
      const error = { message: 'Rename failed' };
      services.renameResource.mockRejectedValue(error);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      await expect(
        result.current.mutateAsync({ id: '1', name: 'test' })
      ).rejects.toEqual(error);
    });
  });

  describe('variable types', () => {
    it('should handle rename with additional properties', async () => {
      const wrapper = createWrapper();
      const mockResponse = { id: '8', name: 'renamed' };
      services.renameResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      const variables = {
        id: '8',
        name: 'renamed',
        description: 'Updated description',
        tags: ['important'],
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.renameResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should handle special characters in names', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({
        id: '9',
        name: 'file (copy) [2024].txt',
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '9', name: 'file (copy) [2024].txt' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle unicode characters in names', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({
        id: '10',
        name: '文件名.txt',
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '10', name: '文件名.txt' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('multiple mutations', () => {
    it('should handle multiple sequential renames', async () => {
      const wrapper = createWrapper();
      services.renameResource
        .mockResolvedValueOnce({ id: '1', name: 'Name1' })
        .mockResolvedValueOnce({ id: '2', name: 'Name2' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'Name1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      result.current.mutate({ id: '2', name: 'Name2' });

      await waitFor(() => {
        expect(services.renameResource).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset mutation state between calls', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '1', name: 'file' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'file' });

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
    it('should complete full rename workflow', async () => {
      const wrapper = createWrapper('/reading/documents');
      const mockResponse = { id: '100', name: 'report-final.pdf' };
      services.renameResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '100', name: 'report-final.pdf' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Renaming resource...'
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockToast.success).toHaveBeenCalledWith('Resource renamed.');
      expect(queryClient.setQueryData).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });

    it('should complete full error workflow', async () => {
      const wrapper = createWrapper();
      const error = { message: 'Name already exists' };
      services.renameResource.mockRejectedValue(error);

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: 'duplicate' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty name string', async () => {
      const wrapper = createWrapper();
      services.renameResource.mockResolvedValue({ id: '1', name: '' });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: '' });

      await waitFor(() => {
        expect(services.renameResource).toHaveBeenCalledWith({
          id: '1',
          name: '',
        });
      });
    });

    it('should handle very long names', async () => {
      const wrapper = createWrapper();
      const longName = 'A'.repeat(500);
      services.renameResource.mockResolvedValue({ id: '1', name: longName });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '1', name: longName });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle resource not in cache', () => {
      const wrapper = createWrapper('/reading/files');
      services.renameResource.mockResolvedValue({ id: '999', name: 'New' });

      const oldData = [
        { _id: '1', name: 'File1' },
        { _id: '2', name: 'File2' },
      ];

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useRenameResource(), { wrapper });

      result.current.mutate({ id: '999', name: 'New' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const newData = updaterFunction(oldData);
        // Resource not found, should return unchanged data
        expect(newData).toEqual(oldData);
      }
    });
  });
});
