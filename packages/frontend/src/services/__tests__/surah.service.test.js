import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as surahService from '../surah.service.js';

// Mock the API client
vi.mock('@/config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
  },
}));

import API from '@/config/apiClient.js';

describe('surah.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSurahs', () => {
    it('should call API.get with correct endpoint', () => {
      surahService.getSurahs();
      expect(API.get).toHaveBeenCalledWith('/surahs');
    });

    it('should call API.get exactly once', () => {
      surahService.getSurahs();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockSurahs = [
        { id: 1, number: 1, name: 'Al-Fatiha', verses: 7 },
        { id: 2, number: 2, name: 'Al-Baqarah', verses: 286 },
      ];
      API.get.mockResolvedValue(mockSurahs);

      const result = await surahService.getSurahs();
      expect(result).toEqual(mockSurahs);
    });

    it('should return empty array when no surahs exist', async () => {
      API.get.mockResolvedValue([]);

      const result = await surahService.getSurahs();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return complete 114 surahs', async () => {
      const mockSurahs = Array.from({ length: 114 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        name: `Surah ${i + 1}`,
        verses: 10,
      }));
      API.get.mockResolvedValue(mockSurahs);

      const result = await surahService.getSurahs();
      expect(result).toHaveLength(114);
    });

    it('should return surahs with complete data structure', async () => {
      const mockSurahs = [
        {
          id: 1,
          number: 1,
          name: 'Al-Fatiha',
          nameArabic: 'الفاتحة',
          nameTranslation: 'The Opening',
          verses: 7,
          revelationType: 'Meccan',
          revelationOrder: 5,
        },
        {
          id: 2,
          number: 2,
          name: 'Al-Baqarah',
          nameArabic: 'البقرة',
          nameTranslation: 'The Cow',
          verses: 286,
          revelationType: 'Medinan',
          revelationOrder: 87,
        },
      ];
      API.get.mockResolvedValue(mockSurahs);

      const result = await surahService.getSurahs();
      expect(result).toEqual(mockSurahs);
      expect(result[0].nameArabic).toBe('الفاتحة');
      expect(result[1].verses).toBe(286);
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Failed to fetch surahs');
      API.get.mockRejectedValue(error);

      await expect(surahService.getSurahs()).rejects.toThrow(
        'Failed to fetch surahs'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized');
      API.get.mockRejectedValue(error);

      await expect(surahService.getSurahs()).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      API.get.mockRejectedValue(error);

      await expect(surahService.getSurahs()).rejects.toThrow('Network error');
    });

    it('should return promise', () => {
      API.get.mockResolvedValue([]);
      const result = surahService.getSurahs();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple getSurahs calls', async () => {
      const mockSurahs = [{ id: 1, name: 'Al-Fatiha' }];
      API.get.mockResolvedValue(mockSurahs);

      const [result1, result2] = await Promise.all([
        surahService.getSurahs(),
        surahService.getSurahs(),
      ]);

      expect(result1).toEqual(mockSurahs);
      expect(result2).toEqual(mockSurahs);
      expect(API.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('data integrity', () => {
    it('should preserve surah order', async () => {
      const mockSurahs = [
        { number: 1, name: 'Al-Fatiha' },
        { number: 2, name: 'Al-Baqarah' },
        { number: 3, name: 'Ali Imran' },
      ];
      API.get.mockResolvedValue(mockSurahs);

      const result = await surahService.getSurahs();
      expect(result[0].number).toBe(1);
      expect(result[1].number).toBe(2);
      expect(result[2].number).toBe(3);
    });

    it('should preserve Arabic text encoding', async () => {
      const arabicText = 'الفاتحة';
      const mockSurahs = [{ id: 1, nameArabic: arabicText }];
      API.get.mockResolvedValue(mockSurahs);

      const result = await surahService.getSurahs();
      expect(result[0].nameArabic).toBe(arabicText);
    });
  });
});
