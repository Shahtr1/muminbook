import { describe, it, expect, beforeEach } from 'vitest';
import { decodeHTML } from '../decodeHTML.js';

describe('decodeHTML', () => {
  beforeEach(() => {
    // Clean up any leftover elements
    document.body.innerHTML = '';
  });

  it('should decode HTML entities to their characters', () => {
    expect(decodeHTML('&lt;')).toBe('<');
    expect(decodeHTML('&gt;')).toBe('>');
    expect(decodeHTML('&amp;')).toBe('&');
    expect(decodeHTML('&quot;')).toBe('"');
    expect(decodeHTML('&apos;')).toBe("'");
  });

  it('should decode multiple HTML entities in a string', () => {
    expect(decodeHTML('&lt;div&gt;Hello&lt;/div&gt;')).toBe('<div>Hello</div>');
    expect(decodeHTML('&quot;Hello World&quot;')).toBe('"Hello World"');
    expect(decodeHTML('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('should handle numeric HTML entities', () => {
    expect(decodeHTML('&#60;')).toBe('<');
    expect(decodeHTML('&#62;')).toBe('>');
    expect(decodeHTML('&#38;')).toBe('&');
  });

  it('should handle hexadecimal HTML entities', () => {
    expect(decodeHTML('&#x3C;')).toBe('<');
    expect(decodeHTML('&#x3E;')).toBe('>');
    expect(decodeHTML('&#x26;')).toBe('&');
  });

  it('should return empty string for null input', () => {
    expect(decodeHTML(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(decodeHTML(undefined)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(decodeHTML('')).toBe('');
  });

  it('should return unchanged string if no HTML entities present', () => {
    expect(decodeHTML('Hello World')).toBe('Hello World');
    expect(decodeHTML('Simple text')).toBe('Simple text');
    expect(decodeHTML('123')).toBe('123');
  });

  it('should handle mixed content with entities and regular text', () => {
    expect(decodeHTML('Click &quot;OK&quot; to continue')).toBe(
      'Click "OK" to continue'
    );
    expect(decodeHTML('5 &lt; 10 &amp; 10 &gt; 5')).toBe('5 < 10 & 10 > 5');
  });

  it('should decode special characters', () => {
    expect(decodeHTML('&copy;')).toBe('©');
    expect(decodeHTML('&reg;')).toBe('®');
    expect(decodeHTML('&euro;')).toBe('€');
  });

  it('should handle whitespace correctly', () => {
    expect(decodeHTML('&nbsp;')).toBe('\u00A0');
    expect(decodeHTML('Hello&nbsp;World')).toBe('Hello\u00A0World');
  });

  it('should decode complex HTML structures', () => {
    const input =
      '&lt;p class=&quot;text&quot;&gt;Hello &amp; Goodbye&lt;/p&gt;';
    const expected = '<p class="text">Hello & Goodbye</p>';
    expect(decodeHTML(input)).toBe(expected);
  });

  it('should handle long strings with multiple entities', () => {
    const input =
      '&lt;div&gt;&lt;span&gt;Text&lt;/span&gt;&amp;&lt;span&gt;More&lt;/span&gt;&lt;/div&gt;';
    const expected = '<div><span>Text</span>&<span>More</span></div>';
    expect(decodeHTML(input)).toBe(expected);
  });
});
