import assert from 'node:assert';
import AppError from './AppError.js';
import { HttpStatusCode } from '../constants/http.js';
import AppErrorCode from '../constants/types/appErrorCode.js';

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Asserts a condition and throws in AppError if the condition is false
 */
const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
