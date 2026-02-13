import mongoose, { Document, Schema } from 'mongoose';

export interface ReadingDocument extends Document {
  uuid: string;
  label: string;
  coverColor: string;
  description: string;
  pageText: string;
  image: string;
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
    coverColor: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    pageText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

ReadingSchema.index({ uuid: 1 }, { unique: true });

const ReadingModel = mongoose.model<ReadingDocument>(
  'Reading',
  ReadingSchema,
  'readings'
);

export default ReadingModel;
