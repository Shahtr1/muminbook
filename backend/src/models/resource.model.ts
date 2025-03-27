import mongoose from "mongoose";
import ResourceType from "../constants/resourceType";

export interface ResourceDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: ResourceType;
  path: string;
  parent?: mongoose.Types.ObjectId | null;
  fileUrl?: string;
  contentType?: string;
  pinned: boolean;
  accessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new mongoose.Schema<ResourceDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    path: { type: String, required: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },
    fileUrl: { type: String },
    contentType: { type: String },
    pinned: { type: Boolean, default: false },
    accessedAt: { type: Date },
  },
  { timestamps: true },
);

const ResourceModel = mongoose.model<ResourceDocument>(
  "Resource",
  resourceSchema,
);

export default ResourceModel;
