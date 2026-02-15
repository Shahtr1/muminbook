// noinspection JSUnusedGlobalSymbols

import { PrimaryId } from './constants/ids.js';

declare global {
  namespace Express {
    interface Request {
      userId: PrimaryId | undefined;
      role: string | undefined;
      sessionId: PrimaryId | undefined;
    }
  }
}

export {};
