import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as readingService from '../reading.service.js';

// Mock the API client
vi.mock('@/config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
  },
}));

import API from '@/config/apiClient.js';

describe('reading.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReadings', () => {
    it('should call API.get with correct endpoint', () => {
      readingService.getReadings();
      expect(API.get).toHaveBeenCalledWith('/readings');
    });

    it('should call API.get exactly once', () => {
      readingService.getReadings();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockReadings = [
        { id: '1', title: 'Reading 1', content: 'Content 1' },
        { id: '2', title: 'Reading 2', content: 'Content 2' },
      ];
      API.get.mockResolvedValue(mockReadings);

      const result = await readingService.getReadings();
      expect(result).toEqual(mockReadings);
    });

    it('should return empty array when no readings exist', async () => {
      API.get.mockResolvedValue([]);

      const result = await readingService.getReadings();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return readings with complete data structure', async () => {
      const mockReadings = [
        {
          id: '1',
          title: 'Quran Reading',
          type: 'quran',
          surah: 1,
          ayah: 1,
          juz: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-12-01',
          progress: 50,
        },
        {
          id: '2',
          title: 'Book Reading',
          type: 'book',
          pageNumber: 42,
          bookTitle: 'Islamic History',
          createdAt: '2024-02-01',
          progress: 75,
        },
      ];
      API.get.mockResolvedValue(mockReadings);

      const result = await readingService.getReadings();
      expect(result).toEqual(mockReadings);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('quran');
      expect(result[1].type).toBe('book');
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Failed to fetch readings');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReadings()).rejects.toThrow(
        'Failed to fetch readings'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReadings()).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReadings()).rejects.toThrow(
        'Network error'
      );
    });

    it('should return promise', () => {
      API.get.mockResolvedValue([]);
      const result = readingService.getReadings();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getReading', () => {
    it('should call API.get with correct endpoint and id', () => {
      readingService.getReading('123');
      expect(API.get).toHaveBeenCalledWith('/readings/123', {
        params: undefined,
      });
    });

    it('should handle numeric id', () => {
      readingService.getReading(456);
      expect(API.get).toHaveBeenCalledWith('/readings/456', {
        params: undefined,
      });
    });

    it('should call API.get with id and params', () => {
      const params = { includeNotes: true, expand: 'author' };
      readingService.getReading('789', params);
      expect(API.get).toHaveBeenCalledWith('/readings/789', { params });
    });

    it('should pass empty params object', () => {
      const params = {};
      readingService.getReading('abc', params);
      expect(API.get).toHaveBeenCalledWith('/readings/abc', { params: {} });
    });

    it('should handle complex params', () => {
      const params = {
        fields: ['title', 'content', 'author'],
        sort: 'createdAt',
        order: 'desc',
        includeMetadata: true,
      };
      readingService.getReading('xyz', params);
      expect(API.get).toHaveBeenCalledWith('/readings/xyz', { params });
    });

    it('should return the result from API.get', async () => {
      const mockReading = {
        id: '123',
        title: 'Single Reading',
        content: 'Reading content',
        author: 'Author Name',
      };
      API.get.mockResolvedValue(mockReading);

      const result = await readingService.getReading('123');
      expect(result).toEqual(mockReading);
    });

    it('should return reading with full details', async () => {
      const mockReading = {
        id: '456',
        title: 'Surah Al-Fatiha',
        type: 'quran',
        surah: 1,
        surahName: 'Al-Fatiha',
        ayahStart: 1,
        ayahEnd: 7,
        translation: 'English',
        transliteration: true,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        notes: ['Note 1', 'Note 2'],
        bookmarks: [1, 3, 7],
        createdAt: '2024-01-15',
        lastAccessed: '2024-12-20',
      };
      API.get.mockResolvedValue(mockReading);

      const result = await readingService.getReading('456', { expand: 'all' });
      expect(result).toEqual(mockReading);
      expect(result.surahName).toBe('Al-Fatiha');
      expect(result.notes).toHaveLength(2);
      expect(result.bookmarks).toEqual([1, 3, 7]);
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Reading not found');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReading('999')).rejects.toThrow(
        'Reading not found'
      );
    });

    it('should handle 404 error', async () => {
      const error = new Error('Not found');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReading('nonexistent')).rejects.toThrow(
        'Not found'
      );
    });

    it('should handle invalid params error', async () => {
      const error = new Error('Invalid query parameters');
      API.get.mockRejectedValue(error);

      await expect(
        readingService.getReading('123', { invalid: 'param' })
      ).rejects.toThrow('Invalid query parameters');
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized access');
      API.get.mockRejectedValue(error);

      await expect(readingService.getReading('private')).rejects.toThrow(
        'Unauthorized access'
      );
    });

    it('should return promise', () => {
      API.get.mockResolvedValue({});
      const result = readingService.getReading('123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call API.get exactly once', () => {
      readingService.getReading('123', { test: true });
      expect(API.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple getReadings calls independently', async () => {
      const mockReadings1 = [{ id: '1', title: 'Reading 1' }];
      const mockReadings2 = [{ id: '2', title: 'Reading 2' }];

      API.get
        .mockResolvedValueOnce(mockReadings1)
        .mockResolvedValueOnce(mockReadings2);

      const [result1, result2] = await Promise.all([
        readingService.getReadings(),
        readingService.getReadings(),
      ]);

      expect(result1).toEqual(mockReadings1);
      expect(result2).toEqual(mockReadings2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple getReading calls with different ids', async () => {
      const mockReading1 = { id: '1', title: 'Reading 1' };
      const mockReading2 = { id: '2', title: 'Reading 2' };

      API.get
        .mockResolvedValueOnce(mockReading1)
        .mockResolvedValueOnce(mockReading2);

      const [result1, result2] = await Promise.all([
        readingService.getReading('1'),
        readingService.getReading('2'),
      ]);

      expect(result1).toEqual(mockReading1);
      expect(result2).toEqual(mockReading2);
      expect(API.get).toHaveBeenCalledTimes(2);
      expect(API.get).toHaveBeenNthCalledWith(1, '/readings/1', {
        params: undefined,
      });
      expect(API.get).toHaveBeenNthCalledWith(2, '/readings/2', {
        params: undefined,
      });
    });

    it('should handle mixed service calls', async () => {
      const mockReadings = [{ id: '1', title: 'All Readings' }];
      const mockReading = { id: '1', title: 'Single Reading' };

      API.get
        .mockResolvedValueOnce(mockReadings)
        .mockResolvedValueOnce(mockReading);

      const [allResult, singleResult] = await Promise.all([
        readingService.getReadings(),
        readingService.getReading('1'),
      ]);

      expect(allResult).toEqual(mockReadings);
      expect(singleResult).toEqual(mockReading);
      expect(API.get).toHaveBeenCalledTimes(2);
      expect(API.get).toHaveBeenNthCalledWith(1, '/readings');
      expect(API.get).toHaveBeenNthCalledWith(2, '/readings/1', {
        params: undefined,
      });
    });

    it('should handle getReading calls with different params', async () => {
      const mockReading1 = { id: '1', title: 'Reading 1', expanded: false };
      const mockReading2 = { id: '1', title: 'Reading 1', expanded: true };

      API.get
        .mockResolvedValueOnce(mockReading1)
        .mockResolvedValueOnce(mockReading2);

      const [result1, result2] = await Promise.all([
        readingService.getReading('1'),
        readingService.getReading('1', { expand: 'all' }),
      ]);

      expect(result1).toEqual(mockReading1);
      expect(result2).toEqual(mockReading2);
      expect(API.get).toHaveBeenCalledTimes(2);
      expect(API.get).toHaveBeenNthCalledWith(1, '/readings/1', {
        params: undefined,
      });
      expect(API.get).toHaveBeenNthCalledWith(2, '/readings/1', {
        params: { expand: 'all' },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle getReading with null params', () => {
      readingService.getReading('123', null);
      expect(API.get).toHaveBeenCalledWith('/readings/123', { params: null });
    });

    it('should handle getReading with undefined params explicitly', () => {
      readingService.getReading('123', undefined);
      expect(API.get).toHaveBeenCalledWith('/readings/123', {
        params: undefined,
      });
    });

    it('should handle special characters in id', () => {
      readingService.getReading('reading-123-special_chars');
      expect(API.get).toHaveBeenCalledWith(
        '/readings/reading-123-special_chars',
        { params: undefined }
      );
    });

    it('should handle UUID format id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      readingService.getReading(uuid);
      expect(API.get).toHaveBeenCalledWith(`/readings/${uuid}`, {
        params: undefined,
      });
    });
  });
});
