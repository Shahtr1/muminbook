import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXToast } from '../useXToast.jsx';

// Mock Chakra UI useToast
const mockToast = vi.fn();
const mockClose = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => {
    mockToast.close = mockClose;
    return mockToast;
  },
}));

// Mock react-router's useLocation so hooks that call it work in tests
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
}));

describe('useXToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockReturnValue('toast-id-123');
  });

  describe('success', () => {
    it('should show success toast with message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.success('Operation successful');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Operation successful',
        status: 'success',
        position: 'bottom',
        duration: 3000,
        isClosable: true,
      });
    });

    it('should stop loading before showing success', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      expect(mockToast).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.success('Success message');
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
      expect(mockToast).toHaveBeenCalledTimes(2);
    });

    it('should handle empty string message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.success('');
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '' })
      );
    });

    it('should handle long messages', () => {
      const { result } = renderHook(() => useXToast());
      const longMessage = 'A'.repeat(200);

      act(() => {
        result.current.success(longMessage);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: longMessage })
      );
    });
  });

  describe('error', () => {
    it('should show error toast with default message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Something went wrong!',
        status: 'error',
        position: 'bottom',
        duration: 3000,
        isClosable: true,
      });
    });

    it('should show error toast with error message property', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error({ message: 'Custom error message' });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Custom error message' })
      );
    });

    it('should show error toast with errors array', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error({
          errors: [{ message: 'First error' }, { message: 'Second error' }],
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'First error' })
      );
    });

    it('should prioritize errors array over message property', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error({
          message: 'General error',
          errors: [{ message: 'Specific error' }],
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Specific error' })
      );
    });

    it('should handle empty errors array', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error({
          message: 'Fallback message',
          errors: [],
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Fallback message' })
      );
    });

    it('should stop loading before showing error', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        result.current.error({ message: 'Error occurred' });
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
    });

    it('should handle null error', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error(null);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Something went wrong!' })
      );
    });

    it('should handle undefined error', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error(undefined);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Something went wrong!' })
      );
    });

    it('should handle Error instance', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.error(new Error('Standard error'));
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Standard error' })
      );
    });
  });

  describe('startLoading', () => {
    it('should show loading toast with default message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Processing...',
        status: 'loading',
        position: 'bottom',
        isClosable: false,
        duration: null,
      });
    });

    it('should show loading toast with custom message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading('Loading data...');
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Loading data...' })
      );
    });

    it('should not show multiple loading toasts', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading('First loading');
        result.current.startLoading('Second loading');
        result.current.startLoading('Third loading');
      });

      expect(mockToast).toHaveBeenCalledTimes(1);
    });

    it('should store toast id reference', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      expect(mockToast).toHaveBeenCalled();
      expect(mockToast).toHaveReturnedWith('toast-id-123');
    });
  });

  describe('stopLoading', () => {
    it('should close loading toast', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        result.current.stopLoading();
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
    });

    it('should do nothing if no loading toast exists', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.stopLoading();
      });

      expect(mockClose).not.toHaveBeenCalled();
    });

    it('should clear toast id reference', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
        result.current.stopLoading();
      });

      // Call stopLoading again - should not try to close
      act(() => {
        result.current.stopLoading();
      });

      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should allow new loading toast after stopping', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading('First');
        result.current.stopLoading();
        result.current.startLoading('Second');
      });

      expect(mockToast).toHaveBeenCalledTimes(2);
    });
  });

  describe('notify', () => {
    it('should start loading when isPending is true', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(true, false, false);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'loading' })
      );
    });

    it('should start loading with custom message', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(true, false, false, 'Custom loading...');
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Custom loading...' })
      );
    });

    it('should stop loading when isSuccess is true', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        result.current.notify(false, true, false);
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
    });

    it('should stop loading when isError is true', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading();
      });

      act(() => {
        result.current.notify(false, false, true);
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
    });

    it('should not do anything when all flags are false', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(false, false, false);
      });

      expect(mockToast).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();
    });

    it('should handle multiple state changes', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(true, false, false, 'Loading...');
      });

      expect(mockToast).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.notify(false, true, false);
      });

      expect(mockClose).toHaveBeenCalledWith('toast-id-123');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete success flow', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading('Saving...');
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'loading' })
      );

      act(() => {
        result.current.success('Saved successfully');
      });

      expect(mockClose).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success' })
      );
    });

    it('should handle complete error flow', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.startLoading('Deleting...');
      });

      act(() => {
        result.current.error({ message: 'Delete failed' });
      });

      expect(mockClose).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', title: 'Delete failed' })
      );
    });

    it('should handle notify with pending then success', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(true, false, false, 'Uploading...');
      });

      expect(mockToast).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.notify(false, true, false);
      });

      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle notify with pending then error', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.notify(true, false, false, 'Processing...');
      });

      act(() => {
        result.current.notify(false, false, true);
      });

      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle rapid consecutive operations', () => {
      const { result } = renderHook(() => useXToast());

      act(() => {
        result.current.success('First operation');
        result.current.success('Second operation');
        result.current.error({ message: 'Third operation failed' });
      });

      expect(mockToast).toHaveBeenCalledTimes(3);
    });

    it('should handle mutation lifecycle with useXToast', () => {
      const { result } = renderHook(() => useXToast());

      // Simulate mutation start
      act(() => {
        result.current.startLoading('Creating resource...');
      });

      // Simulate mutation success
      act(() => {
        result.current.success('Resource created');
      });

      expect(mockToast).toHaveBeenCalledTimes(2);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('return value', () => {
    it('should return all methods', () => {
      const { result } = renderHook(() => useXToast());

      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('startLoading');
      expect(result.current).toHaveProperty('stopLoading');
      expect(result.current).toHaveProperty('notify');
    });

    it('should return functions', () => {
      const { result } = renderHook(() => useXToast());

      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.startLoading).toBe('function');
      expect(typeof result.current.stopLoading).toBe('function');
      expect(typeof result.current.notify).toBe('function');
    });

    it('should return errorWithRetry for error toast', () => {
      const { result } = renderHook(() => useXToast());

      expect(result.current).toHaveProperty('errorWithRetry');
      expect(typeof result.current.errorWithRetry).toBe('function');
    });
  });
});
