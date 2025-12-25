import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RemoveTrailingSlash } from '../RemoveTrailingSlash.jsx';
import React from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RemoveTrailingSlash', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render without errors', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
  });

  it('should return null', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not navigate when on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate when path has trailing slash', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('should navigate for nested paths with trailing slash', () => {
    render(
      <MemoryRouter initialEntries={['/reading/documents/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/reading/documents', {
      replace: true,
    });
  });

  it('should not navigate when path has no trailing slash', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should not navigate for paths without trailing slash', () => {
    render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle multiple trailing slashes', () => {
    render(
      <MemoryRouter initialEntries={['/page//']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/page/', { replace: true });
  });

  it('should use replace navigation', () => {
    render(
      <MemoryRouter initialEntries={['/test/']}>
        <RemoveTrailingSlash />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ replace: true })
    );
  });
});
