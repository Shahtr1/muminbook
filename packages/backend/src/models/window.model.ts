import mongoose from 'mongoose';
import WindowType from '../constants/types/windowType.js';
import { PrimaryId } from '../constants/ids.js';
import './suhuf.model.js';

export interface WindowDocument extends mongoose.Document {
  userId: PrimaryId;
  type: WindowType;
  typeId: PrimaryId;
  createdAt: Date;
  updatedAt: Date;
}

const windowSchema = new mongoose.Schema<WindowDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(WindowType),
      required: true,
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type',
    },
  },
  { timestamps: true }
);

const WindowModel = mongoose.model<WindowDocument>(
  'Window',
  windowSchema,
  'windows'
);

export default WindowModel;
