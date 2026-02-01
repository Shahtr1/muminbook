// noinspection JSUnusedGlobalSymbols

import { PrimaryId } from './src/constants/ids';

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
