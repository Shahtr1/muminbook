import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateSuhufConfig } from '../useUpdateSuhufConfig.js';
import * as services from '@/services/index.js';
import { useXToast } from '@/components/layout/toast/useXToast.jsx';
import React from 'react';

vi.mock('@/services/index.js', () => ({
  updateSuhufConfig: vi.fn(),
}));

vi.mock('@/components/layout/toast/useXToast.jsx', () => ({
  useXToast: vi.fn(),
}));

describe('useUpdateSuhufConfig (Workspace version)', () => {
  let mockToast;
  let testQueryClient;

  beforeEach(() => {
    mockToast = { error: vi.fn() };
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

  /* ------------------------------------------------------------------ */
  /* BASIC */
  /* ------------------------------------------------------------------ */

  it('returns mutation object', () => {
    const { result } = renderHook(() => useUpdateSuhufConfig('id-1'), {
      wrapper,
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });

  /* ------------------------------------------------------------------ */
  /* SERVICE CALL */
  /* ------------------------------------------------------------------ */

  it('calls service with layout update', async () => {
    services.updateSuhufConfig.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateSuhufConfig('id-1'), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(services.updateSuhufConfig).toHaveBeenCalledWith('id-1', {
        layout: { isSplit: true },
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* OPTIMISTIC LAYOUT MERGE */
  /* ------------------------------------------------------------------ */

  it('deep merges layout optimistically', async () => {
    const suhufId = 'id-2';

    const existing = {
      id: suhufId,
      config: {
        layout: {
          isSplit: false,
          isLeftTabOpen: true,
        },
      },
    };

    testQueryClient.setQueryData(['suhuf', suhufId], existing);
    services.updateSuhufConfig.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      const cached = testQueryClient.getQueryData(['suhuf', suhufId]);

      expect(cached.config.layout).toEqual({
        isSplit: true,
        isLeftTabOpen: true,
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* PANELS REPLACEMENT */
  /* ------------------------------------------------------------------ */

  it('replaces panels fully', async () => {
    const suhufId = 'id-3';

    const existing = {
      id: suhufId,
      config: {
        layout: {},
        panels: [{ id: 1 }],
      },
    };

    testQueryClient.setQueryData(['suhuf', suhufId], existing);
    services.updateSuhufConfig.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
      wrapper,
    });

    const newPanels = [{ id: 2 }];

    result.current.mutate({ panels: newPanels });

    await waitFor(() => {
      const cached = testQueryClient.getQueryData(['suhuf', suhufId]);
      expect(cached.config.panels).toEqual(newPanels);
    });
  });

  /* ------------------------------------------------------------------ */
  /* ROLLBACK ON ERROR */
  /* ------------------------------------------------------------------ */

  it('rolls back on error', async () => {
    const suhufId = 'id-4';

    const existing = {
      id: suhufId,
      config: {
        layout: { isSplit: false },
      },
    };

    testQueryClient.setQueryData(['suhuf', suhufId], existing);
    services.updateSuhufConfig.mockRejectedValue(new Error('Fail'));

    const { result } = renderHook(() => useUpdateSuhufConfig(suhufId), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cached = testQueryClient.getQueryData(['suhuf', suhufId]);
    expect(cached).toEqual(existing);
  });

  /* ------------------------------------------------------------------ */
  /* ERROR TOAST */
  /* ------------------------------------------------------------------ */

  it('calls toast on error', async () => {
    services.updateSuhufConfig.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useUpdateSuhufConfig('id-5'), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  /* mutateAsync */
  /* ------------------------------------------------------------------ */

  it('supports mutateAsync', async () => {
    const response = { id: 'id-6' };
    services.updateSuhufConfig.mockResolvedValue(response);

    const { result } = renderHook(() => useUpdateSuhufConfig('id-6'), {
      wrapper,
    });

    const data = await result.current.mutateAsync({
      layout: { isSplit: true },
    });

    expect(data).toEqual(response);
  });

  /* ------------------------------------------------------------------ */
  /* MULTIPLE MUTATIONS */
  /* ------------------------------------------------------------------ */

  it('handles multiple sequential mutations', async () => {
    services.updateSuhufConfig.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateSuhufConfig('id-7'), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    result.current.mutate({ layout: { isLeftTabOpen: false } });

    await waitFor(() => {
      expect(services.updateSuhufConfig).toHaveBeenCalledTimes(2);
    });
  });

  /* ------------------------------------------------------------------ */
  /* STATE FLAGS */
  /* ------------------------------------------------------------------ */

  it('isIdle initially', () => {
    const { result } = renderHook(() => useUpdateSuhufConfig('id-8'), {
      wrapper,
    });

    expect(result.current.isIdle).toBe(true);
  });

  it('isPending during request', async () => {
    services.updateSuhufConfig.mockImplementation(
      () => new Promise((res) => setTimeout(() => res({}), 100))
    );

    const { result } = renderHook(() => useUpdateSuhufConfig('id-9'), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  /* ------------------------------------------------------------------ */
  /* EDGE CASES */
  /* ------------------------------------------------------------------ */

  it('handles undefined cache safely', async () => {
    services.updateSuhufConfig.mockResolvedValue({});

    const { result } = renderHook(() => useUpdateSuhufConfig('id-10'), {
      wrapper,
    });

    result.current.mutate({ layout: { isSplit: true } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('handles different suhufIds independently', async () => {
    services.updateSuhufConfig.mockResolvedValue({});

    const { result: r1 } = renderHook(() => useUpdateSuhufConfig('id-A'), {
      wrapper,
    });

    const { result: r2 } = renderHook(() => useUpdateSuhufConfig('id-B'), {
      wrapper,
    });

    r1.current.mutate({ layout: { isSplit: true } });
    r2.current.mutate({ layout: { isSplit: false } });

    await waitFor(() => {
      expect(services.updateSuhufConfig).toHaveBeenCalledWith('id-A', {
        layout: { isSplit: true },
      });

      expect(services.updateSuhufConfig).toHaveBeenCalledWith('id-B', {
        layout: { isSplit: false },
      });
    });
  });
});
