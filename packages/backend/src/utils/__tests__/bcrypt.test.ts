import { describe, it, expect } from 'vitest';
import { hashValue, compareValue } from '../bcrypt.js';

// Test data constants
const TEST_PASSWORD = 'TestPassword123!';
const WRONG_PASSWORD = 'WrongPassword456!';
const EMPTY_STRING = '';

describe('Bcrypt Utilities', () => {
  describe('hashValue', () => {
    it('should hash a password successfully', async () => {
      const hashed = await hashValue(TEST_PASSWORD);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(TEST_PASSWORD);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should create different hashes for same password', async () => {
      const hash1 = await hashValue(TEST_PASSWORD);
      const hash2 = await hashValue(TEST_PASSWORD);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compareValue', () => {
    it('should return true for matching password', async () => {
      const hashed = await hashValue(TEST_PASSWORD);

      const result = await compareValue(TEST_PASSWORD, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashed = await hashValue(TEST_PASSWORD);

      const result = await compareValue(WRONG_PASSWORD, hashed);
      expect(result).toBe(false);
    });

    it('should handle empty strings', async () => {
      const hashed = await hashValue(TEST_PASSWORD);

      const result = await compareValue(EMPTY_STRING, hashed);
      expect(result).toBe(false);
    });
  });
});
