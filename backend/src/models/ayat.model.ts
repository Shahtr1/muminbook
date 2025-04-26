import mongoose, { Document, Schema } from "mongoose";
import { PrimaryId } from "../constants/primaryId";

export interface AyatDocument extends Document {
  uuid: number;
  surahId: PrimaryId;
  ayat: string;
  audioUrl: string;
  juzId: PrimaryId;
  createdAt: Date;
  updatedAt: Date;
}

const ayatDocument = new Schema<AyatDocument>(
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
  },
  { timestamps: true },
);

ayatDocument.index({ uuid: 1 }, { unique: true });

const AyatModel = mongoose.model<AyatDocument>("Ayat", ayatDocument, "ayats");

export default AyatModel;
