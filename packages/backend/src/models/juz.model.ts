import mongoose, { Document, Schema } from 'mongoose';

export interface JuzDocument extends Document {
  uuid: number;
  name: string; //  Arabic name
  transliteration: string;
  createdAt: Date;
  updatedAt: Date;
}

const juzSchema = new Schema<JuzDocument>(
  {
    uuid: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    transliteration: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

juzSchema.index({ uuid: 1 }, { unique: true });

const JuzModel = mongoose.model<JuzDocument>('Juz', juzSchema, 'juz');

export default JuzModel;
