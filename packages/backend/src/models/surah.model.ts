import mongoose, { Document, Schema } from 'mongoose';
import RevelationPlace from '../constants/enums/revelationPlace';

export interface SurahDocument extends Document {
  uuid: number;
  name: string; // Arabic name
  transliteration: string;
  meaning: string;
  revelationPlace: RevelationPlace;
  totalAyats: number;
  createdAt: Date;
  updatedAt: Date;
}

const surahSchema = new Schema<SurahDocument>(
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
    meaning: {
      type: String,
      required: true,
    },
    revelationPlace: {
      type: String,
      enum: Object.values(RevelationPlace),
      required: true,
    },
    totalAyats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

surahSchema.index({ uuid: 1 }, { unique: true });

const SurahModel = mongoose.model<SurahDocument>(
  'Surah',
  surahSchema,
  'surahs'
);

export default SurahModel;
