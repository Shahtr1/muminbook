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

const quranDocument = new Schema<QuranDocument>(
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

quranDocument.index({ uuid: 1 }, { unique: true });
quranDocument.index({ surahId: 1 });
quranDocument.index({ juzId: 1 });
quranDocument.index({ ruku: 1 });
quranDocument.index({ hizbQuarter: 1 });

const QuranModel = mongoose.model<QuranDocument>(
  'Quran',
  quranDocument,
  'quran'
);

export default QuranModel;
