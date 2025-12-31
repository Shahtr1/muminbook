import mongoose from 'mongoose';
import RoleType from '../constants/enums_types/roleType';

export interface RoleDocument extends mongoose.Document {
  type: RoleType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new mongoose.Schema<RoleDocument>(
  {
    type: {
      type: String,
      enum: Object.values(RoleType),
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);

const roleModel = mongoose.model<RoleDocument>('Role', roleSchema);

export default roleModel;
