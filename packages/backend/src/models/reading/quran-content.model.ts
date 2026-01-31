import mongoose, { Document, Schema } from 'mongoose';

export type QuranContentCategory = 'quran' | 'translation' | 'tafsir';

export interface QuranContentDocument extends Document {
  uuid: number; // references Quran.uuid
  category: QuranContentCategory; // quran | translation | tafsir
  source: string; // 'uthmani', 'sahih', 'ibn_kathir'
  locale: string; // 'ar', 'en', 'ur'
  text: string;
  footnotes?: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const quranContentSchema = new Schema<QuranContentDocument>(
  {
    uuid: { type: Number, required: true },

    category: {
      type: String,
      enum: ['quran', 'translation', 'tafsir'],
      required: true,
    },

    source: { type: String, required: true },
    locale: { type: String, required: true },
    text: { type: String, required: true },

    footnotes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent duplicate layers per ayah
quranContentSchema.index({ uuid: 1, category: 1, source: 1 }, { unique: true });

// Fast single-ayah sidebar loading
quranContentSchema.index({ uuid: 1 });

// Fast single-source reading queries
quranContentSchema.index({ category: 1, source: 1, uuid: 1 });

const QuranContentModel = mongoose.model<QuranContentDocument>(
  'QuranContent',
  quranContentSchema,
  'quran_content'
);

export default QuranContentModel;
