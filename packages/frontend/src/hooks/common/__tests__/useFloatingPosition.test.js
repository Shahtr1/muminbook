/**
 * @fileoverview useFloatingPosition Hook Test Suite
 *
 * Tests floating position behavior including:
 * - Direction-based positioning
 * - Offset handling
 * - Scroll/resize listener registration
 * - Cleanup behavior
 * - Open/close lifecycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import React, { createRef } from 'react';
import { useFloatingPosition } from '@/hooks/common/useFloatingPosition.js';

describe('useFloatingPosition Hook', () => {
  let anchorRef;
  let mockRect;

  beforeEach(() => {
    anchorRef = createRef();

    mockRect = {
      top: 100,
      left: 200,
      bottom: 150,
      right: 300,
      width: 100,
      height: 50,
    };

    anchorRef.current = {
      getBoundingClientRect: vi.fn(() => mockRect),
    };

    Object.defineProperty(window, 'scrollX', { value: 10, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior', () => {
    it('should return null when closed', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: false,
        })
      );

      expect(result.current).toBeNull();
    });

    it('should calculate bottom-start by default', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
        })
      );

      expect(result.current).toEqual({
        top: mockRect.bottom + window.scrollY + 4,
        left: mockRect.left + window.scrollX,
      });
    });
  });

  describe('direction handling', () => {
    it('should calculate bottom-end', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
          direction: 'bottom-end',
        })
      );

      expect(result.current).toEqual({
        top: mockRect.bottom + window.scrollY + 4,
        left: mockRect.right + window.scrollX,
      });
    });

    it('should calculate top-start', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
          direction: 'top-start',
        })
      );

      expect(result.current).toEqual({
        top: mockRect.top + window.scrollY - 4,
        left: mockRect.left + window.scrollX,
      });
    });

    it('should calculate right', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
          direction: 'right',
        })
      );

      expect(result.current).toEqual({
        top: mockRect.top + window.scrollY,
        left: mockRect.right + window.scrollX + 4,
      });
    });

    it('should calculate left', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
          direction: 'left',
        })
      );

      expect(result.current).toEqual({
        top: mockRect.top + window.scrollY,
        left: mockRect.left + window.scrollX - 4,
      });
    });
  });

  describe('offset handling', () => {
    it('should apply custom offset', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
          offset: 20,
        })
      );

      expect(result.current.top).toBe(mockRect.bottom + window.scrollY + 20);
    });
  });

  describe('lifecycle behavior', () => {
    it('should reset position when closed', () => {
      const { result, rerender } = renderHook(
        ({ open }) =>
          useFloatingPosition({
            anchorRef,
            isOpen: open,
          }),
        { initialProps: { open: true } }
      );

      expect(result.current).not.toBeNull();

      rerender({ open: false });

      expect(result.current).toBeNull();
    });

    it('should recalculate position on scroll event', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
        })
      );

      const initial = result.current;

      // Override mock to return new values
      anchorRef.current.getBoundingClientRect = vi.fn(() => ({
        ...mockRect,
        bottom: 250,
      }));

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).not.toEqual(initial);
    });
  });

  describe('event listeners', () => {
    it('should attach scroll and resize listeners when open', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
        })
      );

      expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);

      expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should remove listeners on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
        })
      );

      unmount();

      expect(removeSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        true
      );

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('scroll/resize recalculation', () => {
    it('should recalculate position on scroll event', () => {
      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef,
          isOpen: true,
        })
      );

      const initial = result.current;

      mockRect.bottom = 200;

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).not.toEqual(initial);
    });
  });

  describe('edge cases', () => {
    it('should return null if anchorRef.current is null', () => {
      const emptyRef = createRef();

      const { result } = renderHook(() =>
        useFloatingPosition({
          anchorRef: emptyRef,
          isOpen: true,
        })
      );

      expect(result.current).toBeNull();
    });
  });
});
