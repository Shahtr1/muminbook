import mongoose from "mongoose";
import { PrimaryId } from "../constants/primaryId";

export interface SuhufDocument extends mongoose.Document {
  userId: PrimaryId;
  title: string;
  fileIds: PrimaryId[];
  activeFileId?: PrimaryId;
  createdAt: Date;
  updatedAt: Date;
}

const suhufSchema = new mongoose.Schema<SuhufDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Suhuf",
    },
    fileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: true,
      },
    ],
    activeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },
  },
  { timestamps: true },
);

const SuhufModel = mongoose.model<SuhufDocument>("Suhuf", suhufSchema, "Suhuf");

export default SuhufModel;
