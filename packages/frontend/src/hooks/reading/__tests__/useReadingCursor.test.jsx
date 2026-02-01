import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReadingCursor } from '@/hooks/reading/useReadingCursor.js';

let useQueryMock;
let getReadingMock;

// Mock service
vi.mock('@/services/index.js', () => ({
  getReading: (...args) => getReadingMock(...args),
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: (config) => useQueryMock(config),
}));

describe('useReadingCursor', () => {
  beforeEach(() => {
    getReadingMock = vi.fn();
    useQueryMock = vi.fn();
  });

  // ---------------------------------------------------
  // QUERY KEY STRUCTURE
  // ---------------------------------------------------

  it('builds correct queryKey with all params', () => {
    useQueryMock.mockReturnValue({ data: {} });

    renderHook(() =>
      useReadingCursor({
        source: 'quran',
        divisionType: 'surah',
        divisionNumber: 2,
        category: 'translation',
        afterUuid: 'a1',
        beforeUuid: 'b1',
        limit: 25,
      })
    );

    const config = useQueryMock.mock.calls[0][0];

    expect(config.queryKey).toEqual([
      'reading',
      'quran',
      'surah',
      2,
      'translation',
      'a1',
      'b1',
      25,
    ]);
  });

  it('keeps undefined values in queryKey (important for cache separation)', () => {
    useQueryMock.mockReturnValue({ data: {} });

    renderHook(() =>
      useReadingCursor({
        source: 'quran',
        divisionType: undefined,
        divisionNumber: undefined,
        category: undefined,
      })
    );

    const config = useQueryMock.mock.calls[0][0];

    expect(config.queryKey).toEqual([
      'reading',
      'quran',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      40,
    ]);
  });

  // ---------------------------------------------------
  // QUERY FUNCTION FORWARDING
  // ---------------------------------------------------

  it('forwards correct params to getReading', async () => {
    useQueryMock.mockImplementation(({ queryFn }) => {
      queryFn();
      return { data: {} };
    });

    renderHook(() =>
      useReadingCursor({
        source: 'source-1',
        divisionType: 'juz',
        divisionNumber: 5,
        category: 'arabic',
        afterUuid: 'cursorA',
        beforeUuid: null,
        limit: 100,
      })
    );

    expect(getReadingMock).toHaveBeenCalledWith('source-1', {
      divisionType: 'juz',
      divisionNumber: 5,
      category: 'arabic',
      afterUuid: 'cursorA',
      beforeUuid: null,
      limit: 100,
    });
  });

  // ---------------------------------------------------
  // BOOLEAN COERCION EDGE CASES
  // ---------------------------------------------------

  it('coerces truthy hasNext/hasPrevious correctly', () => {
    useQueryMock.mockReturnValue({
      data: {
        hasNext: 1,
        hasPrevious: 'yes',
      },
    });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrevious).toBe(true);
  });

  it('coerces falsy hasNext/hasPrevious correctly', () => {
    useQueryMock.mockReturnValue({
      data: {
        hasNext: 0,
        hasPrevious: '',
      },
    });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(false);
  });

  // ---------------------------------------------------
  // CURSOR NORMALIZATION
  // ---------------------------------------------------

  it('returns null for undefined cursors', () => {
    useQueryMock.mockReturnValue({
      data: {},
    });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.nextCursor).toBeNull();
    expect(result.current.prevCursor).toBeNull();
  });

  it('preserves valid cursor values', () => {
    useQueryMock.mockReturnValue({
      data: {
        nextCursor: 'next-123',
        prevCursor: 'prev-456',
      },
    });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.nextCursor).toBe('next-123');
    expect(result.current.prevCursor).toBe('prev-456');
  });

  it('does NOT coerce empty string cursor to null', () => {
    useQueryMock.mockReturnValue({
      data: {
        nextCursor: '',
      },
    });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.nextCursor).toBe('');
  });

  // ---------------------------------------------------
  // DATA ABSENCE EDGE CASES
  // ---------------------------------------------------

  it('handles completely undefined data safely', () => {
    useQueryMock.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.nextCursor).toBeNull();
    expect(result.current.prevCursor).toBeNull();
  });

  it('does not crash when data is null', () => {
    useQueryMock.mockReturnValue({ data: null });

    const { result } = renderHook(() => useReadingCursor({ source: 'x' }));

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrevious).toBe(false);
  });

  // ---------------------------------------------------
  // DEFAULT LIMIT EDGE CASE
  // ---------------------------------------------------

  it('uses default limit of 40 when not provided', () => {
    useQueryMock.mockReturnValue({ data: {} });

    renderHook(() => useReadingCursor({ source: 'abc' }));

    const config = useQueryMock.mock.calls[0][0];

    expect(config.queryKey.at(-1)).toBe(40);
  });

  // ---------------------------------------------------
  // PLACEHOLDER BEHAVIOR
  // ---------------------------------------------------

  it('placeholderData returns previous data', () => {
    useQueryMock.mockReturnValue({ data: {} });

    renderHook(() => useReadingCursor({ source: 'x' }));

    const config = useQueryMock.mock.calls[0][0];

    const prev = { some: 'data' };

    expect(config.placeholderData(prev)).toBe(prev);
  });

  // ---------------------------------------------------
  // STALE TIME CONTRACT
  // ---------------------------------------------------

  it('sets staleTime to Infinity', () => {
    useQueryMock.mockReturnValue({ data: {} });

    renderHook(() => useReadingCursor({ source: 'x' }));

    const config = useQueryMock.mock.calls[0][0];

    expect(config.staleTime).toBe(Infinity);
  });
});
