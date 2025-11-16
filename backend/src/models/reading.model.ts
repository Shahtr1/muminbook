import mongoose, { Document, Schema } from "mongoose";

export interface ReadingDocument extends Document {
  uuid: string;
  label: string;
  color: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingSchema = new Schema<ReadingDocument>(
  {
    uuid: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

ReadingSchema.index({ uuid: 1 }, { unique: true });

const ReadingModel = mongoose.model<ReadingDocument>(
  "Reading",
  ReadingSchema,
  "readings",
);

export default ReadingModel;
