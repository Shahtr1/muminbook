import { PrimaryId } from '../constants/primaryId';
import UserModel from '../models/user.model';
import appAssert from './appAssert';
import { NOT_FOUND } from '../constants/http';

export const getUserId = async (req: any): Promise<PrimaryId> => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, 'User not found');
  return user._id as PrimaryId;
};
