import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

let mutateMock;
let navigateMock;
let getQueryDataMock;

// Mock react-router navigation
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

// Mock react-query's useQueryClient
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getQueryData: getQueryDataMock }),
}));

// Mock useCreateSuhuf hook to return mutate function
vi.mock('@/hooks/suhuf/useCreateSuhuf.js', () => ({
  useCreateSuhuf: () => ({ mutate: mutateMock }),
}));

// Import the hook after mocks
import { useOpenSuhuf } from '@/hooks/suhuf/useOpenSuhuf.js';

function TestComponent({ onReady, onCreated }) {
  const open = useOpenSuhuf(onCreated);
  useEffect(() => {
    if (onReady) onReady(open);
  }, [open, onReady]);
  return null;
}

describe('useOpenSuhuf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset mocks to defaults; individual tests will override
    mutateMock = vi.fn((data, opts) => {
      // call onSuccess with a sample id if provided
      if (opts && typeof opts.onSuccess === 'function') {
        opts.onSuccess({ suhufId: 'created-1' });
      }
    });

    navigateMock = vi.fn();

    // default: no open windows
    getQueryDataMock = vi.fn(() => []);
  });

  it('creates a suhuf with base title when no collisions and navigates + callback', async () => {
    let openFn;
    const onCreated = vi.fn();

    // Render component and capture the returned open function
    render(
      <TestComponent onReady={(fn) => (openFn = fn)} onCreated={onCreated} />
    );

    // Call the open function
    await act(async () => {
      openFn();
    });

    // mutate should be called with the new title
    expect(mutateMock).toHaveBeenCalledTimes(1);
    const [payload] = mutateMock.mock.calls[0];
    expect(payload).toEqual({ title: 'Untitled Suhuf' });

    // navigation should be triggered to the new suhuf id
    expect(navigateMock).toHaveBeenCalledWith('/suhuf/created-1');

    // onSuccess callback passed to hook should be invoked with the suhuf id
    expect(onCreated).toHaveBeenCalledWith('created-1');
  });

  it('appends a counter when base title already exists', async () => {
    // Simulate existing titles: base title already open by updating the existing mock's implementation
    getQueryDataMock.mockImplementation(() => [
      { type: 'Suhuf', typeId: { title: 'Untitled Suhuf' } },
      { type: 'Other', typeId: { title: 'Something' } },
    ]);

    let openFn;
    render(<TestComponent onReady={(fn) => (openFn = fn)} />);

    await act(async () => {
      openFn();
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
    const [payload] = mutateMock.mock.calls[0];
    // Since base exists, the hook should choose '(1) Untitled Suhuf'
    expect(payload).toEqual({ title: '(1) Untitled Suhuf' });
  });
});
