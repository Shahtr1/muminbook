import { RequestHandler } from 'express';
import appAssert from '../utils/appAssert.js';
import { FORBIDDEN, UNAUTHORIZED } from '../constants/http.js';
import AppErrorCode from '../constants/types/appErrorCode.js';
import { AccessTokenPayload, verifyToken } from '../utils/jwt.js';
import RoleType from '../constants/types/roleType.js';
import { PrimaryId } from '../constants/ids.js';

const authenticate = (isAdmin: boolean = false): RequestHandler => {
  return (req, res, next) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    appAssert(
      accessToken,
      UNAUTHORIZED,
      'Not authorized',
      AppErrorCode.InvalidAccessToken
    );

    const { error, payload } = verifyToken<AccessTokenPayload>(accessToken);
    appAssert(
      payload,
      UNAUTHORIZED,
      error === 'jwt expired' ? 'Token expired' : 'Invalid token',
      AppErrorCode.InvalidAccessToken
    );

    const hasValidRole =
      (payload.role === RoleType.User || payload.role === RoleType.Admin) &&
      (!isAdmin || payload.role === RoleType.Admin);

    appAssert(
      hasValidRole,
      FORBIDDEN,
      'Forbidden',
      AppErrorCode.ForbiddenAccessToken
    );

    req.role = payload.role;
    req.userId = payload.userId as PrimaryId;
    req.sessionId = payload.sessionId as PrimaryId;
    next();
  };
};

export default authenticate;
