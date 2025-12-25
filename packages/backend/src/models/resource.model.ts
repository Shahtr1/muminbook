import mongoose from 'mongoose';
import ResourceType from '../constants/enums/resourceType';
import { PrimaryId } from '../constants/primaryId';

export interface ResourceDocument extends mongoose.Document {
  userId: PrimaryId;
  name: string;
  type: ResourceType;
  path: string;
  parent?: PrimaryId | null;
  fileUrl?: string;
  contentType?: string;
  pinned: boolean;
  accessedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new mongoose.Schema<ResourceDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    path: { type: String, required: true, index: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
      index: true,
    },
    fileUrl: { type: String },
    contentType: { type: String },
    pinned: { type: Boolean, default: false },
    accessedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const ResourceModel = mongoose.model<ResourceDocument>(
  'Resource',
  resourceSchema
);

export default ResourceModel;
