import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateResource } from '../useCreateResource.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/hooks/useXToast.js';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  createResource: vi.fn(),
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

describe('useCreateResource', () => {
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
      const { result } = renderHook(() => useCreateResource(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should call useXToast hook', () => {
      renderHook(() => useCreateResource(), { wrapper });

      expect(useXToast).toHaveBeenCalled();
    });
  });

  describe('mutation execution', () => {
    it('should call createResource service with variables', async () => {
      const mockResponse = { id: '123', type: 'file', name: 'test.txt' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = { name: 'test.txt', type: 'file', path: 'documents' };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.createResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should start loading toast before mutation', async () => {
      services.createResource.mockResolvedValue({ type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Creating resource...'
        );
      });
    });

    it('should return data from createResource', async () => {
      const mockResponse = { id: '456', type: 'folder', name: 'New Folder' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'New Folder', type: 'folder', path: '/' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('success handling', () => {
    it('should show success toast for file creation', async () => {
      const mockResponse = { id: '1', type: 'file', name: 'doc.pdf' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'doc.pdf', type: 'file', path: 'files' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('File created.');
      });
    });

    it('should show success toast for folder creation', async () => {
      const mockResponse = { id: '2', type: 'folder', name: 'Projects' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'Projects', type: 'folder', path: 'root' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Folder created.');
      });
    });

    it('should invalidate queries on success', async () => {
      const mockResponse = { id: '3', type: 'file' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = { name: 'test', type: 'file', path: 'documents/work' };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'documents/work'],
        });
      });
    });

    it('should invalidate queries with correct path', async () => {
      const mockResponse = { id: '4', type: 'folder' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = {
        name: 'New',
        type: 'folder',
        path: 'my-files/projects',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'my-files/projects'],
        });
      });
    });

    it('should stop loading toast on success', async () => {
      services.createResource.mockResolvedValue({ id: '5', type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error toast on failure', async () => {
      const error = { message: 'Creation failed' };
      services.createResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(error);
      });
    });

    it('should stop loading toast on error', async () => {
      services.createResource.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.stopLoading).toHaveBeenCalled();
      });
    });

    it('should set isError to true on failure', async () => {
      services.createResource.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Invalid resource name',
        errors: [{ field: 'name', message: 'Name is required' }],
      };
      services.createResource.mockRejectedValue(validationError);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: '', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
        expect(mockToast.error.mock.calls[0][0]).toEqual(validationError);
      });
    });

    it('should handle unauthorized errors', async () => {
      const authError = { message: 'Unauthorized', status: 401 };
      services.createResource.mockRejectedValue(authError);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'protected' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('mutation states', () => {
    it('should have isPending true during mutation', async () => {
      services.createResource.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ type: 'file' }), 100)
          )
      );

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isSuccess true after successful mutation', async () => {
      services.createResource.mockResolvedValue({ id: '1', type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should have isIdle true initially', () => {
      const { result } = renderHook(() => useCreateResource(), { wrapper });

      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('mutateAsync', () => {
    it('should support mutateAsync for promise-based usage', async () => {
      const mockResponse = { id: '7', type: 'file', name: 'async.txt' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = { name: 'async.txt', type: 'file', path: 'async' };
      const data = await result.current.mutateAsync(variables);

      expect(data).toEqual(mockResponse);
      expect(services.createResource).toHaveBeenCalledWith(variables);
    });

    it('should reject on error with mutateAsync', async () => {
      const error = { message: 'Creation failed' };
      services.createResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      await expect(
        result.current.mutateAsync({ name: 'test', type: 'file', path: 'docs' })
      ).rejects.toEqual(error);
    });
  });

  describe('variable types', () => {
    it('should handle file creation with content', async () => {
      const mockResponse = { id: '8', type: 'file' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = {
        name: 'note.txt',
        type: 'file',
        path: 'notes',
        content: 'Hello World',
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.createResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should handle folder creation with metadata', async () => {
      const mockResponse = { id: '9', type: 'folder' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      const variables = {
        name: 'Project',
        type: 'folder',
        path: 'work',
        metadata: { color: 'blue', icon: 'folder' },
      };
      result.current.mutate(variables);

      await waitFor(() => {
        expect(services.createResource).toHaveBeenCalledWith(variables);
      });
    });

    it('should handle root path', async () => {
      services.createResource.mockResolvedValue({ id: '10', type: 'folder' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'Root Folder', type: 'folder', path: '/' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', '/'],
        });
      });
    });

    it('should handle my-files path', async () => {
      services.createResource.mockResolvedValue({ id: '11', type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'File', type: 'file', path: 'my-files' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'my-files'],
        });
      });
    });
  });

  describe('multiple mutations', () => {
    it('should handle multiple sequential mutations', async () => {
      services.createResource
        .mockResolvedValueOnce({ id: '1', type: 'file' })
        .mockResolvedValueOnce({ id: '2', type: 'folder' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'first', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      result.current.mutate({ name: 'second', type: 'folder', path: 'docs' });

      await waitFor(() => {
        expect(services.createResource).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset mutation state between calls', async () => {
      services.createResource.mockResolvedValue({ id: '1', type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'first', type: 'file', path: 'docs' });

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
    it('should complete full create workflow', async () => {
      const mockResponse = { id: '100', type: 'file', name: 'document.pdf' };
      services.createResource.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      // Start mutation
      result.current.mutate({
        name: 'document.pdf',
        type: 'file',
        path: 'documents',
      });

      // Wait for loading to start
      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalledWith(
          'Creating resource...'
        );
      });

      // Wait for success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify all callbacks
      expect(mockToast.success).toHaveBeenCalledWith('File created.');
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });

    it('should complete full error workflow', async () => {
      const error = { message: 'Disk full' };
      services.createResource.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({
        name: 'large.zip',
        type: 'file',
        path: 'uploads',
      });

      // Wait for loading to start
      await waitFor(() => {
        expect(mockToast.startLoading).toHaveBeenCalled();
      });

      // Wait for error
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify error callbacks
      expect(mockToast.error).toHaveBeenCalled();
      expect(mockToast.stopLoading).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty path string', async () => {
      services.createResource.mockResolvedValue({ id: '1', type: 'file' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: '' });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', ''],
        });
      });
    });

    it('should handle nested path', async () => {
      services.createResource.mockResolvedValue({ id: '1', type: 'folder' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({
        name: 'deep',
        type: 'folder',
        path: 'a/b/c/d/e',
      });

      await waitFor(() => {
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['resources', 'a/b/c/d/e'],
        });
      });
    });

    it('should handle response without type field', async () => {
      services.createResource.mockResolvedValue({ id: '1', name: 'test' });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({ name: 'test', type: 'file', path: 'docs' });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Folder created.');
      });
    });

    it('should handle special characters in resource name', async () => {
      services.createResource.mockResolvedValue({
        id: '1',
        type: 'file',
        name: 'file (1) [copy].txt',
      });

      const { result } = renderHook(() => useCreateResource(), { wrapper });

      result.current.mutate({
        name: 'file (1) [copy].txt',
        type: 'file',
        path: 'docs',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
