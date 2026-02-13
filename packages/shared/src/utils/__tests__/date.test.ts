import { describe, it, expect } from 'vitest';
import {
  oneYearFromNow,
  thirtyDaysFromNow,
  thirtyDaysAgo,
  fifteenMinutesFromNow,
  fiveMinutes,
  fiveMinutesAgo,
  oneMinuteAgo,
  oneHourFromNow,
  ONE_DAY_MS,
  isWithinLastDays,
} from '../date';

// Test data constants
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

describe('Date Utilities', () => {
  describe('Future date functions', () => {
    it('should return date one year from now', () => {
      const result = oneYearFromNow();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return date thirty days from now', () => {
      const result = thirtyDaysFromNow();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return date fifteen minutes from now', () => {
      const result = fifteenMinutesFromNow();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return date one hour from now', () => {
      const result = oneHourFromNow();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('Past date functions', () => {
    it('should return date thirty days ago', () => {
      const result = thirtyDaysAgo();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeLessThan(now.getTime());
    });

    it('should return date five minutes ago', () => {
      const result = fiveMinutesAgo();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeLessThan(now.getTime());
    });

    it('should return date one minute ago', () => {
      const result = oneMinuteAgo();
      const now = new Date();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeLessThan(now.getTime());
    });
  });

  describe('Time constants', () => {
    it('should return correct milliseconds for five minutes', () => {
      const result = fiveMinutes();

      expect(result).toBe(FIVE_MINUTES_IN_MS);
    });

    it('should have correct value for ONE_DAY_MS constant', () => {
      expect(ONE_DAY_MS).toBe(ONE_DAY_IN_MS);
    });
  });

  describe('isWithinLastDays', () => {
    it('should return true for date within given days', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * ONE_DAY_MS);

      const result = isWithinLastDays(twoDaysAgo, 5);

      expect(result).toBe(true);
    });

    it('should return false for date outside given days', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * ONE_DAY_MS);

      const result = isWithinLastDays(tenDaysAgo, 5);

      expect(result).toBe(false);
    });

    it('should return false for invalid date', () => {
      const result = isWithinLastDays('invalid-date', 5);

      expect(result).toBe(false);
    });
  });
});
