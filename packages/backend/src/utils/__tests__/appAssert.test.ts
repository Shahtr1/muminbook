/**
 * @fileoverview AppAssert Utility Test Suite
 *
 * Tests the custom assertion utility that throws AppError when conditions fail.
 */

import { describe, expect, it } from 'vitest';
import appAssert from '../appAssert';
import AppError from '../AppError';
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
} from '../../constants/http';
import AppErrorCode from '../../constants/types/appErrorCode';

describe('appAssert', () => {
  describe('when condition is true', () => {
    it('should not throw an error', () => {
      expect(() => {
        appAssert(true, BAD_REQUEST, 'Should not throw');
      }).not.toThrow();
    });

    it('should not throw for truthy values', () => {
      expect(() => {
        appAssert(1, BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert('string', BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert({}, BAD_REQUEST, 'Should not throw');
      }).not.toThrow();

      expect(() => {
        appAssert([], BAD_REQUEST, 'Should not throw');
      }).not.toThrow();
    });
  });

  describe('when condition is false', () => {
    it('should throw AppError with correct status code and message', () => {
      expect(() => {
        appAssert(false, BAD_REQUEST, 'Invalid request parameter');
      }).toThrow(AppError);

      try {
        appAssert(false, BAD_REQUEST, 'Invalid request parameter');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(BAD_REQUEST);
        expect((error as AppError).message).toBe('Invalid request parameter');
      }
    });

    it('should throw AppError with custom error code', () => {
      try {
        appAssert(
          false,
          UNAUTHORIZED,
          'Unauthorized access',
          AppErrorCode.InvalidAccessToken
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(UNAUTHORIZED);
        expect((error as AppError).message).toBe('Unauthorized access');
        expect((error as AppError).errorCode).toBe(
          AppErrorCode.InvalidAccessToken
        );
      }
    });

    it('should throw for falsy values', () => {
      expect(() => {
        appAssert(false, BAD_REQUEST, 'False value');
      }).toThrow(AppError);

      expect(() => {
        appAssert(0, BAD_REQUEST, 'Zero value');
      }).toThrow(AppError);

      expect(() => {
        appAssert('', BAD_REQUEST, 'Empty string');
      }).toThrow(AppError);

      expect(() => {
        appAssert(null, BAD_REQUEST, 'Null value');
      }).toThrow(AppError);

      expect(() => {
        appAssert(undefined, BAD_REQUEST, 'Undefined value');
      }).toThrow(AppError);
    });
  });

  describe('common use cases', () => {
    it('should validate user existence', () => {
      const user = null;

      expect(() => {
        appAssert(user, NOT_FOUND, 'User not found');
      }).toThrow(AppError);
    });

    it('should validate authentication', () => {
      const isAuthenticated = false;

      expect(() => {
        appAssert(
          isAuthenticated,
          UNAUTHORIZED,
          'Not authenticated',
          AppErrorCode.InvalidAccessToken
        );
      }).toThrow(AppError);
    });

    it('should validate permissions', () => {
      const hasPermission = false;

      expect(() => {
        appAssert(hasPermission, FORBIDDEN, 'Insufficient permissions');
      }).toThrow(AppError);
    });
  });
});
