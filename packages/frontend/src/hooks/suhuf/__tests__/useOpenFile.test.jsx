import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

let mutateMock;
let getQueryDataMock;
let toastErrorMock;

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryData: getQueryDataMock,
  }),
}));

// Mock update config hook
vi.mock('@/hooks/suhuf/useUpdateSuhufConfig.js', () => ({
  useUpdateSuhufConfig: () => ({
    mutate: mutateMock,
  }),
}));

// Mock toast hook
vi.mock('@/components/toast/useXToast.jsx', () => ({
  useXToast: () => ({
    error: toastErrorMock,
  }),
}));

// Import after mocks
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';

function TestComponent({ suhufId, onReady }) {
  const open = useOpenFile(suhufId);

  useEffect(() => {
    if (onReady) onReady(open);
  }, [open, onReady]);

  return null;
}

describe('useOpenFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mutateMock = vi.fn();
    toastErrorMock = vi.fn();
    getQueryDataMock = vi.fn();
  });

  it('shows error when suhufId is missing', async () => {
    let openFn;

    render(<TestComponent suhufId={null} onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn('file-1');
    });

    expect(toastErrorMock).toHaveBeenCalledWith({
      message: 'No suhuf selected',
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('shows error when fileId is missing', async () => {
    let openFn;

    render(<TestComponent suhufId="123" onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn(null);
    });

    expect(toastErrorMock).toHaveBeenCalledWith({
      message: 'No file ID present',
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('shows error when suhuf not found in cache', async () => {
    getQueryDataMock.mockReturnValue(undefined);

    let openFn;

    render(<TestComponent suhufId="123" onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn('file-1');
    });

    expect(toastErrorMock).toHaveBeenCalledWith({
      message: 'No suhuf found with the given ID',
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('shows error when no panels configured', async () => {
    getQueryDataMock.mockReturnValue({
      config: { panels: [] },
    });

    let openFn;

    render(<TestComponent suhufId="123" onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn('file-1');
    });

    expect(toastErrorMock).toHaveBeenCalledWith({
      message: 'No panels configured',
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('shows error when no active panel exists', async () => {
    getQueryDataMock.mockReturnValue({
      config: {
        panels: [
          { id: 1, active: false },
          { id: 2, active: false },
        ],
      },
    });

    let openFn;

    render(<TestComponent suhufId="123" onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn('file-1');
    });

    expect(toastErrorMock).toHaveBeenCalledWith({
      message: 'No active panel selected',
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('updates config when active panel exists', async () => {
    getQueryDataMock.mockReturnValue({
      config: {
        panels: [
          { id: 1, active: true, fileId: null, fileType: null },
          { id: 2, active: false, fileId: 'old', fileType: 'reading' },
        ],
      },
    });

    let openFn;

    render(<TestComponent suhufId="123" onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn('file-99');
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);

    expect(mutateMock).toHaveBeenCalledWith({
      panels: [
        {
          id: 1,
          active: true,
          fileId: 'file-99',
          fileType: 'reading',
        },
        {
          id: 2,
          active: false,
          fileId: 'old',
          fileType: 'reading',
        },
      ],
    });
  });
});
