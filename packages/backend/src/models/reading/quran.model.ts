import mongoose, { Document, Schema } from 'mongoose';
import { PrimaryId } from '../../constants/primaryId';

export interface QuranDocument extends Document {
  uuid: number; // global canonical id (1–6236)
  surahId: PrimaryId;
  ayahNumber: number; // position inside surah
  juzId: PrimaryId; // you want separate Juz table
  manzil: number;
  ruku: number;
  hizbQuarter: number;
  surahStart: boolean;
  sajda: {
    recommended: boolean;
    obligatory: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const quranSchema = new Schema<QuranDocument>(
  {
    uuid: { type: Number, required: true, unique: true },

    surahId: {
      type: Schema.Types.ObjectId,
      ref: 'Surah',
      required: true,
    },

    ayahNumber: { type: Number, required: true },

    juzId: {
      type: Schema.Types.ObjectId,
      ref: 'Juz',
      required: true,
    },

    manzil: { type: Number, required: true },
    ruku: { type: Number, required: true },
    hizbQuarter: { type: Number, required: true },

    surahStart: { type: Boolean, default: false },

    sajda: {
      recommended: { type: Boolean, default: false },
      obligatory: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Structural reading indexes
quranSchema.index({ uuid: 1 }, { unique: true });
quranSchema.index({ surahId: 1, uuid: 1 });
quranSchema.index({ juzId: 1, uuid: 1 });
quranSchema.index({ manzil: 1, uuid: 1 });
quranSchema.index({ ruku: 1, uuid: 1 });
quranSchema.index({ hizbQuarter: 1, uuid: 1 });

const QuranModel = mongoose.model<QuranDocument>('Quran', quranSchema, 'quran');

export default QuranModel;
