/**
 * @fileoverview Tests for useTrashResource Hook
 *
 * This test suite validates the trash resource management functionality,
 * including virtual path mapping, folder anchor detection, and filtering logic.
 *
 * @see README.md for detailed documentation on how the hook works
 * @see useTrashResource.js for the implementation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock must be defined before imports
vi.mock('@/services/index.js', () => ({
  getTrash: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrashResource } from '../useTrashResource.js';
import * as api from '@/services/index.js';

// 🧪 Comprehensive mock data
const mockTrashData = [
  // 🔹 Folder Anchor 1: doc1
  { _id: '1', name: 'doc1', type: 'folder', path: 'my-files/documents/doc1' },
  {
    _id: '2',
    name: 'file1',
    type: 'file',
    path: 'my-files/documents/doc1/file1.txt',
  },
  {
    _id: '3',
    name: 'subfolder',
    type: 'folder',
    path: 'my-files/documents/doc1/sub',
  },
  {
    _id: '4',
    name: 'nestedFile',
    type: 'file',
    path: 'my-files/documents/doc1/sub/nested.txt',
  },

  // 🔹 Folder Anchor 2: subdoc2
  { _id: '5', name: 'subdoc2', type: 'folder', path: 'my-files/x/y/z/subdoc2' },
  {
    _id: '6',
    name: 'deepfile',
    type: 'file',
    path: 'my-files/x/y/z/subdoc2/deep.txt',
  },

  // 🔹 Folder Anchor 3: tutorials
  {
    _id: '7',
    name: 'tutorials',
    type: 'folder',
    path: 'my-files/projects/react/tutorials',
  },
  {
    _id: '8',
    name: 'lesson',
    type: 'file',
    path: 'my-files/projects/react/tutorials/lesson1.md',
  },

  // ❌ Orphaned files
  {
    _id: '9',
    name: 'just-a-file.txt',
    type: 'file',
    path: 'my-files/lonely/just-a-file.txt',
  },
  { _id: '10', name: 'random.txt', type: 'file', path: 'my-files/random.txt' },
];

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useTrashResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTrash.mockResolvedValue(mockTrashData);
  });

  it('maps folder anchors and filters direct children correctly', async () => {
    // Tests: Folder anchor 'doc1' becomes 'trash/doc1'
    // Only direct children (file1.txt, sub/) are shown, not nested items

    const { result } = renderHook(() => useTrashResource('trash/doc1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);

    expect(result.current.virtualRoot).toBe('trash/doc1');

    const virtualPaths = result.current.resources.map((r) => r.virtualPath);
    expect(virtualPaths).toContain('trash/doc1/file1.txt');
    expect(virtualPaths).toContain('trash/doc1/sub');
    expect(result.current.resources.length).toBe(2);
  });

  it('navigates into nested folders correctly', async () => {
    // Tests: Navigating deeper into folder structure works properly
    // Viewing 'trash/doc1/sub' shows only files directly inside 'sub'

    const { result } = renderHook(() => useTrashResource('trash/doc1/sub'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/doc1/sub/nested.txt'
    );
  });

  it('handles multiple folder anchors independently', async () => {
    // Tests: Different folder anchors (subdoc2) are mapped correctly
    // Each anchor creates its own virtual tree

    const { result } = renderHook(() => useTrashResource('trash/subdoc2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/subdoc2/deep.txt'
    );
  });

  it('preserves folder structure for deeply nested anchors', async () => {
    // Tests: Folder anchor 'tutorials' from deep path still works
    // Path depth doesn't matter, only the anchor folder name

    const { result } = renderHook(() => useTrashResource('trash/tutorials'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/tutorials/lesson1.md'
    );
  });

  it('handles orphaned files (deleted without folder anchor)', async () => {
    // Tests: Files deleted individually appear at trash root
    // Orphans use just their filename: 'trash/filename.ext'

    const { result } = renderHook(() => useTrashResource('trash'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);

    const virtualPaths = result.current.resources.map((r) => r.virtualPath);
    expect(virtualPaths).toContain('trash/just-a-file.txt');
    expect(virtualPaths).toContain('trash/random.txt');

    const justFile = result.current.resources.find(
      (r) => r.virtualPath === 'trash/just-a-file.txt'
    );
    const randomFile = result.current.resources.find(
      (r) => r.virtualPath === 'trash/random.txt'
    );

    expect(justFile.name).toBe('just-a-file.txt');
    expect(randomFile.name).toBe('random.txt');
  });

  it('calculates virtualRoot correctly for trash root view', async () => {
    // Tests: When viewing trash root, virtualRoot defaults to 'trash'
    // This happens when no folder resources match the current path

    const { result } = renderHook(() => useTrashResource('trash'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    expect(result.current.virtualRoot).toBe('trash');
  });

  it('handles unmapped files with fallback virtualPath', async () => {
    // Tests: Files that don't match any folder anchor use filename fallback
    // Ensures robustness when data structure is unexpected

    const extraOrphan = {
      _id: 'zz',
      name: 'standalone',
      type: 'file',
      path: 'my-files/unknown/folder/standalone.txt',
    };

    api.getTrash.mockResolvedValueOnce([...mockTrashData, extraOrphan]);

    const { result } = renderHook(() => useTrashResource('trash'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);
    await waitFor(() => result.current.resources.length > 0);

    const file = result.current.resources.find((r) =>
      r.virtualPath.endsWith('standalone.txt')
    );

    expect(file?.virtualPath).toBe('trash/standalone.txt');
  });
});
