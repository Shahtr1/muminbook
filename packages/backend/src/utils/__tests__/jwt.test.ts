/**
 * @fileoverview JWT Utilities Test Suite
 *
 * Tests token signing and verification functionality for access and refresh tokens.
 * Environment variables are configured in vitest.setup.ts to prevent initialization errors.
 *
 * @see ../../vitest.setup.ts for environment setup
 */

import { describe, it, expect } from 'vitest';
import {
  signToken,
  verifyToken,
  accessTokenSignOptions,
  refreshTokenSignOptions,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../jwt.js';
import RoleType from '../../constants/types/roleType.js';
import { Types } from 'mongoose';

// Test data constants
const TEST_USER_ID_1 = '507f1f77bcf86cd799439011';
const TEST_USER_ID_2 = '507f1f77bcf86cd799439044';
const TEST_SESSION_ID_1 = '507f1f77bcf86cd799439022';
const TEST_SESSION_ID_2 = '507f1f77bcf86cd799439033';
const TEST_SESSION_ID_3 = '507f1f77bcf86cd799439055';
const INVALID_TOKEN = 'invalid.token.here';
const TAMPERED_SUFFIX = 'tampered';
const CUSTOM_EXPIRY = '1h' as const;

describe('JWT Utilities', () => {
  describe('signToken', () => {
    it('should create a valid JWT token with access token payload', () => {
      const payload: AccessTokenPayload = {
        userId: new Types.ObjectId(TEST_USER_ID_1),
        role: RoleType.Admin,
        sessionId: new Types.ObjectId(TEST_SESSION_ID_1),
      };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create refresh token with custom options', () => {
      const payload: RefreshTokenPayload = {
        sessionId: new Types.ObjectId(TEST_SESSION_ID_2),
      };
      const token = signToken(payload, refreshTokenSignOptions);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should create token with custom options', () => {
      const payload: AccessTokenPayload = {
        userId: new Types.ObjectId(TEST_USER_ID_1),
        role: RoleType.Admin,
        sessionId: new Types.ObjectId(TEST_SESSION_ID_1),
      };
      const customOptions = {
        ...accessTokenSignOptions,
        expiresIn: CUSTOM_EXPIRY,
      };
      const token = signToken(payload, customOptions);

      expect(token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid access token', () => {
      const userId = new Types.ObjectId(TEST_USER_ID_1);
      const sessionId = new Types.ObjectId(TEST_SESSION_ID_1);
      const payload: AccessTokenPayload = {
        userId,
        role: RoleType.Admin,
        sessionId,
      };
      const token = signToken(payload);

      const result = verifyToken<AccessTokenPayload>(token);

      expect(result.error).toBeNull();
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId.toString()).toBe(userId.toString());
      expect(result.payload?.role).toBe(RoleType.Admin);
      expect(result.payload?.sessionId.toString()).toBe(sessionId.toString());
    });

    it('should return error for invalid token', () => {
      const result = verifyToken(INVALID_TOKEN);

      expect(result.error).toBeDefined();
      expect(result.payload).toBeNull();
    });

    it('should return error for tampered token', () => {
      const payload: AccessTokenPayload = {
        userId: new Types.ObjectId(TEST_USER_ID_1),
        role: RoleType.Admin,
        sessionId: new Types.ObjectId(TEST_SESSION_ID_1),
      };
      const token = signToken(payload);
      const tamperedToken = token + TAMPERED_SUFFIX;

      const result = verifyToken(tamperedToken);

      expect(result.error).toBeDefined();
      expect(result.payload).toBeNull();
    });

    it('should verify refresh token with correct secret', () => {
      const sessionId = new Types.ObjectId(TEST_SESSION_ID_2);
      const payload: RefreshTokenPayload = {
        sessionId,
      };
      const token = signToken(payload, refreshTokenSignOptions);

      const result = verifyToken<RefreshTokenPayload>(token, {
        secret: refreshTokenSignOptions.secret,
      });

      expect(result.error).toBeNull();
      expect(result.payload).toBeDefined();
      expect(result.payload?.sessionId.toString()).toBe(sessionId.toString());
    });
  });

  describe('Token payload integrity', () => {
    it('should preserve all payload data', () => {
      const userId = new Types.ObjectId(TEST_USER_ID_2);
      const sessionId = new Types.ObjectId(TEST_SESSION_ID_3);
      const payload: AccessTokenPayload = {
        userId,
        role: RoleType.Admin,
        sessionId,
      };

      const token = signToken(payload);
      const result = verifyToken<AccessTokenPayload>(token);

      expect(result.error).toBeNull();
      expect(result.payload?.userId.toString()).toBe(userId.toString());
      expect(result.payload?.role).toBe(payload.role);
      expect(result.payload?.sessionId.toString()).toBe(sessionId.toString());
    });
  });
});
