import { PrimaryId } from '../constants/ids.js';
import UserModel from '../models/user.model.js';
import appAssert from './appAssert.js';
import { NOT_FOUND } from '../constants/http.js';

export const getUserId = async (req: any): Promise<PrimaryId> => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, 'User not found');
  return user._id as PrimaryId;
};
