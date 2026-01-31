import mongoose from 'mongoose';
import { PrimaryId } from '../constants/ids';

export interface UserRoleDocument extends mongoose.Document {
  userId: PrimaryId;
  roleId: PrimaryId;
  createdAt: Date;
  updatedAt: Date;
}

const userRoleSchema = new mongoose.Schema<UserRoleDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const UserRoleModel = mongoose.model<UserRoleDocument>(
  'UserRole',
  userRoleSchema,
  'user_roles'
);

export default UserRoleModel;
