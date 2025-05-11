import mongoose, { Document, Schema } from "mongoose";
import { PrimaryId } from "../constants/primaryId";

export interface QuranDocument extends Document {
  uuid: number;
  surahId: PrimaryId;
  ayat: string;
  audioUrl: string;
  juzId: PrimaryId;
  surahStart: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quranDocument = new Schema<QuranDocument>(
  {
    uuid: {
      type: Number,
      required: true,
      unique: true,
    },
    surahId: {
      type: Schema.Types.ObjectId,
      ref: "Surah",
      required: true,
      index: true,
    },
    ayat: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    juzId: {
      type: Schema.Types.ObjectId,
      ref: "Juz",
      required: true,
      index: true,
    },
    surahStart: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

quranDocument.index({ uuid: 1 }, { unique: true });

const QuranModel = mongoose.model<QuranDocument>(
  "Quran",
  quranDocument,
  "quran",
);

export default QuranModel;
