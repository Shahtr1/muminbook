import catchErrors from '../utils/catchErrors.js';
import SessionModel from '../models/session.model.js';
import { NOT_FOUND, OK } from '../constants/http.js';
import { z } from 'zod';
import appAssert from '../utils/appAssert.js';
import { UserDocument } from '../models/user.model.js';

// Not checked carefully yet
export const getSessionsHandler = catchErrors(async (req, res) => {
  const sessions = await SessionModel.find(
    {
      expiresAt: { $gt: new Date() },
    },
    { _id: 1, userAgent: 1, createdAt: 1 },
    { sort: { createdAt: -1 } }
  )
    .populate<{ userId: UserDocument | undefined }>('userId', 'email')
    .lean();

  const transformedSessions = sessions.map((session) => ({
    _id: session._id.toString(),
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    email: session.userId?.email || '',
    isCurrent: session._id.toString() === req.sessionId!.toString(),
  }));

  return res.status(OK).json(transformedSessions);
});

export const deleteSessionHandler = catchErrors(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const deleted = await SessionModel.findOneAndDelete({
    _id: sessionId,
  });

  appAssert(deleted, NOT_FOUND, 'Session not found');
  return res.status(OK).json({ message: 'Session removed' });
});
