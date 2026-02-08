import { describe, it, expect } from 'vitest';
import { getPageTitleFromPath } from '../../App.jsx';

describe('getPageTitleFromPath', () => {
  it('returns "Home" for root path "/"', () => {
    expect(getPageTitleFromPath('/')).toBe('Home');
  });

  it('returns capitalized first segment for simple paths', () => {
    expect(getPageTitleFromPath('/dashboard')).toBe('Dashboard');
    expect(getPageTitleFromPath('/reading/my-files')).toBe('Reading');
    expect(getPageTitleFromPath('/features/family-tree')).toBe('Features');
  });

  it('handles trailing and multiple slashes', () => {
    expect(getPageTitleFromPath('///reading///my-files//')).toBe('Reading');
    expect(getPageTitleFromPath('/reading/')).toBe('Reading');
  });

  it('handles empty string and null/undefined inputs', () => {
    expect(getPageTitleFromPath('')).toBe('Home');
    expect(getPageTitleFromPath(null)).toBe('Home');
    expect(getPageTitleFromPath(undefined)).toBe('Home');
  });

  it('converts non-string inputs to string and extracts segment', () => {
    expect(getPageTitleFromPath(123)).toBe('123');
    // objects stringify to [object Object], first segment is that entire string
    expect(getPageTitleFromPath({})).toBe('[object Object]');
  });

  it('preserves casing after first character', () => {
    expect(getPageTitleFromPath('/iFRAME')).toBe('IFRAME');
    expect(getPageTitleFromPath('/iFrame/child')).toBe('IFrame');
  });

  it('handles many sub-parts by returning the first segment capitalized', () => {
    expect(getPageTitleFromPath('/a/b/c/d/e/f')).toBe('A');
    expect(getPageTitleFromPath('/reading/my-files/trash/more/deep')).toBe(
      'Reading'
    );
    expect(getPageTitleFromPath('////a////b////c')).toBe('A');
  });

  it('treats paths made only of slashes as root (Home)', () => {
    expect(getPageTitleFromPath('/////')).toBe('Home');
  });

  it('preserves internal punctuation of first segment (no humanization currently)', () => {
    expect(getPageTitleFromPath('/some-long-path/another')).toBe(
      'Some-long-path'
    );
  });
});
