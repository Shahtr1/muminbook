import { describe, it, expect } from 'vitest';
import {
  updateNavigationPath,
  getPreviousNonWindowPath,
} from '../updateNavigationPath.js';

describe('updateNavigationPath', () => {
  it('should update and track non-suhuf paths correctly', () => {
    // Test basic path update
    updateNavigationPath('/home');
    expect(getPreviousNonWindowPath()).toBe('/home');

    // Test path override
    updateNavigationPath('/dashboard');
    expect(getPreviousNonWindowPath()).toBe('/dashboard');
  });

  it('should not update previous pathname for suhuf paths', () => {
    updateNavigationPath('/features');
    const beforeSuhuf = getPreviousNonWindowPath();

    updateNavigationPath('/suhuf/123');
    expect(getPreviousNonWindowPath()).toBe(beforeSuhuf);
  });

  it('should not update previous pathname for nested suhuf paths', () => {
    updateNavigationPath('/reading');
    const beforeSuhuf = getPreviousNonWindowPath();

    updateNavigationPath('/suhuf/abc/def');
    expect(getPreviousNonWindowPath()).toBe(beforeSuhuf);
  });

  it('should handle multiple suhuf navigations while preserving previous path', () => {
    updateNavigationPath('/settings');
    const lastNonSuhuf = getPreviousNonWindowPath();

    updateNavigationPath('/suhuf/1');
    updateNavigationPath('/suhuf/2');
    updateNavigationPath('/suhuf/3');

    expect(getPreviousNonWindowPath()).toBe(lastNonSuhuf);
  });

  it('should update when navigating from suhuf to non-suhuf path', () => {
    updateNavigationPath('/suhuf/123');
    updateNavigationPath('/admin');
    expect(getPreviousNonWindowPath()).toBe('/admin');
  });

  it('should handle root path', () => {
    updateNavigationPath('/');
    expect(getPreviousNonWindowPath()).toBe('/');
  });

  it('should handle paths with query parameters', () => {
    updateNavigationPath('/dashboard?tab=overview');
    expect(getPreviousNonWindowPath()).toBe('/dashboard?tab=overview');
  });

  it('should handle paths with hash fragments', () => {
    updateNavigationPath('/profile#section');
    expect(getPreviousNonWindowPath()).toBe('/profile#section');
  });

  it('should handle case-sensitive suhuf paths', () => {
    updateNavigationPath('/about');
    expect(getPreviousNonWindowPath()).toBe('/about');

    // Capital S - should update previous because it's not "/suhuf"
    updateNavigationPath('/Suhuf/123');
    expect(getPreviousNonWindowPath()).toBe('/Suhuf/123');
  });

  it('should maintain previous path after suhuf navigation - idempotent', () => {
    updateNavigationPath('/contact');
    updateNavigationPath('/suhuf/456');

    expect(getPreviousNonWindowPath()).toBe('/contact');
    expect(getPreviousNonWindowPath()).toBe('/contact'); // Should be idempotent
  });

  it('should handle typical user navigation flow', () => {
    // User navigates to a page
    updateNavigationPath('/mypage');
    expect(getPreviousNonWindowPath()).toBe('/mypage');

    // User opens a suhuf window
    updateNavigationPath('/suhuf/window-1');
    expect(getPreviousNonWindowPath()).toBe('/mypage');

    // User opens another suhuf window
    updateNavigationPath('/suhuf/window-2');
    expect(getPreviousNonWindowPath()).toBe('/mypage');

    // User closes window and goes to another page
    updateNavigationPath('/newpage');
    expect(getPreviousNonWindowPath()).toBe('/newpage');
  });

  it('should handle back and forth navigation between pages and suhuf', () => {
    updateNavigationPath('/docs');
    expect(getPreviousNonWindowPath()).toBe('/docs');

    updateNavigationPath('/suhuf/doc1');
    expect(getPreviousNonWindowPath()).toBe('/docs');

    updateNavigationPath('/docs');
    expect(getPreviousNonWindowPath()).toBe('/docs');

    updateNavigationPath('/suhuf/doc2');
    expect(getPreviousNonWindowPath()).toBe('/docs');
  });
});
