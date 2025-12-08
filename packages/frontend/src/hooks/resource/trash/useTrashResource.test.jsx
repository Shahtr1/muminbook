import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrashResource } from './useTrashResource.js';
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

vi.mock('@/lib/services/index.js', () => ({
  getTrash: vi.fn(),
}));

const createWrapper = () => {
  const client = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useTrash (edge cases)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTrash.mockResolvedValue(mockTrashData);
  });

  it('maps and filters trash/doc1 correctly', async () => {
    // 🔁 doc1 → trash/doc1
    // 🔁 doc1/file1.txt → trash/doc1/file1.txt
    // 🔁 doc1/sub → trash/doc1/sub

    const { result } = renderHook(() => useTrashResource('trash/doc1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.resources.length > 0);

    expect(result.current.virtualRoot).toBe('trash/doc1');

    const virtualPaths = result.current.resources.map((r) => r.virtualPath);
    expect(virtualPaths).toContain('trash/doc1/file1.txt');
    expect(virtualPaths).toContain('trash/doc1/sub');
    expect(result.current.resources.length).toBe(2);
  });

  it('maps and filters nested under trash/doc1/sub', async () => {
    // 🔁 doc1/sub/nested.txt → trash/doc1/sub/nested.txt

    const { result } = renderHook(() => useTrashResource('trash/doc1/sub'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/doc1/sub/nested.txt'
    );
  });

  it('maps and filters trash/subdoc2 correctly', async () => {
    // 🔁 subdoc2 → trash/subdoc2
    // 🔁 subdoc2/deep.txt → trash/subdoc2/deep.txt

    const { result } = renderHook(() => useTrashResource('trash/subdoc2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/subdoc2/deep.txt'
    );
  });

  it('maps and filters trash/tutorials correctly', async () => {
    // 🔁 tutorials → trash/tutorials
    // 🔁 tutorials/lesson1.md → trash/tutorials/lesson1.md

    const { result } = renderHook(() => useTrashResource('trash/tutorials'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.resources.length > 0);
    expect(result.current.resources[0].virtualPath).toBe(
      'trash/tutorials/lesson1.md'
    );
  });

  it('maps orphaned files to trash/<filename>', async () => {
    // 🔁 lonely/just-a-file.txt → trash/just-a-file.txt
    // 🔁 random.txt → trash/random.txt

    const { result } = renderHook(() => useTrashResource('trash'), {
      wrapper: createWrapper(),
    });

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

  it('returns correct default virtualRoot', async () => {
    const { result } = renderHook(() => useTrashResource('trash'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.virtualRoot !== undefined);
    expect(result.current.virtualRoot).toBe('trash/doc1');
  });

  it('handles fallback virtualPath for unmapped files', async () => {
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

    await waitFor(() => result.current.resources.length > 0);

    const file = result.current.resources.find((r) =>
      r.virtualPath.endsWith('standalone.txt')
    );

    expect(file?.virtualPath).toBe('trash/standalone.txt');
  });
});
