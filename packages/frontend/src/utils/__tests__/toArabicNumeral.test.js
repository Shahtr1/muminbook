import { describe, it, expect } from 'vitest';
import { toArabicNumeral } from '../toArabicNumeral.js';

describe('toArabicNumeral', () => {
  it('should convert single digit number to Arabic numeral', () => {
    expect(toArabicNumeral(0)).toBe('٠');
    expect(toArabicNumeral(1)).toBe('١');
    expect(toArabicNumeral(5)).toBe('٥');
    expect(toArabicNumeral(9)).toBe('٩');
  });

  it('should convert multi-digit number to Arabic numerals', () => {
    expect(toArabicNumeral(10)).toBe('١٠');
    expect(toArabicNumeral(42)).toBe('٤٢');
    expect(toArabicNumeral(123)).toBe('١٢٣');
    expect(toArabicNumeral(999)).toBe('٩٩٩');
  });

  it('should handle three-digit numbers', () => {
    expect(toArabicNumeral(100)).toBe('١٠٠');
    expect(toArabicNumeral(456)).toBe('٤٥٦');
    expect(toArabicNumeral(789)).toBe('٧٨٩');
  });

  it('should handle large numbers', () => {
    expect(toArabicNumeral(1234)).toBe('١٢٣٤');
    expect(toArabicNumeral(56789)).toBe('٥٦٧٨٩');
    expect(toArabicNumeral(123456)).toBe('١٢٣٤٥٦');
  });

  it('should handle numbers with zeros', () => {
    expect(toArabicNumeral(101)).toBe('١٠١');
    expect(toArabicNumeral(1001)).toBe('١٠٠١');
    expect(toArabicNumeral(10010)).toBe('١٠٠١٠');
  });

  it('should convert string numbers to Arabic numerals', () => {
    expect(toArabicNumeral('7')).toBe('٧');
    expect(toArabicNumeral('25')).toBe('٢٥');
    expect(toArabicNumeral('114')).toBe('١١٤');
  });

  it('should handle edge case of zero', () => {
    expect(toArabicNumeral(0)).toBe('٠');
  });

  it('should convert all digits correctly', () => {
    expect(toArabicNumeral(1234567890)).toBe('١٢٣٤٥٦٧٨٩٠');
  });
});
