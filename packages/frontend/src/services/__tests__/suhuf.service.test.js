import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as suhufService from '../suhuf.service.js';

// Mock the API client
vi.mock('@/config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import API from '@/config/apiClient.js';

describe('suhuf.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSuhuf', () => {
    it('should call API.post with correct endpoint and data', () => {
      const data = { name: 'New Suhuf', type: 'document' };
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledWith('/suhuf', data);
    });

    it('should call API.post exactly once', () => {
      const data = { name: 'Test' };
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.post', async () => {
      const data = { name: 'New Suhuf', content: 'Content' };
      const mockResponse = { id: '123', ...data, createdAt: '2024-01-01' };
      API.post.mockResolvedValue(mockResponse);

      const result = await suhufService.createSuhuf(data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle complex suhuf data', async () => {
      const data = {
        name: 'Complex Suhuf',
        type: 'quran',
        content: 'بِسْمِ اللَّهِ',
        metadata: {
          surah: 1,
          ayah: 1,
          translation: 'english',
        },
        config: {
          fontSize: 16,
          theme: 'dark',
        },
      };
      const mockResponse = { id: '456', ...data };
      API.post.mockResolvedValue(mockResponse);

      const result = await suhufService.createSuhuf(data);
      expect(result).toEqual(mockResponse);
      expect(result.metadata.surah).toBe(1);
      expect(result.config.theme).toBe('dark');
    });

    it('should handle empty data object', () => {
      const data = {};
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledWith('/suhuf', {});
    });

    it('should propagate errors from API.post', async () => {
      const error = new Error('Failed to create suhuf');
      API.post.mockRejectedValue(error);

      await expect(suhufService.createSuhuf({})).rejects.toThrow(
        'Failed to create suhuf'
      );
    });

    it('should handle validation errors', async () => {
      const error = new Error('Invalid suhuf data');
      API.post.mockRejectedValue(error);

      await expect(
        suhufService.createSuhuf({ invalid: 'data' })
      ).rejects.toThrow('Invalid suhuf data');
    });

    it('should return promise', () => {
      API.post.mockResolvedValue({});
      const result = suhufService.createSuhuf({});
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getSuhuf', () => {
    it('should call API.get with correct endpoint', () => {
      suhufService.getSuhuf('123');
      expect(API.get).toHaveBeenCalledWith('/suhuf/123');
    });

    it('should handle numeric id', () => {
      suhufService.getSuhuf(456);
      expect(API.get).toHaveBeenCalledWith('/suhuf/456');
    });

    it('should call API.get exactly once', () => {
      suhufService.getSuhuf('123');
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockSuhuf = {
        id: '123',
        name: 'My Suhuf',
        content: 'Suhuf content',
        type: 'document',
      };
      API.get.mockResolvedValue(mockSuhuf);

      const result = await suhufService.getSuhuf('123');
      expect(result).toEqual(mockSuhuf);
    });

    it('should return suhuf with complete data structure', async () => {
      const mockSuhuf = {
        id: '789',
        name: 'Quran Study',
        type: 'quran',
        content: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        metadata: {
          surah: 1,
          surahName: 'Al-Fatiha',
          ayahStart: 1,
          ayahEnd: 7,
        },
        config: {
          fontSize: 18,
          fontFamily: 'Amiri',
          theme: 'light',
          showTranslation: true,
          showTransliteration: false,
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-12-20',
        lastAccessed: '2024-12-25',
      };
      API.get.mockResolvedValue(mockSuhuf);

      const result = await suhufService.getSuhuf('789');
      expect(result).toEqual(mockSuhuf);
      expect(result.metadata.surahName).toBe('Al-Fatiha');
      expect(result.config.fontSize).toBe(18);
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Suhuf not found');
      API.get.mockRejectedValue(error);

      await expect(suhufService.getSuhuf('999')).rejects.toThrow(
        'Suhuf not found'
      );
    });

    it('should handle 404 error', async () => {
      const error = new Error('Not found');
      API.get.mockRejectedValue(error);

      await expect(suhufService.getSuhuf('nonexistent')).rejects.toThrow(
        'Not found'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized');
      API.get.mockRejectedValue(error);

      await expect(suhufService.getSuhuf('private')).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should return promise', () => {
      API.get.mockResolvedValue({});
      const result = suhufService.getSuhuf('123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle UUID format id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      suhufService.getSuhuf(uuid);
      expect(API.get).toHaveBeenCalledWith(`/suhuf/${uuid}`);
    });
  });

  describe('renameSuhuf', () => {
    it('should call API.patch with correct endpoint and data', () => {
      const data = { id: '123', name: 'Renamed Suhuf' };
      suhufService.renameSuhuf(data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/123/rename', data);
    });

    it('should handle numeric id', () => {
      const data = { id: 456, name: 'New Name' };
      suhufService.renameSuhuf(data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/456/rename', data);
    });

    it('should call API.patch exactly once', () => {
      const data = { id: '123', name: 'Test' };
      suhufService.renameSuhuf(data);
      expect(API.patch).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.patch', async () => {
      const data = { id: '123', name: 'Updated Name' };
      const mockResponse = { success: true, suhuf: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await suhufService.renameSuhuf(data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle additional data properties', async () => {
      const data = {
        id: '789',
        name: 'New Name',
        description: 'Updated description',
        tags: ['tag1', 'tag2'],
      };
      const mockResponse = { success: true, updated: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await suhufService.renameSuhuf(data);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from API.patch', async () => {
      const error = new Error('Failed to rename suhuf');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.renameSuhuf({ id: '123', name: 'New' })
      ).rejects.toThrow('Failed to rename suhuf');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Invalid name');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.renameSuhuf({ id: '123', name: '' })
      ).rejects.toThrow('Invalid name');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Suhuf not found');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.renameSuhuf({ id: 'nonexistent', name: 'Test' })
      ).rejects.toThrow('Suhuf not found');
    });

    it('should return promise', () => {
      API.patch.mockResolvedValue({});
      const result = suhufService.renameSuhuf({ id: '123', name: 'Test' });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('updateSuhufConfig', () => {
    it('should call API.patch with correct endpoint, id, and data', () => {
      const id = '123';
      const data = { fontSize: 16, theme: 'dark' };
      suhufService.updateSuhufConfig(id, data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/123/config', data);
    });

    it('should handle numeric id', () => {
      const id = 456;
      const data = { fontSize: 18 };
      suhufService.updateSuhufConfig(id, data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/456/config', data);
    });

    it('should call API.patch exactly once', () => {
      suhufService.updateSuhufConfig('123', { theme: 'light' });
      expect(API.patch).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.patch', async () => {
      const data = { fontSize: 20, theme: 'dark' };
      const mockResponse = { success: true, config: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await suhufService.updateSuhufConfig('123', data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle complex config data', async () => {
      const data = {
        fontSize: 18,
        fontFamily: 'Amiri',
        theme: 'sepia',
        lineHeight: 1.8,
        showTranslation: true,
        showTransliteration: false,
        translationLanguage: 'english',
        highlightColor: '#ffeb3b',
        enableNotes: true,
      };
      const mockResponse = { success: true, config: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await suhufService.updateSuhufConfig('789', data);
      expect(result).toEqual(mockResponse);
      expect(result.config.fontSize).toBe(18);
      expect(result.config.theme).toBe('sepia');
      expect(result.config.showTranslation).toBe(true);
    });

    it('should handle empty config object', () => {
      suhufService.updateSuhufConfig('123', {});
      expect(API.patch).toHaveBeenCalledWith('/suhuf/123/config', {});
    });

    it('should handle partial config updates', async () => {
      const data = { fontSize: 22 }; // Only updating fontSize
      const mockResponse = { success: true, config: data };
      API.patch.mockResolvedValue(mockResponse);

      const result = await suhufService.updateSuhufConfig('123', data);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from API.patch', async () => {
      const error = new Error('Failed to update config');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.updateSuhufConfig('123', { fontSize: 16 })
      ).rejects.toThrow('Failed to update config');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Invalid config values');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.updateSuhufConfig('123', { fontSize: -1 })
      ).rejects.toThrow('Invalid config values');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Suhuf not found');
      API.patch.mockRejectedValue(error);

      await expect(
        suhufService.updateSuhufConfig('nonexistent', { theme: 'dark' })
      ).rejects.toThrow('Suhuf not found');
    });

    it('should return promise', () => {
      API.patch.mockResolvedValue({});
      const result = suhufService.updateSuhufConfig('123', {});
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle UUID format id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const data = { theme: 'dark' };
      suhufService.updateSuhufConfig(uuid, data);
      expect(API.patch).toHaveBeenCalledWith(`/suhuf/${uuid}/config`, data);
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple createSuhuf calls independently', async () => {
      const data1 = { name: 'Suhuf 1' };
      const data2 = { name: 'Suhuf 2' };
      const mockResponse1 = { id: '1', ...data1 };
      const mockResponse2 = { id: '2', ...data2 };

      API.post
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [result1, result2] = await Promise.all([
        suhufService.createSuhuf(data1),
        suhufService.createSuhuf(data2),
      ]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(API.post).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple getSuhuf calls with different ids', async () => {
      const mockSuhuf1 = { id: '1', name: 'Suhuf 1' };
      const mockSuhuf2 = { id: '2', name: 'Suhuf 2' };

      API.get
        .mockResolvedValueOnce(mockSuhuf1)
        .mockResolvedValueOnce(mockSuhuf2);

      const [result1, result2] = await Promise.all([
        suhufService.getSuhuf('1'),
        suhufService.getSuhuf('2'),
      ]);

      expect(result1).toEqual(mockSuhuf1);
      expect(result2).toEqual(mockSuhuf2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed service calls', async () => {
      const createData = { name: 'New Suhuf' };
      const mockCreated = { id: '1', ...createData };
      const mockFetched = { id: '2', name: 'Existing Suhuf' };
      const renameData = { id: '3', name: 'Renamed' };
      const mockRenamed = { success: true };
      const configData = { fontSize: 16 };
      const mockConfigUpdated = { success: true };

      API.post.mockResolvedValueOnce(mockCreated);
      API.get.mockResolvedValueOnce(mockFetched);
      API.patch
        .mockResolvedValueOnce(mockRenamed)
        .mockResolvedValueOnce(mockConfigUpdated);

      const [created, fetched, renamed, configUpdated] = await Promise.all([
        suhufService.createSuhuf(createData),
        suhufService.getSuhuf('2'),
        suhufService.renameSuhuf(renameData),
        suhufService.updateSuhufConfig('4', configData),
      ]);

      expect(created).toEqual(mockCreated);
      expect(fetched).toEqual(mockFetched);
      expect(renamed).toEqual(mockRenamed);
      expect(configUpdated).toEqual(mockConfigUpdated);
      expect(API.post).toHaveBeenCalledTimes(1);
      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.patch).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in suhuf name', () => {
      const data = { name: 'Suhuf with special chars: @#$%^&*()' };
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledWith('/suhuf', data);
    });

    it('should handle Arabic text in suhuf name', () => {
      const data = { name: 'صحف القرآن الكريم' };
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledWith('/suhuf', data);
    });

    it('should handle very long suhuf names', () => {
      const longName = 'A'.repeat(1000);
      const data = { name: longName };
      suhufService.createSuhuf(data);
      expect(API.post).toHaveBeenCalledWith('/suhuf', data);
    });

    it('should handle null data properties', () => {
      const data = { id: '123', name: null };
      suhufService.renameSuhuf(data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/123/rename', data);
    });

    it('should handle undefined config values', () => {
      const data = { fontSize: undefined, theme: 'dark' };
      suhufService.updateSuhufConfig('123', data);
      expect(API.patch).toHaveBeenCalledWith('/suhuf/123/config', data);
    });
  });
});
