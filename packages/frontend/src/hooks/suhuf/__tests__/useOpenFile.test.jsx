import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks must be set up before importing the hook under test
const mutateMock = vi.fn();

vi.mock('@/hooks/suhuf/useOpenSuhuf.js', () => ({
  useOpenSuhuf: vi.fn((cb) => {
    // Return an openSuhuf function that when invoked calls the provided callback
    return () => cb('suhuf-1');
  }),
}));

vi.mock('@/hooks/suhuf/useUpdateSuhufConfig.js', () => ({
  useUpdateSuhufConfig: vi.fn(() => ({ mutate: mutateMock })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    getQueryData: (key) => {
      // key shape: ['suhuf', createdSuhufId]
      const [, id] = key || [];
      if (!id) return null;
      return {
        config: {
          panels: [
            { id: 'p1', active: true, fileId: 'old', fileType: 'user' },
            { id: 'p2', active: false },
          ],
        },
      };
    },
  })),
}));

// Import the hook AFTER mocking
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';

function TestComponent({ fileId, isReading, onOpenReady }) {
  const openSuhuf = useOpenFile(fileId, isReading);
  useEffect(() => {
    if (onOpenReady) onOpenReady(openSuhuf);
  }, [openSuhuf, onOpenReady]);
  return null;
}

describe('useOpenFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls updateConfig when active panel file changes', async () => {
    let openFn;

    render(
      <TestComponent
        fileId="file-1"
        isReading={false}
        onOpenReady={(fn) => (openFn = fn)}
      />
    );

    // Trigger openSuhuf which will call the callback and set the createdSuhufId inside the hook
    act(async () => {
      openFn();
    });

    // Wait for the mutation to be called
    await waitFor(() => expect(mutateMock).toHaveBeenCalled());

    const expectedPanels = [
      { id: 'p1', active: true, fileId: 'file-1', fileType: 'user' },
      { id: 'p2', active: false },
    ];

    expect(mutateMock).toHaveBeenCalledWith({ panels: expectedPanels });
  });

  it('does not call updateConfig when nothing changed', async () => {
    let openFn;

    render(
      <TestComponent
        fileId="old"
        isReading={false}
        onOpenReady={(fn) => (openFn = fn)}
      />
    );

    act(async () => {
      openFn();
    });

    // Give a small tick for effects; mutate should not be called
    await new Promise((r) => setTimeout(r, 10));

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
