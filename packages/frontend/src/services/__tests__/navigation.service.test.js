import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('navigation.service', () => {
  let navigationService;

  beforeEach(async () => {
    // Re-import the module before each test to reset state
    vi.resetModules();
    navigationService = await import('../navigation.service.js');
  });

  describe('navigate', () => {
    it('should have default navigate function that does nothing', () => {
      expect(navigationService.navigate).toBeDefined();
      expect(typeof navigationService.navigate).toBe('function');
      expect(navigationService.navigate()).toBeUndefined();
    });

    it('should not throw error when called with no arguments', () => {
      expect(() => navigationService.navigate()).not.toThrow();
    });

    it('should not throw error when called with arguments', () => {
      expect(() => navigationService.navigate('/some-path')).not.toThrow();
      expect(() =>
        navigationService.navigate('/path', { state: {} })
      ).not.toThrow();
    });
  });

  describe('setNavigate', () => {
    it('should be defined', () => {
      expect(navigationService.setNavigate).toBeDefined();
      expect(typeof navigationService.setNavigate).toBe('function');
    });

    it('should update the navigate function', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      navigationService.navigate('/test');
      expect(mockNavigate).toHaveBeenCalledWith('/test');
    });

    it('should allow navigate to be called with path', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      navigationService.navigate('/dashboard');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should allow navigate to be called with path and options', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      const options = { state: { from: '/login' }, replace: true };
      navigationService.navigate('/home', options);

      expect(mockNavigate).toHaveBeenCalledWith('/home', options);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should replace previous navigate function', () => {
      const firstNavigate = vi.fn();
      const secondNavigate = vi.fn();

      navigationService.setNavigate(firstNavigate);
      navigationService.navigate('/first');
      expect(firstNavigate).toHaveBeenCalledWith('/first');
      expect(secondNavigate).not.toHaveBeenCalled();

      navigationService.setNavigate(secondNavigate);
      navigationService.navigate('/second');
      expect(firstNavigate).toHaveBeenCalledTimes(1);
      expect(secondNavigate).toHaveBeenCalledWith('/second');
    });

    it('should allow multiple calls to navigate after setNavigate', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      navigationService.navigate('/page1');
      navigationService.navigate('/page2');
      navigationService.navigate('/page3');

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/page1');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/page2');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, '/page3');
    });

    it('should preserve function reference after setting', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      const navigateRef = navigationService.navigate;
      navigateRef('/test');

      expect(mockNavigate).toHaveBeenCalledWith('/test');
    });

    it('should handle setting navigate to an arrow function', () => {
      const arrowNavigate = vi.fn((path) => `Navigating to ${path}`);
      navigationService.setNavigate(arrowNavigate);

      navigationService.navigate('/arrow-test');
      expect(arrowNavigate).toHaveBeenCalledWith('/arrow-test');
    });

    it('should handle setting navigate to a regular function', () => {
      const regularNavigate = vi.fn(function (path) {
        return path;
      });
      navigationService.setNavigate(regularNavigate);

      navigationService.navigate('/regular-test');
      expect(regularNavigate).toHaveBeenCalledWith('/regular-test');
    });

    it('should allow navigate to be called immediately after setNavigate', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);
      navigationService.navigate('/immediate');

      expect(mockNavigate).toHaveBeenCalledWith('/immediate');
    });

    it('should handle complex navigation options', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      const complexOptions = {
        state: {
          redirectUrl: '/previous',
          userData: { id: 123, name: 'Test' },
        },
        replace: true,
        preventScrollReset: true,
      };

      navigationService.navigate('/complex', complexOptions);
      expect(mockNavigate).toHaveBeenCalledWith('/complex', complexOptions);
    });

    it('should handle navigate with numeric parameter', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      navigationService.navigate(-1); // Go back
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should handle navigate with object parameter', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      const navObject = { pathname: '/test', search: '?tab=1' };
      navigationService.navigate(navObject);
      expect(mockNavigate).toHaveBeenCalledWith(navObject);
    });
  });

  describe('integration scenarios', () => {
    it('should work with react-router-dom navigate pattern', () => {
      const mockRouterNavigate = vi.fn();
      navigationService.setNavigate(mockRouterNavigate);

      // Simulate typical react-router usage
      navigationService.navigate('/login');
      navigationService.navigate('/dashboard', { replace: true });
      navigationService.navigate(-1); // Go back
      navigationService.navigate(1); // Go forward

      expect(mockRouterNavigate).toHaveBeenCalledTimes(4);
      expect(mockRouterNavigate).toHaveBeenNthCalledWith(1, '/login');
      expect(mockRouterNavigate).toHaveBeenNthCalledWith(2, '/dashboard', {
        replace: true,
      });
      expect(mockRouterNavigate).toHaveBeenNthCalledWith(3, -1);
      expect(mockRouterNavigate).toHaveBeenNthCalledWith(4, 1);
    });

    it('should allow programmatic navigation from apiClient interceptor', () => {
      const mockNavigate = vi.fn();
      navigationService.setNavigate(mockNavigate);

      // Simulate 401 error handler redirecting to login
      const handleUnauthorized = () => {
        navigationService.navigate('/login', {
          state: { redirectUrl: window.location.pathname },
        });
      };

      handleUnauthorized();
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { redirectUrl: window.location.pathname },
      });
    });

    it('should support navigation after state changes', () => {
      const firstNavigate = vi.fn();
      const secondNavigate = vi.fn();

      // Initially set navigate
      navigationService.setNavigate(firstNavigate);
      navigationService.navigate('/initial');

      // Update navigate (e.g., after remount or context change)
      navigationService.setNavigate(secondNavigate);
      navigationService.navigate('/updated');

      expect(firstNavigate).toHaveBeenCalledWith('/initial');
      expect(secondNavigate).toHaveBeenCalledWith('/updated');
    });
  });
});
