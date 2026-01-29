import mongoose, { Document, Schema } from 'mongoose';
import { PrimaryId } from '../../constants/primaryId';

export interface QuranDocument extends Document {
  uuid: number;
  sno: number;
  surahId: PrimaryId;
  ayah: string;
  audioUrl: string;
  juzId: PrimaryId;
  surahStart: boolean;
  manzil: number;
  ruku: number;
  hizbQuarter: number;
  sajda: {
    recommended: boolean;
    obligatory: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const quranSchema = new Schema<QuranDocument>(
  {
    uuid: {
      type: Number,
      required: true,
    },
    sno: {
      type: Number,
      required: true,
    },
    surahId: {
      type: Schema.Types.ObjectId,
      ref: 'Surah',
      required: true,
    },
    ayah: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    juzId: {
      type: Schema.Types.ObjectId,
      ref: 'Juz',
      required: true,
    },
    surahStart: {
      type: Boolean,
      default: false,
    },
    manzil: {
      type: Number,
      required: true,
    },
    ruku: {
      type: Number,
      required: true,
    },
    hizbQuarter: {
      type: Number,
      required: true,
    },
    sajda: {
      recommended: { type: Boolean, default: false },
      obligatory: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

quranSchema.index({ uuid: 1 }, { unique: true });
quranSchema.index({ surahId: 1 });
quranSchema.index({ juzId: 1 });
quranSchema.index({ ruku: 1 });
quranSchema.index({ hizbQuarter: 1 });

const QuranModel = mongoose.model<QuranDocument>('Quran', quranSchema, 'quran');

export default QuranModel;
