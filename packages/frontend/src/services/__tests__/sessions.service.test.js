import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionsService from '../sessions.service.js';

// Mock the API client
vi.mock('../../config/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import API from '../../config/apiClient.js';

describe('sessions.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSessions', () => {
    it('should call API.get with correct endpoint', () => {
      sessionsService.getSessions();
      expect(API.get).toHaveBeenCalledWith('/admin/sessions');
    });

    it('should call API.get exactly once', () => {
      sessionsService.getSessions();
      expect(API.get).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.get', async () => {
      const mockSessions = [
        {
          id: '1',
          userId: 'user-123',
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          createdAt: '2024-01-01',
          expiresAt: '2024-01-02',
        },
        {
          id: '2',
          userId: 'user-456',
          userAgent: 'Chrome/91.0',
          ipAddress: '192.168.1.2',
          createdAt: '2024-01-02',
          expiresAt: '2024-01-03',
        },
      ];
      API.get.mockResolvedValue(mockSessions);

      const result = await sessionsService.getSessions();
      expect(result).toEqual(mockSessions);
    });

    it('should return empty array when no sessions exist', async () => {
      API.get.mockResolvedValue([]);

      const result = await sessionsService.getSessions();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return sessions with complete data structure', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-abc',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ipAddress: '203.0.113.42',
          location: {
            country: 'US',
            city: 'New York',
            region: 'NY',
          },
          device: {
            type: 'desktop',
            os: 'Windows 10',
            browser: 'Chrome',
          },
          isCurrentSession: true,
          lastActivityAt: '2024-12-25T10:30:00Z',
          createdAt: '2024-12-20T08:00:00Z',
          expiresAt: '2025-01-20T08:00:00Z',
        },
        {
          id: 'session-2',
          userId: 'user-abc',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userAgent: 'Mobile Safari',
          ipAddress: '203.0.113.43',
          location: {
            country: 'US',
            city: 'San Francisco',
            region: 'CA',
          },
          device: {
            type: 'mobile',
            os: 'iOS 15',
            browser: 'Safari',
          },
          isCurrentSession: false,
          lastActivityAt: '2024-12-24T15:20:00Z',
          createdAt: '2024-12-15T12:00:00Z',
          expiresAt: '2025-01-15T12:00:00Z',
        },
      ];
      API.get.mockResolvedValue(mockSessions);

      const result = await sessionsService.getSessions();
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(2);
      expect(result[0].isCurrentSession).toBe(true);
      expect(result[1].device.type).toBe('mobile');
      expect(result[0].location.city).toBe('New York');
    });

    it('should return single session', async () => {
      const mockSessions = [
        {
          id: '1',
          userId: 'user-1',
          userAgent: 'Chrome',
          ipAddress: '127.0.0.1',
        },
      ];
      API.get.mockResolvedValue(mockSessions);

      const result = await sessionsService.getSessions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should propagate errors from API.get', async () => {
      const error = new Error('Failed to fetch sessions');
      API.get.mockRejectedValue(error);

      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Failed to fetch sessions'
      );
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized - Admin access required');
      API.get.mockRejectedValue(error);

      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Unauthorized - Admin access required'
      );
    });

    it('should handle forbidden access', async () => {
      const error = new Error('Forbidden - Insufficient permissions');
      API.get.mockRejectedValue(error);

      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Forbidden - Insufficient permissions'
      );
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      API.get.mockRejectedValue(error);

      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle server errors', async () => {
      const error = new Error('Internal server error');
      API.get.mockRejectedValue(error);

      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return promise', () => {
      API.get.mockResolvedValue([]);
      const result = sessionsService.getSessions();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('deleteSession', () => {
    it('should call API.delete with correct endpoint and id', () => {
      sessionsService.deleteSession('session-123');
      expect(API.delete).toHaveBeenCalledWith('/admin/sessions/session-123');
    });

    it('should handle numeric id', () => {
      sessionsService.deleteSession(456);
      expect(API.delete).toHaveBeenCalledWith('/admin/sessions/456');
    });

    it('should call API.delete exactly once', () => {
      sessionsService.deleteSession('123');
      expect(API.delete).toHaveBeenCalledTimes(1);
    });

    it('should return the result from API.delete', async () => {
      const mockResponse = { success: true, deleted: true };
      API.delete.mockResolvedValue(mockResponse);

      const result = await sessionsService.deleteSession('123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle successful deletion with message', async () => {
      const mockResponse = {
        success: true,
        message: 'Session deleted successfully',
        sessionId: 'session-123',
      };
      API.delete.mockResolvedValue(mockResponse);

      const result = await sessionsService.deleteSession('session-123');
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('session-123');
    });

    it('should handle deletion response with no data', async () => {
      API.delete.mockResolvedValue(undefined);

      const result = await sessionsService.deleteSession('123');
      expect(result).toBeUndefined();
    });

    it('should handle empty object response', async () => {
      API.delete.mockResolvedValue({});

      const result = await sessionsService.deleteSession('123');
      expect(result).toEqual({});
    });

    it('should propagate errors from API.delete', async () => {
      const error = new Error('Failed to delete session');
      API.delete.mockRejectedValue(error);

      await expect(sessionsService.deleteSession('123')).rejects.toThrow(
        'Failed to delete session'
      );
    });

    it('should handle not found error', async () => {
      const error = new Error('Session not found');
      API.delete.mockRejectedValue(error);

      await expect(
        sessionsService.deleteSession('nonexistent')
      ).rejects.toThrow('Session not found');
    });

    it('should handle unauthorized deletion', async () => {
      const error = new Error('Unauthorized - Admin access required');
      API.delete.mockRejectedValue(error);

      await expect(sessionsService.deleteSession('protected')).rejects.toThrow(
        'Unauthorized - Admin access required'
      );
    });

    it('should handle forbidden deletion', async () => {
      const error = new Error('Forbidden - Cannot delete own session');
      API.delete.mockRejectedValue(error);

      await expect(
        sessionsService.deleteSession('own-session')
      ).rejects.toThrow('Forbidden - Cannot delete own session');
    });

    it('should handle server error during deletion', async () => {
      const error = new Error('Internal server error');
      API.delete.mockRejectedValue(error);

      await expect(sessionsService.deleteSession('123')).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should return promise', () => {
      API.delete.mockResolvedValue({});
      const result = sessionsService.deleteSession('123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle UUID format id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      sessionsService.deleteSession(uuid);
      expect(API.delete).toHaveBeenCalledWith(`/admin/sessions/${uuid}`);
    });

    it('should handle session token format', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      sessionsService.deleteSession(token);
      expect(API.delete).toHaveBeenCalledWith(`/admin/sessions/${token}`);
    });

    it('should handle MongoDB ObjectId format', () => {
      const objectId = '507f1f77bcf86cd799439011';
      sessionsService.deleteSession(objectId);
      expect(API.delete).toHaveBeenCalledWith(`/admin/sessions/${objectId}`);
    });
  });

  describe('concurrent calls', () => {
    it('should handle multiple getSessions calls independently', async () => {
      const mockSessions1 = [{ id: '1', userId: 'user-1' }];
      const mockSessions2 = [{ id: '2', userId: 'user-2' }];

      API.get
        .mockResolvedValueOnce(mockSessions1)
        .mockResolvedValueOnce(mockSessions2);

      const [result1, result2] = await Promise.all([
        sessionsService.getSessions(),
        sessionsService.getSessions(),
      ]);

      expect(result1).toEqual(mockSessions1);
      expect(result2).toEqual(mockSessions2);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple deleteSession calls with different ids', async () => {
      const mockResponse1 = { success: true, sessionId: '1' };
      const mockResponse2 = { success: true, sessionId: '2' };

      API.delete
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [result1, result2] = await Promise.all([
        sessionsService.deleteSession('1'),
        sessionsService.deleteSession('2'),
      ]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(API.delete).toHaveBeenCalledTimes(2);
      expect(API.delete).toHaveBeenNthCalledWith(1, '/admin/sessions/1');
      expect(API.delete).toHaveBeenNthCalledWith(2, '/admin/sessions/2');
    });

    it('should handle mixed service calls', async () => {
      const mockSessions = [{ id: '1', userId: 'user-1' }];
      const mockDeleteResponse = { success: true };

      API.get.mockResolvedValueOnce(mockSessions);
      API.delete.mockResolvedValueOnce(mockDeleteResponse);

      const [sessions, deleteResult] = await Promise.all([
        sessionsService.getSessions(),
        sessionsService.deleteSession('2'),
      ]);

      expect(sessions).toEqual(mockSessions);
      expect(deleteResult).toEqual(mockDeleteResponse);
      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.delete).toHaveBeenCalledTimes(1);
      expect(API.get).toHaveBeenCalledWith('/admin/sessions');
      expect(API.delete).toHaveBeenCalledWith('/admin/sessions/2');
    });

    it('should handle sequential operations', async () => {
      const mockSessions = [
        { id: '1', userId: 'user-1' },
        { id: '2', userId: 'user-2' },
      ];
      const mockDeleteResponse = { success: true };

      API.get.mockResolvedValue(mockSessions);
      API.delete.mockResolvedValue(mockDeleteResponse);

      // Get sessions first
      const sessions = await sessionsService.getSessions();
      expect(sessions).toHaveLength(2);

      // Then delete one
      const deleteResult = await sessionsService.deleteSession('1');
      expect(deleteResult.success).toBe(true);

      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle batch session deletions', async () => {
      const mockResponse = { success: true };
      API.delete.mockResolvedValue(mockResponse);

      const sessionIds = ['session-1', 'session-2', 'session-3'];
      const results = await Promise.all(
        sessionIds.map((id) => sessionsService.deleteSession(id))
      );

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      expect(API.delete).toHaveBeenCalledTimes(3);
    });

    it('should handle admin reviewing and cleaning sessions', async () => {
      const mockSessions = [
        { id: 'session-1', userId: 'user-1', expired: true },
        { id: 'session-2', userId: 'user-2', expired: true },
        { id: 'session-3', userId: 'user-3', expired: false },
      ];
      API.get.mockResolvedValue(mockSessions);

      // Get all sessions
      const sessions = await sessionsService.getSessions();

      // Delete expired sessions
      const expiredSessions = sessions.filter((s) => s.expired);
      const mockDeleteResponse = { success: true };
      API.delete.mockResolvedValue(mockDeleteResponse);

      const deleteResults = await Promise.all(
        expiredSessions.map((s) => sessionsService.deleteSession(s.id))
      );

      expect(deleteResults).toHaveLength(2);
      expect(API.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle getSessions returning null', async () => {
      API.get.mockResolvedValue(null);

      const result = await sessionsService.getSessions();
      expect(result).toBeNull();
    });

    it('should handle getSessions returning undefined', async () => {
      API.get.mockResolvedValue(undefined);

      const result = await sessionsService.getSessions();
      expect(result).toBeUndefined();
    });

    it('should handle deleteSession with empty string id', () => {
      sessionsService.deleteSession('');
      expect(API.delete).toHaveBeenCalledWith('/admin/sessions/');
    });

    it('should handle deleteSession with zero as id', () => {
      sessionsService.deleteSession(0);
      expect(API.delete).toHaveBeenCalledWith('/admin/sessions/0');
    });

    it('should handle sessions with minimal data', async () => {
      const mockSessions = [{ id: '1' }];
      API.get.mockResolvedValue(mockSessions);

      const result = await sessionsService.getSessions();
      expect(result[0]).toEqual({ id: '1' });
    });

    it('should handle sessions with nested complex data', async () => {
      const mockSessions = [
        {
          id: '1',
          metadata: {
            security: {
              twoFactorEnabled: true,
              lastPasswordChange: '2024-01-01',
              loginAttempts: [],
            },
            preferences: {
              notifications: {
                email: true,
                push: false,
              },
            },
          },
        },
      ];
      API.get.mockResolvedValue(mockSessions);

      const result = await sessionsService.getSessions();
      expect(result[0].metadata.security.twoFactorEnabled).toBe(true);
      expect(result[0].metadata.preferences.notifications.email).toBe(true);
    });

    it('should handle special characters in session id', () => {
      const id = 'session-123_special-chars.test';
      sessionsService.deleteSession(id);
      expect(API.delete).toHaveBeenCalledWith(`/admin/sessions/${id}`);
    });
  });

  describe('error recovery', () => {
    it('should allow retry after failed getSessions', async () => {
      const error = new Error('Network error');
      const mockSessions = [{ id: '1', userId: 'user-1' }];

      API.get.mockRejectedValueOnce(error).mockResolvedValueOnce(mockSessions);

      // First call fails
      await expect(sessionsService.getSessions()).rejects.toThrow(
        'Network error'
      );

      // Second call succeeds
      const result = await sessionsService.getSessions();
      expect(result).toEqual(mockSessions);
      expect(API.get).toHaveBeenCalledTimes(2);
    });

    it('should allow retry after failed deleteSession', async () => {
      const error = new Error('Network error');
      const mockResponse = { success: true };

      API.delete
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse);

      // First call fails
      await expect(sessionsService.deleteSession('1')).rejects.toThrow(
        'Network error'
      );

      // Second call succeeds
      const result = await sessionsService.deleteSession('1');
      expect(result).toEqual(mockResponse);
      expect(API.delete).toHaveBeenCalledTimes(2);
    });
  });
});
