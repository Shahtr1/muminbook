import { describe, it, expect } from "vitest";
import AppError from "../AppError";
import {
  BAD_REQUEST,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} from "../../constants/http";

// Test data constants
const TEST_ERROR_MESSAGE = "Test error";
const TEST_MESSAGE = "Test";
const NOT_FOUND_MESSAGE = "Not found";
const UNAUTHORIZED_MESSAGE = "Unauthorized";
const SERVER_ERROR_MESSAGE = "Server error";
const CUSTOM_ERROR_MESSAGE = "Custom error message";
const ERROR_NAME = "Error";
const APP_ERROR_STACK_TEXT = "AppError";

describe("AppError", () => {
  describe("Error creation", () => {
    it("should create error with message and status code", () => {
      const error = new AppError(BAD_REQUEST, TEST_ERROR_MESSAGE);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(TEST_ERROR_MESSAGE);
      expect(error.statusCode).toBe(BAD_REQUEST);
    });

    it("should create error with different status codes", () => {
      const notFoundError = new AppError(NOT_FOUND, NOT_FOUND_MESSAGE);
      const unauthorizedError = new AppError(
        UNAUTHORIZED,
        UNAUTHORIZED_MESSAGE,
      );
      const serverError = new AppError(
        INTERNAL_SERVER_ERROR,
        SERVER_ERROR_MESSAGE,
      );

      expect(notFoundError.statusCode).toBe(NOT_FOUND);
      expect(unauthorizedError.statusCode).toBe(UNAUTHORIZED);
      expect(serverError.statusCode).toBe(INTERNAL_SERVER_ERROR);
    });
  });

  describe("Error properties", () => {
    it("should have correct name property", () => {
      const error = new AppError(BAD_REQUEST, TEST_MESSAGE);
      expect(error.name).toBe(ERROR_NAME);
    });

    it("should capture stack trace", () => {
      const error = new AppError(BAD_REQUEST, TEST_MESSAGE);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain(APP_ERROR_STACK_TEXT);
    });
  });

  describe("Error throwing", () => {
    it("should be catchable in try-catch", () => {
      try {
        throw new AppError(BAD_REQUEST, TEST_ERROR_MESSAGE);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(BAD_REQUEST);
      }
    });

    it("should preserve message when caught", () => {
      try {
        throw new AppError(NOT_FOUND, CUSTOM_ERROR_MESSAGE);
      } catch (error) {
        expect((error as Error).message).toBe(CUSTOM_ERROR_MESSAGE);
      }
    });
  });
});
