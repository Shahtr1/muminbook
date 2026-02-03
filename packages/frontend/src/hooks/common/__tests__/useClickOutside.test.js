/**
 * @fileoverview useClickOutside Hook Test Suite
 *
 * Tests click-outside detection logic including:
 * - Outside click detection
 * - Inside click prevention
 * - Multiple ref handling
 * - Touch support
 * - Event listener cleanup
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useClickOutside } from '@/hooks/common/useClickOutside.js';

describe('useClickOutside Hook', () => {
  let handler;

  beforeEach(() => {
    handler = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('event registration', () => {
    it('should attach mousedown and touchstart listeners', () => {
      const addSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useClickOutside([], handler));

      expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should remove listeners on unmount', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useClickOutside([], handler));

      unmount();

      expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith(
        'touchstart',
        expect.any(Function)
      );
    });
  });

  describe('outside click detection', () => {
    it('should call handler when clicking outside refs', () => {
      const ref = createRef();
      ref.current = document.createElement('div');

      renderHook(() => useClickOutside([ref], handler));

      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);

      outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not call handler when clicking inside ref', () => {
      const ref = createRef();
      const element = document.createElement('div');
      ref.current = element;

      document.body.appendChild(element);

      renderHook(() => useClickOutside([ref], handler));

      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('multiple refs support', () => {
    it('should treat all provided refs as inside', () => {
      const ref1 = createRef();
      const ref2 = createRef();

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');

      ref1.current = el1;
      ref2.current = el2;

      document.body.appendChild(el1);
      document.body.appendChild(el2);

      renderHook(() => useClickOutside([ref1, ref2], handler));

      el1.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      el2.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler if click is outside all refs', () => {
      const ref1 = createRef();
      const ref2 = createRef();

      ref1.current = document.createElement('div');
      ref2.current = document.createElement('div');

      renderHook(() => useClickOutside([ref1, ref2], handler));

      const outside = document.createElement('div');
      document.body.appendChild(outside);

      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch events', () => {
    it('should trigger handler on touchstart outside', () => {
      const ref = createRef();
      ref.current = document.createElement('div');

      renderHook(() => useClickOutside([ref], handler));

      const outside = document.createElement('div');
      document.body.appendChild(outside);

      outside.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('rerender behavior', () => {
    it('should update handler when dependency changes', () => {
      const ref = createRef();
      ref.current = document.createElement('div');

      const firstHandler = vi.fn();
      const secondHandler = vi.fn();

      const { rerender } = renderHook(({ fn }) => useClickOutside([ref], fn), {
        initialProps: { fn: firstHandler },
      });

      rerender({ fn: secondHandler });

      const outside = document.createElement('div');
      document.body.appendChild(outside);

      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(firstHandler).not.toHaveBeenCalled();
      expect(secondHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should not throw if ref.current is null', () => {
      const ref = createRef(); // current = null

      expect(() =>
        renderHook(() => useClickOutside([ref], handler))
      ).not.toThrow();
    });

    it('should not throw with empty refs array', () => {
      expect(() =>
        renderHook(() => useClickOutside([], handler))
      ).not.toThrow();
    });
  });
});
