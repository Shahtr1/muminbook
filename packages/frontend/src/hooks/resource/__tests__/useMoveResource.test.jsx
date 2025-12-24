import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useMoveResource } from '../useMoveResource.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/hooks/useXToast.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  moveResource: vi.fn(),
}));

vi.mock('@/hooks/useXToast.js', () => ({
  useXToast: vi.fn(),
}));

vi.mock('@/config/queryClient.js', () => ({
  default: {
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  },
}));

import queryClient from '@/config/queryClient.js';

describe('useMoveResource', () => {
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
      const { result } = renderHook(() => useMoveResource(), { wrapper });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe('mutation execution', () => {
    it('should call moveResource service', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockResolvedValue({ id: '1', name: 'moved' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      const variables = { id: '1', destinationPath: 'backup' };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.moveResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should start loading toast', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockResolvedValue({ id: '1', name: 'test' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Moving resource...'
        );
      });
    });
  });

  describe('success handling', () => {
    it('should show success toast', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockResolvedValue({ id: '1', name: 'moved' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Resource moved');
      });
    });

    it('should remove item from old path cache', async () => {
      const wrapper = createWrapper('/reading/documents');
      services.moveResource.mockResolvedValue({ id: '2', name: 'moved' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '2', destinationPath: 'backup' });

      await waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalledWith(
          ['resources', 'documents'],
          expect.any(Function)
        );
      });
    });

    it('should filter out moved item from cache', () => {
      const wrapper = createWrapper('/reading/files');
      services.moveResource.mockResolvedValue({ id: '2', name: 'moved' });

      const oldData = [
        { _id: '1', name: 'File1' },
        { _id: '2', name: 'File2' },
        { _id: '3', name: 'File3' },
      ];

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '2', destinationPath: 'backup' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const newData = updaterFunction(oldData);
        expect(newData).toHaveLength(2);
        expect(newData.find((item) => item._id === '2')).toBeUndefined();
      }
    });

    it('should return oldData if not array', () => {
      const wrapper = createWrapper('/reading/files');
      services.moveResource.mockResolvedValue({ id: '1', name: 'moved' });

      let updaterFunction;
      queryClient.setQueryData.mockImplementation((key, fn) => {
        updaterFunction = fn;
      });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      waitFor(() => {
        expect(queryClient.setQueryData).toHaveBeenCalled();
      });

      if (updaterFunction) {
        const result = updaterFunction(null);
        expect(result).toBeNull();
      }
    });

    it('should invalidate destination path queries', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockResolvedValue({ id: '3', name: 'moved' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '3', destinationPath: 'archive' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'archive'],
        });
      });
    });

    it('should stop loading toast', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockResolvedValue({ id: '1', name: 'moved' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error toast on failure', async () => {
      const wrapper = createWrapper();
      const error = { message: 'Move failed' };
      services.moveResource.mockRejectedValue(error);

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should set isError to true', async () => {
      const wrapper = createWrapper();
      services.moveResource.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '1', destinationPath: 'dest' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('integration workflow', () => {
    it('should complete full move workflow', async () => {
      const wrapper = createWrapper('/reading/documents');
      services.moveResource.mockResolvedValue({ id: '100', name: 'file.pdf' });

      const { result } = renderHook(() => useMoveResource(), { wrapper });

      result.current.mutate({ id: '100', destinationPath: 'backup' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Moving resource...'
        );
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockToast.success).toHaveBeenCalledWith('Resource moved');
      expect(queryClient.setQueryData).toHaveBeenCalled();
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });
  });
});
